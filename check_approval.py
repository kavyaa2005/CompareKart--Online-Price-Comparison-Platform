#!/usr/bin/env python
import requests
import json

BASE_URL = "http://localhost:8000"
ADMIN_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiJ9.X-7c6nW8jLjKnJq7-kYp0K0R7vQI8X6vZ9X9X9X9X9E"
ADMIN_HEADERS = {"Authorization": f"Bearer {ADMIN_TOKEN}"}

print("=" * 60)
print("CHECKING BLUETOOTH SPEAKER APPROVAL STATUS")
print("=" * 60)

# 1. Check approved products
print("\n1. APPROVED PRODUCTS ON BACKEND:")
try:
    resp = requests.get(f"{BASE_URL}/api/approved-products", headers=ADMIN_HEADERS, timeout=3)
    approved = resp.json()
    print(f"   Status: {resp.status_code}")
    print(f"   Count: {len(approved.get('approved_products', []))}")
    for product in approved.get('approved_products', []):
        print(f"   - {product}")
    if not approved.get('approved_products'):
        print("   ⚠️  NO APPROVED PRODUCTS FOUND")
except Exception as e:
    print(f"   ERROR: {e}")

# 2. Check matching pairs to see if Bluetooth Speaker is still there
print("\n2. MATCHING PAIRS (should NOT include approved products):")
try:
    resp = requests.get(f"{BASE_URL}/api/matching/pairs", headers=ADMIN_HEADERS, timeout=3)
    data = resp.json()
    pairs = data.get('pairs', [])
    print(f"   Status: {resp.status_code}")
    print(f"   Total pairs: {len(pairs)}")
    
    bluetooth_found = False
    for pair in pairs:
        if 'bluetooth' in pair.get('productA', {}).get('name', '').lower():
            bluetooth_found = True
            print(f"   ⚠️  FOUND: {pair['productA']['name']} (should be removed if approved)")
    
    if not bluetooth_found:
        print("   ✓ Bluetooth Speaker NOT in matching pairs (good)")
except Exception as e:
    print(f"   ERROR: {e}")

# 3. Check user products endpoint
print("\n3. USER PRODUCTS (should include approved products only):")
try:
    resp = requests.get(f"{BASE_URL}/user/products", headers={"Authorization": "Bearer user_token"}, timeout=3)
    products = resp.json()
    print(f"   Status: {resp.status_code}")
    print(f"   Response: {products}")
except Exception as e:
    print(f"   ERROR: {e}")

# 4. Try to directly access the approved products in-memory registry
print("\n4. BACKEND INTERNAL STATE:")
try:
    resp = requests.get(f"{BASE_URL}/api/matching/stats", headers=ADMIN_HEADERS, timeout=3)
    stats = resp.json()
    print(f"   Approved count: {stats.get('approved', 'N/A')}")
    print(f"   Pending count: {stats.get('pending', 'N/A')}")
    print(f"   Rejected count: {stats.get('rejected', 'N/A')}")
except Exception as e:
    print(f"   ERROR: {e}")

print("\n" + "=" * 60)
