"""
Integration Test Suite - Step 3: User Alert Creation
Tests that users can create price alerts successfully
"""

import pytest
from tests.test_helpers import APITestHelper


class TestUserAlertCreation:
    """Test suite for user alert creation functionality."""
    
    @pytest.fixture
    def api(self, authenticated_client):
        """Create API helper with authenticated client."""
        return APITestHelper(authenticated_client)
    
    def test_create_single_alert(self, api):
        """Test creating a single price alert."""
        # Arrange
        product_id = "PROD-001"
        target_price = 5000.0
        
        # Act
        status_code, response = api.create_alert(product_id, target_price)
        
        # Assert
        api.assert_response_ok(status_code, 201)
        assert response.get("productId") == product_id
        assert response.get("targetPrice") == target_price
        assert response.get("id") is not None
    
    def test_create_multiple_alerts_same_product(self, api):
        """Test creating multiple alerts for the same product at different prices."""
        # Arrange
        product_id = "PROD-002"
        prices = [4000.0, 5000.0, 6000.0]
        alert_ids = []
        
        # Act - Create multiple alerts
        for price in prices:
            status_code, response = api.create_alert(product_id, price)
            api.assert_response_ok(status_code, 201)
            alert_ids.append(response.get("id"))
        
        # Assert - Verify all were created
        assert len(alert_ids) == 3
        assert all(aid is not None for aid in alert_ids)
    
    def test_create_alerts_different_products(self, api):
        """Test creating alerts for different products."""
        # Arrange
        test_products = [
            ("PROD-003", 1500.0),
            ("PROD-004", 2500.0),
            ("PROD-005", 3500.0),
        ]
        
        # Act & Assert
        created_alerts = []
        for product_id, price in test_products:
            status_code, response = api.create_alert(product_id, price)
            api.assert_response_ok(status_code, 201)
            created_alerts.append({
                "product_id": product_id,
                "price": price,
                "alert_id": response.get("id")
            })
        
        assert len(created_alerts) == 3
    
    def test_alert_contains_required_fields(self, api):
        """Test that created alert has all required fields."""
        # Arrange
        product_id = "PROD-006"
        target_price = 7500.0
        
        # Act
        status_code, response = api.create_alert(product_id, target_price)
        api.assert_response_ok(status_code, 201)
        
        # Assert - All required fields present
        required_fields = ["id", "productId", "targetPrice", "status", "createdAt"]
        for field in required_fields:
            assert field in response, f"Missing field: {field}"
    
    def test_alert_default_status_active(self, api):
        """Test that alert is created with ACTIVE status by default."""
        # Arrange
        product_id = "PROD-007"
        target_price = 2000.0
        
        # Act
        status_code, response = api.create_alert(product_id, target_price)
        api.assert_response_ok(status_code, 201)
        
        # Assert
        assert response.get("status") == "ACTIVE"
    
    def test_cannot_create_duplicate_alert(self, api):
        """Test that duplicate alerts for same product/price are rejected."""
        # Arrange
        product_id = "PROD-008"
        target_price = 3000.0
        
        # Act - Create first alert (should succeed)
        status_code1, response1 = api.create_alert(product_id, target_price)
        api.assert_response_ok(status_code1, 201)
        
        # Act - Try to create duplicate (should fail)
        status_code2, response2 = api.create_alert(product_id, target_price)
        
        # Assert
        assert status_code2 == 409  # Conflict
    
    def test_create_alert_unauthenticated_fails(self, client):
        """Test that creating alert without authentication fails."""
        # Arrange
        api = APITestHelper(client)
        product_id = "PROD-009"
        target_price = 4000.0
        
        # Act
        status_code, response = api.create_alert(product_id, target_price)
        
        # Assert
        assert status_code == 401  # Unauthorized
    
    def test_create_alert_with_invalid_price_fails(self, api):
        """Test that creating alert with invalid price fails."""
        # Arrange
        product_id = "PROD-010"
        invalid_prices = [-100.0, 0.0, None]
        
        # Act & Assert
        for price in invalid_prices:
            if price is None:
                continue  # Skip None for this test
            status_code, response = api.create_alert(product_id, price)
            assert status_code in [400, 422]  # Bad request or validation error
    
    def test_alert_creation_incremental_ids(self, api):
        """Test that alert IDs increment correctly."""
        # Arrange & Act
        alert_id_1 = api.create_alert("PROD-011", 1000.0)[1].get("id")
        alert_id_2 = api.create_alert("PROD-012", 2000.0)[1].get("id")
        alert_id_3 = api.create_alert("PROD-013", 3000.0)[1].get("id")
        
        # Assert
        assert alert_id_2 > alert_id_1
        assert alert_id_3 > alert_id_2
