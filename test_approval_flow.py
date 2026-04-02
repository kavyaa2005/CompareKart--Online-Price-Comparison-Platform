#!/usr/bin/env python
"""Test the approval flow end-to-end"""
import sys
sys.path.insert(0, '.')

from src.api import app, approved_products, match_decisions
from fastapi.testclient import TestClient
import json

client = TestClient(app)

print("=" * 70)
print("TESTING APPROVAL FLOW")
print("=" * 70)

# Get admin token
print("\n1. Getting admin token...")
login_resp = client.post("/auth/login", json={"username": "admin", "password": "Admin@123"})
print(f"   Status: {login_resp.status_code}")
if login_resp.status_code == 200:
    admin_token = login_resp.json()["token"]
    print(f"   Token: {admin_token[:20]}...")
else:
    print(f"   Error: {login_resp.text}")
    admin_token = "test_token"

headers = {"Authorization": f"Bearer {admin_token}"}

# Get matching pairs
print("\n2. Getting matching pairs...")
pairs_resp = client.get("/api/matching/pairs", headers=headers)
print(f"   Status: {pairs_resp.status_code}")
if pairs_resp.status_code == 200:
    pairs_data = pairs_resp.json()
    pairs = pairs_data.get("pairs", [])
    print(f"   Total pairs: {len(pairs)}")
    
    # Find Bluetooth Speaker
    bluetooth_pair = None
    for pair in pairs:
        if "bluetooth" in pair.get("productA", {}).get("name", "").lower():
            bluetooth_pair = pair
            break
    
    if bluetooth_pair:
        print(f"   Found Bluetooth: {bluetooth_pair['productA']['name']}")
        print(f"   Pair ID: {bluetooth_pair['id']}")
        
        # Try to approve it
        print(f"\n3. Approving Bluetooth Speaker (ID: {bluetooth_pair['id']})...")
        approve_resp = client.post(
            f"/api/matching/{bluetooth_pair['id']}/action?action=approved",
            headers=headers
        )
        print(f"   Status: {approve_resp.status_code}")
        print(f"   Response: {approve_resp.text}")
        
        if approve_resp.status_code == 200:
            print("   ✓ Approval request succeeded")
        else:
            print("   ✗ Approval request FAILED")
            
    else:
        print("   ⚠️  Bluetooth Speaker not found in pairs")
else:
    print(f"   Error: {pairs_resp.text}")

print("\n4. Checking in-memory approved_products registry...")
print(f"   Registered approvals: {len(approved_products)}")
for product_name in approved_products:
    print(f"   - {product_name}")

print("\n5. Checking /api/approved-products endpoint...")
approved_resp = client.get("/api/approved-products", headers=headers)
print(f"   Status: {approved_resp.status_code}")
if approved_resp.status_code == 200:
    approved_data = approved_resp.json()
    print(f"   Approved count: {approved_data.get('count', 0)}")
    for product in approved_data.get("approved_products", []):
        print(f"   - {product}")
else:
    print(f"   Error: {approved_resp.text}")

print("\n6. Checking /user/products endpoint...")
user_resp = client.get("/user/products", headers={"Authorization": "Bearer user_token"})
print(f"   Status: {user_resp.status_code}")
if user_resp.status_code == 200:
    user_data = user_resp.json()
    print(f"   User products: {json.dumps(user_data, indent=2)}")
else:
    print(f"   Error: {user_resp.text}")

print("\n7. Checking matching stats...")
stats_resp =client.get("/api/matching/stats", headers=headers)
print(f"   Status: {stats_resp.status_code}")
if stats_resp.status_code == 200:
    stats = stats_resp.json()
    print(f"   Stats: {json.dumps(stats, indent=2)}")
else:
    print(f"   Error: {stats_resp.text}")

print("\n" + "=" * 70)
