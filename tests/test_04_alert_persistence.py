"""
Integration Test Suite - Step 4: Alert Persistence in User Alerts
Tests that created alerts appear in user's alerts list and persist correctly
"""

import pytest
from tests.test_helpers import APITestHelper


class TestAlertPersistenceInUserAlerts:
    """Test suite for alert persistence in user alerts list."""
    
    @pytest.fixture
    def api(self, authenticated_client):
        """Create API helper with authenticated client."""
        return APITestHelper(authenticated_client)
    
    def test_alert_appears_in_user_alerts_after_creation(self, api):
        """Test that created alert shows up immediately in user's alerts list."""
        # Arrange
        product_id = "PROD-101"
        target_price = 5000.0
        
        # Act - Create alert
        status_create, alert_data = api.create_alert(product_id, target_price)
        api.assert_response_ok(status_create, 201)
        alert_id = alert_data.get("id")
        
        # Act - Fetch user's alerts
        status_list, alerts_response = api.get_user_alerts()
        
        # Assert
        api.assert_response_ok(status_list, 200)
        alerts_list = alerts_response.get("alerts", [])
        alert = api.assert_alert_exists(alerts_list, product_id, target_price)
        assert alert.get("id") == alert_id
    
    def test_multiple_alerts_all_persist(self, api):
        """Test that multiple alerts all persist in user's alerts list."""
        # Arrange
        test_alerts = [
            ("PROD-102", 1000.0),
            ("PROD-103", 2000.0),
            ("PROD-104", 3000.0),
            ("PROD-105", 4000.0),
        ]
        
        # Act - Create all alerts
        created_ids = []
        for product_id, price in test_alerts:
            _, response = api.create_alert(product_id, price)
            created_ids.append(response.get("id"))
        
        # Act - Fetch all alerts
        _, alerts_response = api.get_user_alerts()
        alerts_list = alerts_response.get("alerts", [])
        
        # Assert - All alerts present
        assert len(alerts_list) >= len(test_alerts)
        for product_id, price in test_alerts:
            api.assert_alert_exists(alerts_list, product_id, price)
    
    def test_alert_persists_after_retrieve(self, api):
        """Test that alert continues to exist after retrieval."""
        # Arrange
        product_id = "PROD-106"
        target_price = 2500.0
        
        # Act - Create and retrieve multiple times
        _, create_response = api.create_alert(product_id, target_price)
        alert_id = create_response.get("id")
        
        # First retrieval
        _, first_list = api.get_user_alerts()
        first_alerts = first_list.get("alerts", [])
        
        # Second retrieval
        _, second_list = api.get_user_alerts()
        second_alerts = second_list.get("alerts", [])
        
        # Assert - Alert exists in both retrievals
        assert any(a.get("id") == alert_id for a in first_alerts)
        assert any(a.get("id") == alert_id for a in second_alerts)
    
    def test_alert_details_persist_correctly(self, api):
        """Test that all alert details are correctly persisted."""
        # Arrange
        product_id = "PROD-107"
        target_price = 7500.0
        
        # Act
        _, create_response = api.create_alert(product_id, target_price)
        created_at = create_response.get("createdAt")
        status = create_response.get("status")
        
        # Retrieve from alerts list
        _, list_response = api.get_user_alerts()
        alerts = list_response.get("alerts", [])
        persisted_alert = api.assert_alert_exists(alerts, product_id, target_price)
        
        # Assert - Details match
        assert persisted_alert.get("productId") == product_id
        assert persisted_alert.get("targetPrice") == target_price
        assert persisted_alert.get("status") == status
        assert persisted_alert.get("createdAt") == created_at
    
    def test_get_specific_alert_by_id(self, api):
        """Test retrieving specific alert by ID."""
        # Arrange
        product_id = "PROD-108"
        target_price = 3500.0
        
        # Act - Create alert
        _, create_response = api.create_alert(product_id, target_price)
        alert_id = create_response.get("id")
        
        # Act - Retrieve specific alert
        status_code, response = api.get_alert_by_id(alert_id)
        
        # Assert
        api.assert_response_ok(status_code, 200)
        assert response.get("id") == alert_id
        assert response.get("productId") == product_id
        assert response.get("targetPrice") == target_price
    
    def test_alert_count_increments(self, api):
        """Test that alert count increases with each new alert."""
        # Arrange
        _, initial_response = api.get_user_alerts()
        initial_count = len(initial_response.get("alerts", []))
        
        # Act - Create new alert
        api.create_alert("PROD-109", 5000.0)
        
        # Retrieve again
        _, updated_response = api.get_user_alerts()
        updated_count = len(updated_response.get("alerts", []))
        
        # Assert
        assert updated_count == initial_count + 1
    
    def test_updated_alert_persists(self, api):
        """Test that updates to alert details persist."""
        # Arrange
        product_id = "PROD-110"
        target_price = 4000.0
        
        # Act - Create alert
        _, create_response = api.create_alert(product_id, target_price)
        alert_id = create_response.get("id")
        
        # Update the alert
        new_price = 3500.0
        _, update_response = api.update_alert(alert_id, targetPrice=new_price)
        
        # Retrieve again
        _, list_response = api.get_user_alerts()
        alerts = list_response.get("alerts", [])
        
        # Assert - Updated price is persisted
        updated_alert = next((a for a in alerts if a.get("id") == alert_id), None)
        assert updated_alert is not None
        assert updated_alert.get("targetPrice") == new_price
    
    def test_deleted_alert_no_longer_appears(self, api):
        """Test that deleted alert is removed from user's alerts."""
        # Arrange
        product_id = "PROD-111"
        target_price = 2000.0
        
        # Act - Create alert
        _, create_response = api.create_alert(product_id, target_price)
        alert_id = create_response.get("id")
        
        # Verify it exists
        _, before_delete = api.get_user_alerts()
        before_alerts = before_delete.get("alerts", [])
        assert any(a.get("id") == alert_id for a in before_alerts)
        
        # Delete the alert
        api.delete_alert(alert_id)
        
        # Verify it's gone
        _, after_delete = api.get_user_alerts()
        after_alerts = after_delete.get("alerts", [])
        assert not any(a.get("id") == alert_id for a in after_alerts)
    
    def test_empty_alerts_list_when_no_alerts(self, api, client):
        """Test that new user has empty alerts list."""
        # Create new user
        new_user = {
            "username": "newuser_noalerts",
            "email": "newuser_noalerts@example.com",
            "password": "Test@123456",
            "full_name": "New User"
        }
        
        # Register and login
        api.register(**new_user)
        _, login_response = api.login(new_user["username"], new_user["password"])
        token = login_response.get("access_token") or login_response.get("token")
        
        # Create new authenticated client
        new_client = client
        new_client.headers = {"Authorization": f"Bearer {token}"}
        new_api = APITestHelper(new_client)
        
        # Fetch alerts for new user
        _, response = new_api.get_user_alerts()
        alerts = response.get("alerts", [])
        
        # Assert
        assert len(alerts) == 0
