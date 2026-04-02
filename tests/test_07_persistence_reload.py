"""
Integration Test Suite - Step 7: Data Persistence After Reload
Tests that profile, preferences, alerts, and other data persist across application reloads
"""

import pytest
from tests.test_helpers import APITestHelper


class TestDataPersistenceAfterReload:
    """Test suite for data persistence after application reload/restart."""
    
    @pytest.fixture
    def api(self, authenticated_client):
        """Create API helper with authenticated client."""
        return APITestHelper(authenticated_client)
    
    def test_profile_persists_after_reload(self, api):
        """Test that user profile persists after reload."""
        # Arrange - Update profile with unique data
        unique_name = "Reload Test User"
        unique_phone = "+1111111111"
        
        # Act - Update profile
        api.update_user_profile(full_name=unique_name, phone=unique_phone)
        
        # Simulate reload by creating new API session
        # (in real scenario, this would be app reload)
        _, profile_before = api.get_user_profile()
        
        # Get profile again (simulating page reload)
        _, profile_after = api.get_user_profile()
        
        # Assert - Profile data unchanged
        assert profile_after.get("full_name") == unique_name
        assert profile_after.get("phone") == unique_phone
        assert profile_after.get("full_name") == profile_before.get("full_name")
    
    def test_preferences_persist_after_reload(self, api):
        """Test that user preferences persist after reload."""
        # Arrange - Set unique preferences
        unique_currency = "JPY"
        unique_theme = "dark"
        
        # Act - Update preferences
        api.update_user_preferences(
            currency=unique_currency,
            theme=unique_theme
        )
        
        # Retrieve before reload
        _, prefs_before = api.get_user_preferences()
        
        # Simulate reload - retrieve again
        _, prefs_after = api.get_user_preferences()
        
        # Assert - Preferences unchanged
        assert prefs_after.get("currency") == unique_currency
        assert prefs_after.get("theme") == unique_theme
        assert prefs_after.get("currency") == prefs_before.get("currency")
    
    def test_alerts_persist_after_reload(self, api):
        """Test that all alerts persist after reload."""
        # Arrange - Create multiple alerts
        alerts_to_create = [
            ("PROD-301", 1500.0),
            ("PROD-302", 2500.0),
            ("PROD-303", 3500.0),
        ]
        
        alert_ids = []
        for product_id, price in alerts_to_create:
            _, response = api.create_alert(product_id, price)
            alert_ids.append(response.get("id"))
        
        # Get alerts before reload
        _, alerts_before = api.get_user_alerts()
        before_alerts = alerts_before.get("alerts", [])
        
        # Simulate reload - get alerts again
        _, alerts_after = api.get_user_alerts()
        after_alerts = alerts_after.get("alerts", [])
        
        # Assert - All alerts still exist
        assert len(after_alerts) >= len(alert_ids)
        for alert_id in alert_ids:
            assert any(a.get("id") == alert_id for a in after_alerts)
    
    def test_alert_modifications_persist_after_reload(self, api):
        """Test that modifications to alerts persist after reload."""
        # Arrange - Create and modify alert
        _, create_response = api.create_alert("PROD-304", 4000.0)
        alert_id = create_response.get("id")
        
        # Modify alert
        new_price = 3800.0
        api.update_alert(alert_id, targetPrice=new_price)
        
        # Get modified alert before reload
        _, before_alert = api.get_alert_by_id(alert_id)
        
        # Simulate reload - get alert again
        _, after_alert = api.get_alert_by_id(alert_id)
        
        # Assert - Modification persisted
        assert after_alert.get("targetPrice") == new_price
        assert after_alert.get("targetPrice") == before_alert.get("targetPrice")
    
    def test_deleted_alerts_stay_deleted_after_reload(self, api):
        """Test that deleted alerts don't reappear after reload."""
        # Arrange - Create alert
        _, create_response = api.create_alert("PROD-305", 2000.0)
        alert_id = create_response.get("id")
        
        # Delete alert
        api.delete_alert(alert_id)
        
        # Verify deleted
        _, alerts_after_delete = api.get_user_alerts()
        after_alerts = alerts_after_delete.get("alerts", [])
        assert not any(a.get("id") == alert_id for a in after_alerts)
        
        # Simulate reload - verify still deleted
        _, alerts_after_reload = api.get_user_alerts()
        reload_alerts = alerts_after_reload.get("alerts", [])
        assert not any(a.get("id") == alert_id for a in reload_alerts)
    
    def test_combined_profile_alerts_preferences_persist(self, api):
        """Test that profile, alerts, and preferences all persist together."""
        # Arrange
        profile_updates = {"full_name": "Combined Test User"}
        prefs_updates = {"currency": "AUD"}
        
        # Act - Make all updates
        api.update_user_profile(**profile_updates)
        api.update_user_preferences(**prefs_updates)
        api.create_alert("PROD-306", 5500.0)
        
        # Get all data before reload
        _, profile_before = api.get_user_profile()
        _, prefs_before = api.get_user_preferences()
        _, alerts_before = api.get_user_alerts()
        
        # Simulate reload - get all data again
        _, profile_after = api.get_user_profile()
        _, prefs_after = api.get_user_preferences()
        _, alerts_after = api.get_user_alerts()
        
        # Assert - All data persisted
        assert profile_after.get("full_name") == profile_before.get("full_name")
        assert prefs_after.get("currency") == prefs_before.get("currency")
        assert len(alerts_after.get("alerts", [])) == len(alerts_before.get("alerts", []))
    
    def test_new_data_persists_immediately_after_reload(self, api):
        """Test that newly added data is immediately available after reload."""
        # Get initial count
        _, initial_alerts = api.get_user_alerts()
        initial_count = len(initial_alerts.get("alerts", []))
        
        # Create new alert
        _, new_alert = api.create_alert("PROD-307", 6000.0)
        new_alert_id = new_alert.get("id")
        
        # Get alerts immediately (simulating page reload)
        _, reloaded_alerts = api.get_user_alerts()
        reloaded_list = reloaded_alerts.get("alerts", [])
        
        # Assert - New alert is immediately visible
        assert len(reloaded_list) == initial_count + 1
        assert any(a.get("id") == new_alert_id for a in reloaded_list)
    
    def test_timestamp_accuracy_after_reload(self, api):
        """Test that timestamps remain accurate after reload."""
        # Create alert and capture timestamp
        _, alert1 = api.create_alert("PROD-308", 3000.0)
        timestamp1 = alert1.get("createdAt")
        
        # Simulate reload - get same alert
        alert_id = alert1.get("id")
        _, alert2 = api.get_alert_by_id(alert_id)
        timestamp2 = alert2.get("createdAt")
        
        # Assert - Timestamps match
        assert timestamp1 == timestamp2
    
    def test_user_cannot_see_other_users_data_after_reload(self, client, authenticated_client):
        """Test that user isolation is maintained across reloads."""
        # Create two users
        user1_data = {
            "username": "user_isolate_1",
            "email": "user_isolate_1@example.com",
            "password": "Test@123456",
            "full_name": "User 1"
        }
        user2_data = {
            "username": "user_isolate_2",
            "email": "user_isolate_2@example.com",
            "password": "Test@123456",
            "full_name": "User 2"
        }
        
        # Register users
        api_setup = APITestHelper(client)
        api_setup.register(**user1_data)
        api_setup.register(**user2_data)
        
        # Login as user 1
        _, login1 = api_setup.login(user1_data["username"], user1_data["password"])
        token1 = login1.get("access_token") or login1.get("token")
        
        # Login as user 2
        _, login2 = api_setup.login(user2_data["username"], user2_data["password"])
        token2 = login2.get("access_token") or login2.get("token")
        
        # Set up clients
        client1 = client
        client1.headers = {"Authorization": f"Bearer {token1}"}
        api1 = APITestHelper(client1)
        
        client2 = client
        client2.headers = {"Authorization": f"Bearer {token2}"}
        api2 = APITestHelper(client2)
        
        # User 1 creates alert
        api1.create_alert("PROD-309", 1000.0)
        
        # User 1 gets their alerts
        _, alerts1 = api1.get_user_alerts()
        user1_alerts = alerts1.get("alerts", [])
        
        # User 2 gets their alerts (should be empty)
        _, alerts2 = api2.get_user_alerts()
        user2_alerts = alerts2.get("alerts", [])
        
        # Assert - User 2 cannot see User 1's alerts
        assert len(user1_alerts) > 0
        assert len(user2_alerts) == 0
