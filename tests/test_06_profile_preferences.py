"""
Integration Test Suite - Step 6: User Profile & Preferences Updates
Tests that user can update profile and preferences successfully
"""

import pytest
from tests.test_helpers import APITestHelper


class TestUserProfileUpdates:
    """Test suite for user profile update functionality."""
    
    @pytest.fixture
    def api(self, authenticated_client):
        """Create API helper with authenticated client."""
        return APITestHelper(authenticated_client)
    
    def test_get_initial_profile(self, api):
        """Test retrieving user's initial profile data."""
        # Act
        status_code, response = api.get_user_profile()
        
        # Assert
        api.assert_response_ok(status_code, 200)
        assert response.get("username") is not None
        assert response.get("email") is not None
    
    def test_update_user_full_name(self, api):
        """Test updating user's full name."""
        # Arrange
        new_name = "Updated User Name"
        
        # Act
        status_code, response = api.update_user_profile(full_name=new_name)
        api.assert_response_ok(status_code, 200)
        
        # Assert - Verify update
        status_code, profile = api.get_user_profile()
        assert profile.get("full_name") == new_name
    
    def test_update_user_email(self, api):
        """Test updating user's email address."""
        # Arrange
        new_email = "newemail@example.com"
        
        # Act
        status_code, response = api.update_user_profile(email=new_email)
        
        # Assert - If email update is allowed
        if status_code == 200:
            _, profile = api.get_user_profile()
            assert profile.get("email") == new_email
        else:
            # Email change might require verification
            assert status_code in [200, 202]
    
    def test_update_user_phone(self, api):
        """Test updating user's phone number."""
        # Arrange
        new_phone = "+1234567890"
        
        # Act
        status_code, response = api.update_user_profile(phone=new_phone)
        api.assert_response_ok(status_code, 200)
        
        # Assert
        _, profile = api.get_user_profile()
        assert profile.get("phone") == new_phone
    
    def test_update_multiple_profile_fields(self, api):
        """Test updating multiple profile fields at once."""
        # Arrange
        updates = {
            "full_name": "New Full Name",
            "phone": "+9876543210"
        }
        
        # Act
        status_code, response = api.update_user_profile(**updates)
        api.assert_response_ok(status_code, 200)
        
        # Assert
        _, profile = api.get_user_profile()
        assert profile.get("full_name") == updates["full_name"]
        assert profile.get("phone") == updates["phone"]
    
    def test_partial_update_preserves_other_fields(self, api):
        """Test that partial updates don't erase other fields."""
        # Arrange - Get current profile
        _, initial = api.get_user_profile()
        original_email = initial.get("email")
        
        # Update only name
        new_name = "Partial Update Name"
        api.update_user_profile(full_name=new_name)
        
        # Assert
        _, updated = api.get_user_profile()
        assert updated.get("full_name") == new_name
        assert updated.get("email") == original_email


class TestUserPreferencesUpdates:
    """Test suite for user preferences update functionality."""
    
    @pytest.fixture
    def api(self, authenticated_client):
        """Create API helper with authenticated client."""
        return APITestHelper(authenticated_client)
    
    def test_get_initial_preferences(self, api):
        """Test retrieving user's initial preferences."""
        # Act
        status_code, response = api.get_user_preferences()
        
        # Assert
        api.assert_response_ok(status_code, 200)
        assert response is not None
    
    def test_update_preferred_currency(self, api):
        """Test updating preferred currency preference."""
        # Arrange
        new_currency = "INR"
        
        # Act
        status_code, response = api.update_user_preferences(currency=new_currency)
        api.assert_response_ok(status_code, 200)
        
        # Assert
        _, prefs = api.get_user_preferences()
        assert prefs.get("currency") == new_currency
    
    def test_update_preferred_platforms(self, api):
        """Test updating list of preferred platforms."""
        # Arrange
        preferred_platforms = ["Amazon", "Flipkart", "Myntra"]
        
        # Act
        status_code, response = api.update_user_preferences(
            preferred_platforms=preferred_platforms
        )
        api.assert_response_ok(status_code, 200)
        
        # Assert
        _, prefs = api.get_user_preferences()
        assert set(prefs.get("preferred_platforms", [])) == set(preferred_platforms)
    
    def test_update_notification_preferences(self, api):
        """Test updating notification preferences."""
        # Arrange
        notification_prefs = {
            "email_alerts": True,
            "push_alerts": False,
            "daily_digest": True
        }
        
        # Act
        status_code, response = api.update_user_preferences(
            notifications=notification_prefs
        )
        api.assert_response_ok(status_code, 200)
        
        # Assert
        _, prefs = api.get_user_preferences()
        assert prefs.get("notifications") == notification_prefs
    
    def test_update_alert_threshold_preference(self, api):
        """Test updating alert threshold preference."""
        # Arrange
        threshold = 0.8
        
        # Act
        status_code, response = api.update_user_preferences(
            alert_threshold=threshold
        )
        api.assert_response_ok(status_code, 200)
        
        # Assert
        _, prefs = api.get_user_preferences()
        assert prefs.get("alert_threshold") == threshold
    
    def test_update_multiple_preferences_at_once(self, api):
        """Test updating multiple preferences simultaneously."""
        # Arrange
        updates = {
            "currency": "EUR",
            "preferred_platforms": ["Amazon", "eBay"],
            "theme": "dark",
            "language": "en"
        }
        
        # Act
        status_code, response = api.update_user_preferences(**updates)
        api.assert_response_ok(status_code, 200)
        
        # Assert
        _, prefs = api.get_user_preferences()
        for key, value in updates.items():
            if isinstance(value, list):
                assert set(prefs.get(key, [])) == set(value)
            else:
                assert prefs.get(key) == value
    
    def test_preferences_persisted_after_retrieval(self, api):
        """Test that preferences remain unchanged across multiple retrievals."""
        # Arrange
        original_updates = {"currency": "GBP", "theme": "light"}
        
        # Act - Update
        api.update_user_preferences(**original_updates)
        
        # Retrieve multiple times
        _, prefs1 = api.get_user_preferences()
        _, prefs2 = api.get_user_preferences()
        _, prefs3 = api.get_user_preferences()
        
        # Assert - All retrievals show same preferences
        assert prefs1.get("currency") == prefs2.get("currency") == prefs3.get("currency") == "GBP"
        assert prefs1.get("theme") == prefs2.get("theme") == prefs3.get("theme") == "light"
    
    def test_unauthenticated_cannot_update_preferences(self, client):
        """Test that unauthenticated users cannot update preferences."""
        # Arrange
        api = APITestHelper(client)
        
        # Act
        status_code, response = api.update_user_preferences(currency="USD")
        
        # Assert
        assert status_code == 401  # Unauthorized
    
    def test_invalid_preference_values_rejected(self, api):
        """Test that invalid preference values are rejected."""
        # Test invalid currency
        status_code, response = api.update_user_preferences(currency="INVALID")
        assert status_code in [400, 422]  # Bad request or validation error
