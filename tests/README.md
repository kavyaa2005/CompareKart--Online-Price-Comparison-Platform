# Integration Test Suite - Complete Guide

## 📋 Overview

This comprehensive integration test suite validates complete user workflows across the e-commerce price intelligence platform. The suite consists of **10 major test modules** testing all critical click paths and data persistence features.

---

## 🎯 Test Coverage (10 Steps)

### Step 1: Test Configuration & Setup
**File:** `tests/conftest.py`
- Pytest fixtures for test database isolation
- Test user credentials (regular user & admin)
- Authenticated client setup
- Database initialization per session

### Step 2: API Test Utilities
**File:** `tests/test_helpers.py`
- Reusable API testing helper class
- Common operations for alerts, profiles, wishlist, admin settings
- Assertion helpers for response validation

### Step 3: User Alert Creation
**File:** `tests/test_03_alert_creation.py`
- ✅ Create single alert
- ✅ Create multiple alerts for same product
- ✅ Create alerts for different products
- ✅ Verify alert required fields
- ✅ Test default status (ACTIVE)
- ✅ Prevent duplicate alerts
- ✅ Unauthorized access rejection
- ✅ Invalid price rejection
- ✅ Incremental alert IDs

### Step 4: Alert Persistence in User Alerts
**File:** `tests/test_04_alert_persistence.py`
- ✅ Alert appears immediately after creation
- ✅ Multiple alerts all persist
- ✅ Alert persists after multiple retrievals
- ✅ All alert details persist correctly
- ✅ Retrieve specific alert by ID
- ✅ Alert count increments
- ✅ Alert updates persist
- ✅ Deleted alerts removed from list
- ✅ Empty alerts list for new users

### Step 5: Alert Reflection in Admin Logs
**File:** `tests/test_05_admin_logs.py`
- ✅ Alert creation logged in activity
- ✅ Multiple alerts all logged
- ✅ Alert updates logged
- ✅ Alert deletions logged
- ✅ Admin can filter logs by user
- ✅ Logs contain product information
- ✅ Log timestamps are valid
- ✅ Concurrent user alerts logged separately

### Step 6: Profile & Preferences Updates
**File:** `tests/test_06_profile_preferences.py`
- ✅ Get initial profile
- ✅ Update full name
- ✅ Update email
- ✅ Update phone number
- ✅ Update multiple fields at once
- ✅ Partial updates preserve other fields
- ✅ Get/update user preferences
- ✅ Update preferred currency
- ✅ Update preferred platforms
- ✅ Update notification preferences
- ✅ Update alert threshold
- ✅ Preferences persist across retrievals
- ✅ Unauthenticated users rejected
- ✅ Invalid values rejected

### Step 7: Data Persistence After Reload
**File:** `tests/test_07_persistence_reload.py`
- ✅ Profile persists after reload
- ✅ Preferences persist after reload
- ✅ Alerts persist after reload
- ✅ Alert modifications persist
- ✅ Deleted alerts stay deleted
- ✅ Combined data all persists
- ✅ New data immediately available
- ✅ Timestamps remain accurate
- ✅ User isolation maintained

### Step 8: Wishlist Add/Remove Persistence
**File:** `tests/test_08_wishlist_persistence.py`
- ✅ Get initial wishlist
- ✅ Add single item
- ✅ Item appears in wishlist
- ✅ Add multiple items
- ✅ Wishlist count increments
- ✅ Duplicate items rejected
- ✅ Remove item from wishlist
- ✅ Wishlist count decrements
- ✅ Remove non-existent item fails
- ✅ Wishlist persists after reload
- ✅ Removed items stay deleted
- ✅ Complex add/remove sequences persist
- ✅ Unauthenticated access denied
- ✅ Wishlist isolated per user

### Step 9: Logout/Login Persistence
**File:** `tests/test_09_logout_login.py`
- ✅ Basic logout/login cycle
- ✅ Profile persists across logout/login
- ✅ Preferences persist
- ✅ Alerts persist
- ✅ Wishlist persists
- ✅ Multiple logout/login cycles
- ✅ Old token invalid after logout
- ✅ New token valid after login
- ✅ Concurrent sessions isolated
- ✅ Logout without login fails
- ✅ Wrong password prevents login

### Step 10: Admin Settings Persistence (Final)
**File:** `tests/test_10_admin_settings.py`
- ✅ Get default admin settings
- ✅ Update site name
- ✅ Update default currency
- ✅ Update default platforms
- ✅ Toggle alerts enabled
- ✅ Update prediction threshold
- ✅ Multiple settings update atomically
- ✅ Settings persist after reload
- ✅ Setting changes visible to all users
- ✅ Admin-only access control
- ✅ Settings revert correctly
- ✅ Invalid values rejected
- ✅ All required fields present
- ✅ Comprehensive persistence flow

---

## 🚀 Running the Tests

### Prerequisites
```bash
# Install test dependencies
pip install pytest pytest-asyncio

# Ensure backend is running
python -m uvicorn src.api:app --host localhost --port 8000
```

### Run All Tests
```bash
# All integration tests
pytest tests/ -v

# Quick smoke test
pytest tests/conftest.py tests/test_helpers.py -v
```

