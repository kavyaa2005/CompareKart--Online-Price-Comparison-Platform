#!/usr/bin/env python
"""Test that approvals are now persisted to the database"""
import sys
sys.path.insert(0, '.')

from src.database import get_all_approved_products, approve_product, is_product_approved

print("=" * 70)
print("TESTING DATABASE APPROVAL PERSISTENCE")
print("=" * 70)

# Test 1: Add an approval
print("\n1. Testing approve_product()...")
success = approve_product("Bluetooth Speaker XYZ", pair_id=42)
print(f"   Result: {success}")

# Test 2: Verify it's in the database
print("\n2. Testing is_product_approved()...")
is_approved = is_product_approved("Bluetooth Speaker XYZ")
print(f"   Result: {is_approved}")

# Test 3: Get all approved products
print("\n3. Testing get_all_approved_products()...")
all_approved = get_all_approved_products()
print(f"   Total approved: {len(all_approved)}")
for name, details in all_approved.items():
    print(f"   - {name}: {details}")

# Test 4: Try to approve the same product again (should be idempotent)
print("\n4. Testing idempotent approve (same product)...")
success2 = approve_product("Bluetooth Speaker XYZ", pair_id=42)
print(f"   Result: {success2}")
all_approved_after = get_all_approved_products()
print(f"   Total still: {len(all_approved_after)}")

print("\n" + "=" * 70)
print("✓ Database persistence test completed!")
print("=" * 70)
