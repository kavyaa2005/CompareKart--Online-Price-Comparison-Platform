"""
Utility functions for API integration testing
"""

from typing import Dict, Any, Optional, Tuple


class APITestHelper:
    """Helper class for common API testing operations."""
    
    def __init__(self, client):
        """Initialize helper with test client."""
        self.client = client
    
    def set_auth_header(self, token: str) -> None:
        """Set authorization header for authenticated requests."""
        self.client.headers = {"Authorization": f"Bearer {token}"}
    
    def clear_auth_header(self) -> None:
        """Clear authorization header."""
        self.client.headers = {}
    
    # ========== USER ALERTS ==========
    
    def create_alert(self, product_id: str, target_price: float) -> Tuple[int, Dict[str, Any]]:
        """
        Create a price alert for a product.
        Returns: (status_code, response_json)
        """
        payload = {
            "productId": product_id,
            "targetPrice": target_price
        }
        response = self.client.post("/user/alerts", json=payload)
        return response.status_code, response.json()
    
    def get_user_alerts(self) -> Tuple[int, Dict[str, Any]]:
        """
        Fetch all alerts for the logged-in user.
        Returns: (status_code, response_json)
        """
        response = self.client.get("/user/alerts")
        return response.status_code, response.json()
    
    def get_alert_by_id(self, alert_id: int) -> Tuple[int, Dict[str, Any]]:
        """Get specific alert details."""
        response = self.client.get(f"/user/alerts/{alert_id}")
        return response.status_code, response.json()
    
    def update_alert(self, alert_id: int, **kwargs) -> Tuple[int, Dict[str, Any]]:
        """
        Update an alert (target price, status, etc.).
        Returns: (status_code, response_json)
        """
        response = self.client.put(f"/user/alerts/{alert_id}", json=kwargs)
        return response.status_code, response.json()
    
    def delete_alert(self, alert_id: int) -> Tuple[int, Dict[str, Any]]:
        """Delete an alert."""
        response = self.client.delete(f"/user/alerts/{alert_id}")
        return response.status_code, response.json()
    
    # ========== USER PROFILE & PREFERENCES ==========
    
    def get_user_profile(self) -> Tuple[int, Dict[str, Any]]:
        """Get current user profile."""
        response = self.client.get("/user/profile")
        return response.status_code, response.json()
    
    def update_user_profile(self, **kwargs) -> Tuple[int, Dict[str, Any]]:
        """Update user profile information."""
        response = self.client.put("/user/profile", json=kwargs)
        return response.status_code, response.json()
    
    def get_user_preferences(self) -> Tuple[int, Dict[str, Any]]:
        """Get user preferences."""
        response = self.client.get("/user/preferences")
        return response.status_code, response.json()
    
    def update_user_preferences(self, **kwargs) -> Tuple[int, Dict[str, Any]]:
        """Update user preferences."""
        response = self.client.put("/user/preferences", json=kwargs)
        return response.status_code, response.json()
    
    # ========== USER WISHLIST ==========
    
    def get_wishlist(self) -> Tuple[int, Dict[str, Any]]:
        """Get user's wishlist."""
        response = self.client.get("/user/wishlist")
        return response.status_code, response.json()
    
    def add_to_wishlist(self, product_id: str) -> Tuple[int, Dict[str, Any]]:
        """Add item to wishlist."""
        payload = {"productId": product_id}
        response = self.client.post("/user/wishlist", json=payload)
        return response.status_code, response.json()
    
    def remove_from_wishlist(self, product_id: str) -> Tuple[int, Dict[str, Any]]:
        """Remove item from wishlist."""
        response = self.client.delete(f"/user/wishlist/{product_id}")
        return response.status_code, response.json()
    
    # ========== ADMIN OPERATIONS ==========
    
    def get_admin_settings(self) -> Tuple[int, Dict[str, Any]]:
        """Get admin settings (admin only)."""
        response = self.client.get("/admin/settings")
        return response.status_code, response.json()
    
    def update_admin_settings(self, **kwargs) -> Tuple[int, Dict[str, Any]]:
        """Update admin settings (admin only)."""
        response = self.client.put("/admin/settings", json=kwargs)
        return response.status_code, response.json()
    
    def get_activity_logs(self) -> Tuple[int, Dict[str, Any]]:
        """Fetch activity logs (admin only)."""
        response = self.client.get("/admin/activity-logs")
        return response.status_code, response.json()
    
    def get_user_activity_logs(self, user_id: int) -> Tuple[int, Dict[str, Any]]:
        """Get specific user's activity logs (admin only)."""
        response = self.client.get(f"/admin/activity-logs?user_id={user_id}")
        return response.status_code, response.json()
    
    # ========== AUTHENTICATION ==========
    
    def register(self, username: str, email: str, password: str, full_name: str, role: str = "user") -> Tuple[int, Dict[str, Any]]:
        """Register new user."""
        payload = {
            "username": username,
            "email": email,
            "password": password,
            "full_name": full_name,
            "role": role
        }
        response = self.client.post("/auth/register", json=payload)
        return response.status_code, response.json()
    
    def login(self, username: str, password: str) -> Tuple[int, Dict[str, Any]]:
        """Login user."""
        payload = {"username": username, "password": password}
        response = self.client.post("/auth/login", json=payload)
        return response.status_code, response.json()
    
    def logout(self) -> Tuple[int, Dict[str, Any]]:
        """Logout current user."""
        response = self.client.post("/auth/logout")
        return response.status_code, response.json()
    
    def get_current_user(self) -> Tuple[int, Dict[str, Any]]:
        """Get current authenticated user info."""
        response = self.client.get("/auth/me")
        return response.status_code, response.json()
    
    # ========== ASSERTIONS & HELPERS ==========
    
    def assert_response_ok(self, status_code: int, expected: int = 200) -> None:
        """Assert response status code."""
        assert status_code == expected, f"Expected {expected}, got {status_code}"
    
    def assert_alert_exists(self, alerts: list, product_id: str, target_price: float) -> Dict[str, Any]:
        """Assert alert exists in list and return it."""
        for alert in alerts:
            if alert.get("productId") == product_id and alert.get("targetPrice") == target_price:
                return alert
        raise AssertionError(f"Alert for {product_id} at {target_price} not found in {alerts}")
    
    def assert_alert_in_logs(self, logs: list, alert_id: int) -> Dict[str, Any]:
        """Assert alert activity is logged."""
        for log in logs:
            if log.get("entity_type") == "alert" and log.get("entity_id") == alert_id:
                return log
        raise AssertionError(f"Alert {alert_id} not found in activity logs")