### Run Specific Test Module
```bash
# Step 3: Alert creation
pytest tests/test_03_alert_creation.py -v

# Step 5: Admin logs
pytest tests/test_05_admin_logs.py -v

# Step 10: Admin settings (final validation)
pytest tests/test_10_admin_settings.py -v
```

### Run with Markers
```bash
# All alert tests
pytest tests/ -m alerts -v

# All persistence tests
pytest tests/ -m persistence -v

# All admin tests
pytest tests/ -m admin -v
```

### Verbose Output
```bash
# Show print statements
pytest tests/ -v -s

# Show setup/teardown
pytest tests/ -v --setup-show

# Show detailed assertion failures
pytest tests/ -v --tb=long
```

---

## 📊 Test Execution Order

Tests are designed to run **independently** but logically ordered:

1. **Conftest setup** - Database and fixtures initialized
2. **Alert creation** - Basic alert CRUD operations
3. **Alert persistence** - Verify storage
4. **Admin logs** - Verify logging
5. **Profile/preferences** - User settings
6. **Reload persistence** - Data survives restart
7. **Wishlist operations** - Add/remove items
8. **Logout/login** - Auth cycles
9. **Admin settings** - System configuration

---

## 🔍 Key Test Scenarios

### Click Path 1: Create Alert → View in Alerts → See in Logs
```
User sets alert (Step 3)
  ↓
Alert appears in user alerts (Step 4)
  ↓
Reflected in admin logs (Step 5)
```

### Click Path 2: Update Profile → Persist → Reload
```
User updates profile/preferences (Step 6)
  ↓
Data persists in database (Step 7)
  ↓
Survives page reload
```

### Click Path 3: Wishlist → Persist → Logout/Login
```
User adds/removes wishlist items (Step 8)
  ↓
Changes persist immediately (Step 7)
  ↓
Survive logout/login cycle (Step 9)
```

### Click Path 4: Admin Changes Settings
```
Admin updates system settings (Step 10)
  ↓
Settings persist in database
  ↓
Reflected on next reload
  ↓
Apply to all users

---

## 📈 Test Statistics

| Module | Tests | Coverage |
|--------|-------|----------|
| test_03_alert_creation.py | 10 | Alert CRUD |
| test_04_alert_persistence.py | 10 | Alert storage |
| test_05_admin_logs.py | 8 | Logging |
| test_06_profile_preferences.py | 14 | User settings |
| test_07_persistence_reload.py | 10 | Reload survival |
| test_08_wishlist_persistence.py | 15 | Wishlist ops |
| test_09_logout_login.py | 12 | Auth cycles |
| test_10_admin_settings.py | 16 | Admin config |
| **Total** | **95+** | **Complete** |

---

## 🛠️ Debugging Tests

### View Failed Test Details
```bash
pytest tests/ -v --tb=long --capture=no
```

### Run Single Test
```bash
pytest tests/test_06_profile_preferences.py::TestUserProfileUpdates::test_update_user_full_name -v
```

### Debug with Print Statements
```python
def test_something(api):
    print("Starting test")  # Will show with -s flag
    status, response = api.get_user_profile()
    print(f"Response: {response}")
```

### Database State
Tests use isolated database via `test_db` fixture. Each session gets fresh DB:
```python
@pytest.fixture(scope="session")
def test_db():
    """Creates temp database for test session"""
```

---

## ✅ Pre-Demo Checklist

Before final demo, run:
```bash
# 1. Start backend
python -m uvicorn src.api:app --host localhost --port 8000

# 2. Run all tests
pytest tests/ -v --tb=short

# 3. Check for failures
# All 95+ tests should pass ✅

# 4. Verify key paths
pytest tests/test_03_alert_creation.py tests/test_04_alert_persistence.py tests/test_05_admin_logs.py -v

# 5. Final verification
pytest tests/test_10_admin_settings.py -v
```

---

## 🐛 Common Issues & Fixes

### Issue: "ModuleNotFoundError: src"
**Fix:** Run from project root directory
```bash
cd D:\...\MINI-PROJECT
pytest tests/ -v
```

### Issue: "Connection refused" (port 8000)
**Fix:** Ensure backend is running
```bash
python -m uvicorn src.api:app --host localhost --port 8000
```

### Issue: "Database is locked"
**Fix:** Tests use isolated temp databases. Close any other connections.

### Issue: Token invalid after logout
**Fix:** Normal behavior - old tokens should be invalid. Test verifies this.

---

## 📝 Test Structure

Each test module follows structure:

```python
class TestFeatureName:
    """Test suite for feature."""
    
    @pytest.fixture
    def api(self, authenticated_client):
        """Setup authenticated API helper."""
        return APITestHelper(authenticated_client)
    
    def test_specific_behavior(self, api):
        """Test description."""
        # Arrange
        data = {"key": "value"}
        
        # Act
        status, response = api.some_operation(data)
        
        # Assert
        api.assert_response_ok(status, 200)
        assert response.get("expected") == "value"
```

---

## 🎓 Learning Resources

- **APITestHelper**: See `tests/test_helpers.py` for all available methods
- **Fixtures**: See `tests/conftest.py` for test setup
- **Examples**: Each test module has 10-15 examples of different scenarios

---

## 📞 Support

For test failures or questions:
1. Check the test output message
2. Review the test code (comments explain intent)
3. Look for "AssertionError" details
4. Check backend is running correctly
5. Verify database migrations completed

**Test Status: ✅ Ready for final demo**
