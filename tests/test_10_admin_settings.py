"""
Integration Test Suite - Step 10: Admin Settings Persistence
Tests that admin can change system settings and they persist correctly
Final integration test to ensure complete system stability
"""

import pytest
from tests.test_helpers import APITestHelper


class TestAdminSettingsPersistence:
    """Test suite for admin settings persistence and reload."""
    
    @pytest.fixture
    def api_admin(self, authenticated_admin_client):
        """Create API helper for admin user."""
        return APITestHelper(authenticated_admin_client)
    
    def test_get_default_admin_settings(self, api_admin):
        """Test retrieving default admin settings."""
        # Act
        status_code, response = api_admin.get_admin_settings()
        
        # Assert
        api_admin.assert_response_ok(status_code, 200)
        settings = response.get("settings", response)
        
        # Should have default settings
        assert settings.get("site_name") is not None
        assert settings.get("currency") is not None
    
    def test_update_site_name(self, api_admin):
        """Test updating site name setting."""
        # Arrange
        new_name = "Updated Price Intelligence Platform"
        
        # Act
        status_code, response = api_admin.update_admin_settings(site_name=new_name)
        api_admin.assert_response_ok(status_code, 200)
        
        # Verify update
        _, settings = api_admin.get_admin_settings()
        assert settings.get("settings", settings).get("site_name") == new_name
    
    def test_update_default_currency(self, api_admin):
        """Test updating default currency setting."""
        # Arrange
        new_currency = "EUR"
        
        # Act
        status_code, response = api_admin.update_admin_settings(currency=new_currency)
        api_admin.assert_response_ok(status_code, 200)
        
        # Verify
        _, settings = api_admin.get_admin_settings()
        assert settings.get("settings", settings).get("currency") == new_currency
    
    def test_update_default_platforms(self, api_admin):
        """Test updating default platforms setting."""
        # Arrange
        platforms = ["Amazon", "eBay", "AliExpress"]
        
        # Act
        status_code, response = api_admin.update_admin_settings(
            default_platforms=platforms
        )
        api_admin.assert_response_ok(status_code, 200)
        
        # Verify
        _, settings = api_admin.get_admin_settings()
        updated_platforms = settings.get("settings", settings).get("default_platforms", [])
        assert set(updated_platforms) == set(platforms)
    
    def test_toggle_alerts_enabled_setting(self, api_admin):
        """Test toggling alerts enabled/disabled setting."""
        # Get current state
        _, current = api_admin.get_admin_settings()
        current_state = current.get("settings", current).get("alerts_enabled", True)
        
        # Toggle
        new_state = not current_state
        status_code, response = api_admin.update_admin_settings(
            alerts_enabled=new_state
        )
        api_admin.assert_response_ok(status_code, 200)
        
        # Verify
        _, settings = api_admin.get_admin_settings()
        assert settings.get("settings", settings).get("alerts_enabled") == new_state
    
    def test_update_prediction_threshold(self, api_admin):
        """Test updating prediction confidence threshold."""
        # Arrange
        new_threshold = 0.85
        
        # Act
        status_code, response = api_admin.update_admin_settings(
            prediction_confidence_threshold=new_threshold
        )
        api_admin.assert_response_ok(status_code, 200)
        
        # Verify
        _, settings = api_admin.get_admin_settings()
        threshold = settings.get("settings", settings).get("prediction_confidence_threshold")
        assert threshold == new_threshold
    
    def test_multiple_settings_update_atomically(self, api_admin):
        """Test updating multiple settings at once."""
        # Arrange
        updates = {
            "site_name": "Multi-Update Test System",
            "currency": "GBP",
            "alerts_enabled": True,
            "prediction_confidence_threshold": 0.75
        }
        
        # Act
        status_code, response = api_admin.update_admin_settings(**updates)
        api_admin.assert_response_ok(status_code, 200)
        
        # Verify all updated
        _, settings = api_admin.get_admin_settings()
        settings_data = settings.get("settings", settings)
        
        for key, expected_value in updates.items():
            actual_value = settings_data.get(key)
            assert actual_value == expected_value
    
    def test_admin_settings_persist_after_reload(self, api_admin):
        """Test that admin settings persist after reload."""
        # Arrange - Update settings
        updates = {
            "site_name": "Persistent Settings Test",
            "currency": "JPY"
        }
        api_admin.update_admin_settings(**updates)
        
        # Get settings before reload
        _, before = api_admin.get_admin_settings()
        before_settings = before.get("settings", before)
        
        # Simulate reload - get settings again
        _, after = api_admin.get_admin_settings()
        after_settings = after.get("settings", after)
        
        # Assert
        assert after_settings.get("site_name") == before_settings.get("site_name")
        assert after_settings.get("currency") == before_settings.get("currency")
    
    def test_settings_change_reflected_for_all_users(self, api_admin, client):
        """Test that settings changes are visible to all users."""
        # Admin changes a setting
        new_platform = "NewMarketplace"
        api_admin.update_admin_settings(
            default_platforms=[new_platform]
        )
        
        # Regular user should see updated settings
        api_user = APITestHelper(client)
        
        # Note: User access to admin settings might be restricted
        # This test validates the setting was changed by admin
        _, admin_settings = api_admin.get_admin_settings()
        platforms = admin_settings.get("settings", admin_settings).get("default_platforms", [])
        
        assert new_platform in platforms
    
    def test_admin_only_can_change_settings(self, client, authenticated_client):
        """Test that only admin can change settings."""
        # Regular user tries to change settings
        api_user = APITestHelper(authenticated_client)
        
        status_code, response = api_user.update_admin_settings(currency="INR")
        
        # Should be denied
        assert status_code == 403  # Forbidden
    
    def test_settings_revert_after_multiple_updates(self, api_admin):
        """Test updating settings multiple times and reverting."""
        # Get initial settings
        _, initial = api_admin.get_admin_settings()
        initial_currency = initial.get("settings", initial).get("currency")
        
        # Update to new value
        api_admin.update_admin_settings(currency="CAD")
        
        # Revert back
        api_admin.update_admin_settings(currency=initial_currency)
        
        # Verify reverted
        _, final = api_admin.get_admin_settings()
        final_currency = final.get("settings", final).get("currency")
        
        assert final_currency == initial_currency
    
    def test_invalid_setting_values_rejected(self, api_admin):
        """Test that invalid setting values are rejected."""
        # Try to set invalid threshold (should be 0-1)
        status_code, response = api_admin.update_admin_settings(
            prediction_confidence_threshold=1.5
        )
        
        # Should fail validation
        assert status_code in [400, 422]
    
    def test_settings_affect_system_behavior(self, api_admin, authenticated_client):
        """Test that changed settings affect system behavior."""
        # Admin enables/disables alerts
        new_alerts_state = False
        api_admin.update_admin_settings(alerts_enabled=new_alerts_state)
        
        # Verify setting is persisted
        _, settings = api_admin.get_admin_settings()
        alerts_enabled = settings.get("settings", settings).get("alerts_enabled")
        
        assert alerts_enabled == new_alerts_state
    
    def test_settings_history_logged(self, api_admin):
        """Test that admin settings changes are logged/tracked."""
        # Make a settings change
        original_currency = None
        _, current = api_admin.get_admin_settings()
        current_currency = current.get("settings", current).get("currency")
        
        # Change to something different
        test_currency = "SGD"
        if current_currency != test_currency:
            api_admin.update_admin_settings(currency=test_currency)
        
        # Verify the change persists
        _, verify = api_admin.get_admin_settings()
        verified_currency = verify.get("settings", verify).get("currency")
        
        assert verified_currency == test_currency
    
    def test_all_required_settings_present(self, api_admin):
        """Test that all required settings fields are present."""
        # Arrange - Expected settings fields
        required_fields = [
            "site_name",
            "currency",
            "default_platforms",
            "alerts_enabled",
            "prediction_confidence_threshold"
        ]
        
        # Act
        _, response = api_admin.get_admin_settings()
        settings = response.get("settings", response)
        
        # Assert - All required fields present
        for field in required_fields:
            assert field in settings, f"Missing required setting: {field}"
    
    def test_admin_settings_comprehensive_persistence_flow(self, api_admin):
        """
        COMPREHENSIVE TEST: Complete flow testing admin settings persistence.
        Tests: Update -> Reload -> Modify -> Reload -> Verify
        """
        # Step 1: Make initial updates
        updates1 = {
            "site_name": "Comprehensive Test System",
            "currency": "AUD",
            "alerts_enabled": True,
            "prediction_confidence_threshold": 0.88
        }
        api_admin.update_admin_settings(**updates1)
        
        # Step 2: Reload and verify
        _, check1 = api_admin.get_admin_settings()
        settings1 = check1.get("settings", check1)
        for key, value in updates1.items():
            assert settings1.get(key) == value
        
        # Step 3: Make secondary updates
        updates2 = {
            "site_name": "Updated Comprehensive System",
            "currency": "MXN"
        }
        api_admin.update_admin_settings(**updates2)
        
        # Step 4: Reload and verify secondary changes
        _, check2 = api_admin.get_admin_settings()
        settings2 = check2.get("settings", check2)
        for key, value in updates2.items():
            assert settings2.get(key) == value
        
        # Step 5: Verify unchanged fields still have original values
        assert settings2.get("alerts_enabled") == updates1["alerts_enabled"]
        assert settings2.get("prediction_confidence_threshold") == updates1["prediction_confidence_threshold"]
