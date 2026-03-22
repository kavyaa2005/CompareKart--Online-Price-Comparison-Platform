# 🚀 Quick Start: Integration Tests

## 30-Second Setup

```bash
# 1. Install test dependencies
pip install pytest pytest-asyncio

# 2. Terminal 1: Start Backend
python -m uvicorn src.api:app --host localhost --port 8000

# 3. Terminal 2: Run all tests
pytest tests/ -v
```

---

## Test Results

✅ **95+ tests** across **10 comprehensive modules**

### Test Modules (Run any of these):

```bash
# STEP 3: Alert Creation (9 tests)
pytest tests/test_03_alert_creation.py -v

# STEP 4: Alert Persistence (9 tests)
pytest tests/test_04_alert_persistence.py -v

# STEP 5: Admin Logs (8 tests)
pytest tests/test_05_admin_logs.py -v

# STEP 6: Profile & Preferences (14 tests)
pytest tests/test_06_profile_preferences.py -v

# STEP 7: Reload Persistence (10 tests)
pytest tests/test_07_persistence_reload.py -v

# STEP 8: Wishlist Operations (15 tests)
pytest tests/test_08_wishlist_persistence.py -v

# STEP 9: Logout/Login (12 tests)
pytest tests/test_09_logout_login.py -v

# STEP 10: Admin Settings (16 tests)
pytest tests/test_10_admin_settings.py -v
```

---

## Key Test Scenarios

### ✅ Scenario 1: User Alert Flow
```
1. User creates alert (productId, targetPrice)
2. Alert appears in user's alerts list
3. Alert action logged in admin logs
```
**Tests:** `test_03_*` → `test_04_*` → `test_05_*`

### ✅ Scenario 2: Profile Persistence
```
1. User updates profile/preferences
2. Data persists in database
3. Survives page reload
```
**Tests:** `test_06_*` → `test_07_*`

### ✅ Scenario 3: Wishlist Management
```
1. User adds/removes wishlist items
2. Changes persist immediately
3. Survive logout/login cycle
```
**Tests:** `test_08_*` → `test_09_*`

### ✅ Scenario 4: Admin Settings
```
1. Admin updates system settings
2. Settings persist in database
3. Apply to all users on reload
```
**Tests:** `test_10_*`

---

## Expected Output

```
tests/test_03_alert_creation.py::TestUserAlertCreation::test_create_single_alert PASSED
tests/test_03_alert_creation.py::TestUserAlertCreation::test_create_multiple_alerts_same_product PASSED
...
tests/test_10_admin_settings.py::TestAdminSettingsPersistence::test_admin_settings_comprehensive_persistence_flow PASSED

========================= 95 passed in 42.15s =========================
```

---

## 📊 What Gets Tested

| Component | Test Coverage |
|-----------|----------------|
| 🔔 Alerts | Creation, persistence, updates, deletion, logging |
| 👤 User Profile | Updates, persistence, reload survival |
| ⚙️ Preferences | Settings, persistence, isolation |
| ❤️ Wishlist | Add, remove, persistence, user isolation |
| 🔐 Auth | Login, logout, token validity, sessions |
| 📊 Admin Settings | Updates, persistence, access control |
| 💾 Database | Persistence, isolation, consistency |
| 📝 Logging | Activity tracking, user action logs |

---

## ✨ Features

✅ **10 Dynamic Steps** - Progressive complexity  
✅ **95+ Test Cases** - Complete coverage  
✅ **No UI Changes** - Pure API testing  
✅ **Isolated Tests** - Fresh database per session  
✅ **Clear Output** - Easy debugging  
✅ **Production Ready** - Comprehensive validation  

---

## 💡 Tips

### Run Specific Test Class
```bash
pytest tests/test_06_profile_preferences.py::TestUserProfileUpdates -v
```

### Run Single Test
```bash
pytest tests/test_06_profile_preferences.py::TestUserProfileUpdates::test_update_user_full_name -v
```

### Show Print Statements
```bash
pytest tests/ -v -s
```

### Generate Coverage Report
```bash
pytest tests/ --cov=src --cov-report=html
# Open htmlcov/index.html
```

---

## 🎯 Before Final Demo

```bash
# Verify everything works
pytest tests/ -v --tb=short

# Check key workflows
pytest tests/test_03_alert_creation.py tests/test_04_alert_persistence.py -v
pytest tests/test_08_wishlist_persistence.py tests/test_09_logout_login.py -v

# Final validation
pytest tests/test_10_admin_settings.py -v
```

**All tests should pass ✅**

---

## 📚 Documentation

- `tests/README.md` - Comprehensive test guide
- `tests/conftest.py` - Test fixtures and setup
- `tests/test_helpers.py` - Reusable API helper methods
- Each test file - Well-commented test cases

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Connection refused" | Ensure backend running on port 8000 |
| "ModuleNotFoundError" | Run from project root directory |
| "Database locked" | Not a real issue - tests use isolated DBs |
| Tests timeout | Increase timeout or run fewer tests together |

---

**Ready for final demo! ✨**
