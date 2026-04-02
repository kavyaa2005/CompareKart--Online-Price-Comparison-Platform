"""
Integration Test Suite - Step 9: Logout/Login Persistence
Tests that user data persists correctly across logout and login cycles
"""

import pytest
from tests.test_helpers import APITestHelper


class TestLogoutLoginPersistence:
    """Test suite for data persistence across logout/login cycles."""
    
    @pytest.fixture
    def fresh_user_credentials(self):
        """Create fresh user credentials for each test."""
        import time
        timestamp = str(int(time.time() * 1000))
        return {
            "username": f"logout_user_{timestamp}",
            "email": f"logout_user_{timestamp}@example.com",
            "password": "Test@123456",
            "full_name": "Logout Test User"
        }
    
    def test_basic_logout_login_cycle(self, client, fresh_user_credentials):
        """Test basic logout and login cycle."""
        # Arrange
        api = APITestHelper(client)
        
        # Register user
        api.register(**fresh_user_credentials)
        
        # Act - Login
        status1, login1 = api.login(
            fresh_user_credentials["username"],
            fresh_user_credentials["password"]
        )
        api.assert_response_ok(status1, 200)
        token1 = login1.get("access_token") or login1.get("token")
        
        # Logout
        api.set_auth_header(token1)
        status_logout, _ = api.logout()
        api.assert_response_ok(status_logout, 200)
        
        # Login again
        api.clear_auth_header()
        status2, login2 = api.login(
            fresh_user_credentials["username"],
            fresh_user_credentials["password"]
        )
        api.assert_response_ok(status2, 200)
        token2 = login2.get("access_token") or login2.get("token")
        
        # Assert - Got new token
        assert token2 is not None
    
    def test_profile_persists_after_logout_login(self, client, fresh_user_credentials):
        """Test that profile data persists across logout/login."""
        # Arrange
        api = APITestHelper(client)
        api.register(**fresh_user_credentials)
        
        # Login and update profile
        _, login = api.login(
            fresh_user_credentials["username"],
            fresh_user_credentials["password"]
        )
        token = login.get("access_token") or login.get("token")
        api.set_auth_header(token)
        
        unique_name = "Test Persist Name"
        api.update_user_profile(full_name=unique_name)
        
        # Verify update
        _, profile_before = api.get_user_profile()
        assert profile_before.get("full_name") == unique_name
        
        # Logout
        api.logout()
        api.clear_auth_header()
        
        # Login again
        _, login2 = api.login(
            fresh_user_credentials["username"],
            fresh_user_credentials["password"]
        )
        token2 = login2.get("access_token") or login2.get("token")
        api.set_auth_header(token2)
        
        # Assert - Profile persisted
        _, profile_after = api.get_user_profile()
        assert profile_after.get("full_name") == unique_name
    
    def test_preferences_persist_after_logout_login(self, client, fresh_user_credentials):
        """Test that preferences persist across logout/login."""
        # Arrange & Setup
        api = APITestHelper(client)
        api.register(**fresh_user_credentials)
        
        _, login = api.login(
            fresh_user_credentials["username"],
            fresh_user_credentials["password"]
        )
        token = login.get("access_token") or login.get("token")
        api.set_auth_header(token)
        
        # Update preferences
        unique_currency = "CHF"
        api.update_user_preferences(currency=unique_currency)
        
        # Verify
        _, prefs_before = api.get_user_preferences()
        assert prefs_before.get("currency") == unique_currency
        
        # Logout and login again
        api.logout()
        api.clear_auth_header()
        
        _, login2 = api.login(
            fresh_user_credentials["username"],
            fresh_user_credentials["password"]
        )
        token2 = login2.get("access_token") or login2.get("token")
        api.set_auth_header(token2)
        
        # Assert
        _, prefs_after = api.get_user_preferences()
        assert prefs_after.get("currency") == unique_currency
    
    def test_alerts_persist_after_logout_login(self, client, fresh_user_credentials):
        """Test that all alerts persist across logout/login."""
        # Setup
        api = APITestHelper(client)
        api.register(**fresh_user_credentials)
        
        _, login = api.login(
            fresh_user_credentials["username"],
            fresh_user_credentials["password"]
        )
        token = login.get("access_token") or login.get("token")
        api.set_auth_header(token)
        
        # Create alerts
        alert_ids = []
        for i in range(3):
            _, response = api.create_alert(f"PROD-501-{i}", 1000.0 + (i * 100))
            alert_ids.append(response.get("id"))
        
        # Get alerts before logout
        _, before = api.get_user_alerts()
        before_alerts = before.get("alerts", [])
        before_count = len(before_alerts)
        
        # Logout
        api.logout()
        api.clear_auth_header()
        
        # Login again
        _, login2 = api.login(
            fresh_user_credentials["username"],
            fresh_user_credentials["password"]
        )
        token2 = login2.get("access_token") or login2.get("token")
        api.set_auth_header(token2)
        
        # Get alerts after login
        _, after = api.get_user_alerts()
        after_alerts = after.get("alerts", [])
        after_count = len(after_alerts)
        
        # Assert
        assert after_count == before_count
        for alert_id in alert_ids:
            assert any(a.get("id") == alert_id for a in after_alerts)
    
    def test_wishlist_persists_after_logout_login(self, client, fresh_user_credentials):
        """Test that wishlist persists across logout/login."""
        # Setup
        api = APITestHelper(client)
        api.register(**fresh_user_credentials)
        
        _, login = api.login(
            fresh_user_credentials["username"],
            fresh_user_credentials["password"]
        )
        token = login.get("access_token") or login.get("token")
        api.set_auth_header(token)
        
        # Add items to wishlist
        wishlist_items = ["PROD-502", "PROD-503", "PROD-504"]
        for product_id in wishlist_items:
            api.add_to_wishlist(product_id)
        
        # Get wishlist before logout
        _, before = api.get_wishlist()
        before_items = before.get("wishlist", before.get("items", []))
        
        # Logout
        api.logout()
        api.clear_auth_header()
        
        # Login again
        _, login2 = api.login(
            fresh_user_credentials["username"],
            fresh_user_credentials["password"]
        )
        token2 = login2.get("access_token") or login2.get("token")
        api.set_auth_header(token2)
        
        # Get wishlist after login
        _, after = api.get_wishlist()
        after_items = after.get("wishlist", after.get("items", []))
        
        # Assert
        assert len(after_items) >= len(wishlist_items)
        for product_id in wishlist_items:
            assert any(
                item.get("productId") == product_id or item == product_id
                for item in after_items
            )
    
    def test_multiple_logout_login_cycles(self, client, fresh_user_credentials):
        """Test multiple logout/login cycles maintain data."""
        # Setup
        api = APITestHelper(client)
        api.register(**fresh_user_credentials)
        
        # Create data across multiple cycles
        for cycle in range(3):
            # Login
            _, login = api.login(
                fresh_user_credentials["username"],
                fresh_user_credentials["password"]
            )
            token = login.get("access_token") or login.get("token")
            api.set_auth_header(token)
            
            # Add data
            api.create_alert(f"PROD-505-{cycle}", float(1000 + cycle * 100))
            api.add_to_wishlist(f"PROD-506-{cycle}")
            
            # Get data to verify
            _, alerts = api.get_user_alerts()
            _, wishlist = api.get_wishlist()
            
            alerts_list = alerts.get("alerts", [])
            wishlist_list = wishlist.get("wishlist", wishlist.get("items", []))
            
            # Should have cumulative data
            assert len(alerts_list) >= (cycle + 1)
            assert len(wishlist_list) >= (cycle + 1)
            
            # Logout
            api.logout()
            api.clear_auth_header()
    
    def test_old_token_invalid_after_logout(self, client, fresh_user_credentials):
        """Test that old token becomes invalid after logout."""
        # Setup
        api = APITestHelper(client)
        api.register(**fresh_user_credentials)
        
        _, login = api.login(
            fresh_user_credentials["username"],
            fresh_user_credentials["password"]
        )
        token_old = login.get("access_token") or login.get("token")
        api.set_auth_header(token_old)
        
        # Logout
        api.logout()
        
        # Try to use old token
        api.set_auth_header(token_old)
        status_code, response = api.get_user_profile()
        
        # Assert - Old token invalid
        assert status_code == 401  # Unauthorized
    
    def test_new_token_valid_after_login(self, client, fresh_user_credentials):
        """Test that new token is valid after login."""
        # Setup
        api = APITestHelper(client)
        api.register(**fresh_user_credentials)
        
        _, login = api.login(
            fresh_user_credentials["username"],
            fresh_user_credentials["password"]
        )
        token = login.get("access_token") or login.get("token")
        api.set_auth_header(token)
        
        # Use token
        status_code, response = api.get_user_profile()
        
        # Assert
        api.assert_response_ok(status_code, 200)
    
    def test_concurrent_sessions_isolated(self, client, fresh_user_credentials):
        """Test that concurrent login sessions are isolated."""
        # Setup
        api = APITestHelper(client)
        api.register(**fresh_user_credentials)
        
        # Create two sessions
        _, login1 = api.login(
            fresh_user_credentials["username"],
            fresh_user_credentials["password"]
        )
        token1 = login1.get("access_token") or login1.get("token")
        
        _, login2 = api.login(
            fresh_user_credentials["username"],
            fresh_user_credentials["password"]
        )
        token2 = login2.get("access_token") or login2.get("token")
        
        # Both tokens should be valid
        api.set_auth_header(token1)
        status1, _ = api.get_user_profile()
        
        api.set_auth_header(token2)
        status2, _ = api.get_user_profile()
        
        # Assert
        api.assert_response_ok(status1, 200)
        api.assert_response_ok(status2, 200)
    
    def test_logout_without_login_fails(self, client):
        """Test that logout without authentication fails."""
        # Arrange
        api = APITestHelper(client)
        
        # Act
        status_code, response = api.logout()
        
        # Assert
        assert status_code == 401  # Unauthorized
    
    def test_wrong_password_prevents_login(self, client, fresh_user_credentials):
        """Test that wrong password prevents login."""
        # Setup
        api = APITestHelper(client)
        api.register(**fresh_user_credentials)
        
        # Try to login with wrong password
        status_code, response = api.login(
            fresh_user_credentials["username"],
            "WrongPassword123"
        )
        
        # Assert
        assert status_code == 401  # Unauthorized
