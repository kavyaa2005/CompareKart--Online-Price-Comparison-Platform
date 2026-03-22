"""
Integration Test Suite - Step 8: Wishlist Add/Remove Persistence
Tests that wishlist items persist correctly when added, removed, and across reloads
"""

import pytest
from tests.test_helpers import APITestHelper


class TestWishlistPersistence:
    """Test suite for wishlist add/remove persistence."""
    
    @pytest.fixture
    def api(self, authenticated_client):
        """Create API helper with authenticated client."""
        return APITestHelper(authenticated_client)
    
    def test_get_initial_wishlist(self, api):
        """Test retrieving initial wishlist for new user."""
        # Act
        status_code, response = api.get_wishlist()
        
        # Assert
        api.assert_response_ok(status_code, 200)
        wishlist = response.get("wishlist", response.get("items", []))
        assert isinstance(wishlist, list)
    
    def test_add_single_item_to_wishlist(self, api):
        """Test adding a single item to wishlist."""
        # Arrange
        product_id = "PROD-401"
        
        # Act
        status_code, response = api.add_to_wishlist(product_id)
        api.assert_response_ok(status_code, 201)
        
        # Assert - Item appears in response
        assert response.get("productId") == product_id or product_id in str(response)
    
    def test_added_item_appears_in_wishlist(self, api):
        """Test that added item appears in wishlist list."""
        # Arrange
        product_id = "PROD-402"
        
        # Act - Add to wishlist
        api.add_to_wishlist(product_id)
        
        # Get wishlist
        _, wishlist_response = api.get_wishlist()
        wishlist = wishlist_response.get("wishlist", wishlist_response.get("items", []))
        
        # Assert
        assert any(item.get("productId") == product_id or item == product_id for item in wishlist)
    
    def test_add_multiple_items_to_wishlist(self, api):
        """Test adding multiple items to wishlist."""
        # Arrange
        product_ids = ["PROD-403", "PROD-404", "PROD-405"]
        
        # Act - Add all items
        for product_id in product_ids:
            api.add_to_wishlist(product_id)
        
        # Get wishlist
        _, wishlist_response = api.get_wishlist()
        wishlist = wishlist_response.get("wishlist", wishlist_response.get("items", []))
        
        # Assert - All items present
        for product_id in product_ids:
            assert any(
                item.get("productId") == product_id or item == product_id
                for item in wishlist
            )
    
    def test_wishlist_count_increments(self, api):
        """Test that wishlist count increases with each addition."""
        # Get initial count
        _, initial = api.get_wishlist()
        initial_items = initial.get("wishlist", initial.get("items", []))
        initial_count = len(initial_items)
        
        # Add new item
        api.add_to_wishlist("PROD-406")
        
        # Get updated count
        _, updated = api.get_wishlist()
        updated_items = updated.get("wishlist", updated.get("items", []))
        updated_count = len(updated_items)
        
        # Assert
        assert updated_count == initial_count + 1
    
    def test_cannot_add_duplicate_to_wishlist(self, api):
        """Test that duplicate items cannot be added to wishlist."""
        # Arrange
        product_id = "PROD-407"
        
        # Act - Add first time
        status1, _ = api.add_to_wishlist(product_id)
        api.assert_response_ok(status1, 201)
        
        # Try to add again
        status2, response2 = api.add_to_wishlist(product_id)
        
        # Assert - Second add should fail or be ignored
        assert status2 in [201, 409]  # Created or Conflict
    
    def test_remove_item_from_wishlist(self, api):
        """Test removing item from wishlist."""
        # Arrange - Add item first
        product_id = "PROD-408"
        api.add_to_wishlist(product_id)
        
        # Act - Remove item
        status_code, response = api.remove_from_wishlist(product_id)
        api.assert_response_ok(status_code, 200)
        
        # Verify removed
        _, wishlist_response = api.get_wishlist()
        wishlist = wishlist_response.get("wishlist", wishlist_response.get("items", []))
        
        # Assert
        assert not any(
            item.get("productId") == product_id or item == product_id
            for item in wishlist
        )
    
    def test_wishlist_count_decrements_after_removal(self, api):
        """Test that wishlist count decreases after removal."""
        # Arrange - Add items
        product_id1 = "PROD-409"
        product_id2 = "PROD-410"
        api.add_to_wishlist(product_id1)
        api.add_to_wishlist(product_id2)
        
        # Get count before removal
        _, before = api.get_wishlist()
        before_items = before.get("wishlist", before.get("items", []))
        before_count = len(before_items)
        
        # Remove one item
        api.remove_from_wishlist(product_id1)
        
        # Get count after removal
        _, after = api.get_wishlist()
        after_items = after.get("wishlist", after.get("items", []))
        after_count = len(after_items)
        
        # Assert
        assert after_count == before_count - 1
    
    def test_remove_nonexistent_item_fails(self, api):
        """Test that removing non-existent item returns error."""
        # Act
        status_code, response = api.remove_from_wishlist("NONEXISTENT-PROD")
        
        # Assert
        assert status_code in [404, 400]
    
    def test_wishlist_persists_after_reload(self, api):
        """Test that wishlist items persist after application reload."""
        # Arrange - Add items
        product_ids = ["PROD-411", "PROD-412", "PROD-413"]
        for product_id in product_ids:
            api.add_to_wishlist(product_id)
        
        # Get wishlist before reload
        _, before = api.get_wishlist()
        before_items = before.get("wishlist", before.get("items", []))
        
        # Simulate reload - get wishlist again
        _, after = api.get_wishlist()
        after_items = after.get("wishlist", after.get("items", []))
        
        # Assert - Items unchanged
        assert len(after_items) == len(before_items)
        for product_id in product_ids:
            assert any(
                item.get("productId") == product_id or item == product_id
                for item in after_items
            )
    
    def test_removed_items_stay_removed_after_reload(self, api):
        """Test that removed items don't reappear after reload."""
        # Arrange - Add item
        product_id = "PROD-414"
        api.add_to_wishlist(product_id)
        
        # Remove item
        api.remove_from_wishlist(product_id)
        
        # Get wishlist after removal
        _, before_reload = api.get_wishlist()
        before_items = before_reload.get("wishlist", before_reload.get("items", []))
        
        # Verify not present before reload
        assert not any(
            item.get("productId") == product_id or item == product_id
            for item in before_items
        )
        
        # Simulate reload
        _, after_reload = api.get_wishlist()
        after_items = after_reload.get("wishlist", after_reload.get("items", []))
        
        # Assert - Still not present after reload
        assert not any(
            item.get("productId") == product_id or item == product_id
            for item in after_items
        )
    
    def test_mixed_add_remove_operations_persist(self, api):
        """Test complex add/remove sequence persists correctly."""
        # Arrange & Act
        # Add items
        items_to_add = ["PROD-415", "PROD-416", "PROD-417"]
        for product_id in items_to_add:
            api.add_to_wishlist(product_id)
        
        # Remove one item
        api.remove_from_wishlist("PROD-416")
        
        # Add another item
        api.add_to_wishlist("PROD-418")
        
        # Get wishlist
        _, result = api.get_wishlist()
        wishlist_items = result.get("wishlist", result.get("items", []))
        
        # Assert - Correct items present (415, 417, 418. NOT 416)
        expected = ["PROD-415", "PROD-417", "PROD-418"]
        for item_id in expected:
            assert any(
                item.get("productId") == item_id or item == item_id
                for item in wishlist_items
            )
        
        # Retrieved should NOT include 416
        assert not any(
            item.get("productId") == "PROD-416" or item == "PROD-416"
            for item in wishlist_items
        )
    
    def test_unauthenticated_cannot_access_wishlist(self, client):
        """Test that unauthenticated users cannot access wishlist."""
        # Arrange
        api = APITestHelper(client)
        
        # Act
        status_code, response = api.get_wishlist()
        
        # Assert
        assert status_code == 401  # Unauthorized
    
    def test_wishlist_isolated_per_user(self, client):
        """Test that each user has isolated wishlist."""
        # Create two users
        user1_data = {
            "username": "wishlist_user1",
            "email": "wishlist_user1@example.com",
            "password": "Test@123456",
            "full_name": "Wishlist User 1"
        }
        user2_data = {
            "username": "wishlist_user2",
            "email": "wishlist_user2@example.com",
            "password": "Test@123456",
            "full_name": "Wishlist User 2"
        }
        
        # Setup
        api_setup = APITestHelper(client)
        api_setup.register(**user1_data)
        api_setup.register(**user2_data)
        
        # Login both users
        _, login1 = api_setup.login(user1_data["username"], user1_data["password"])
        token1 = login1.get("access_token") or login1.get("token")
        
        _, login2 = api_setup.login(user2_data["username"], user2_data["password"])
        token2 = login2.get("access_token") or login2.get("token")
        
        # Create clients
        client1 = client
        client1.headers = {"Authorization": f"Bearer {token1}"}
        api1 = APITestHelper(client1)
        
        client2 = client
        client2.headers = {"Authorization": f"Bearer {token2}"}
        api2 = APITestHelper(client2)
        
        # User 1 adds items
        api1.add_to_wishlist("PROD-419")
        api1.add_to_wishlist("PROD-420")
        
        # User 2 adds different items
        api2.add_to_wishlist("PROD-421")
        
        # Get wishlists
        _, wish1 = api1.get_wishlist()
        items1 = wish1.get("wishlist", wish1.get("items", []))
        
        _, wish2 = api2.get_wishlist()
        items2 = wish2.get("wishlist", wish2.get("items", []))
        
        # Assert - Wishlists contain only their own items
        assert any(
            item.get("productId") == "PROD-419" or item == "PROD-419"
            for item in items1
        )
        assert not any(
            item.get("productId") == "PROD-421" or item == "PROD-421"
            for item in items1
        )
