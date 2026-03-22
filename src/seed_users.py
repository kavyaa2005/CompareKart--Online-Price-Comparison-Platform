"""
Seed 15 user accounts with realistic activity history.
Run this once to populate the database.
"""

import os
import sys
import random
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from database import init_database, create_user, get_db

# 15 user accounts
USERS = [
    {"username": "rahul_sharma", "email": "rahul.sharma@gmail.com", "password": "User@123", "full_name": "Rahul Sharma"},
    {"username": "priya_patel", "email": "priya.patel@gmail.com", "password": "User@123", "full_name": "Priya Patel"},
    {"username": "amit_kumar", "email": "amit.kumar@gmail.com", "password": "User@123", "full_name": "Amit Kumar"},
    {"username": "sneha_reddy", "email": "sneha.reddy@gmail.com", "password": "User@123", "full_name": "Sneha Reddy"},
    {"username": "vikram_singh", "email": "vikram.singh@gmail.com", "password": "User@123", "full_name": "Vikram Singh"},
    {"username": "ananya_gupta", "email": "ananya.gupta@gmail.com", "password": "User@123", "full_name": "Ananya Gupta"},
    {"username": "arjun_nair", "email": "arjun.nair@gmail.com", "password": "User@123", "full_name": "Arjun Nair"},
    {"username": "divya_joshi", "email": "divya.joshi@gmail.com", "password": "User@123", "full_name": "Divya Joshi"},
    {"username": "rohan_das", "email": "rohan.das@gmail.com", "password": "User@123", "full_name": "Rohan Das"},
    {"username": "meera_iyer", "email": "meera.iyer@gmail.com", "password": "User@123", "full_name": "Meera Iyer"},
    {"username": "karthik_ravi", "email": "karthik.ravi@gmail.com", "password": "User@123", "full_name": "Karthik Ravi"},
    {"username": "pooja_mehta", "email": "pooja.mehta@gmail.com", "password": "User@123", "full_name": "Pooja Mehta"},
    {"username": "suresh_menon", "email": "suresh.menon@gmail.com", "password": "User@123", "full_name": "Suresh Menon"},
    {"username": "neha_verma", "email": "neha.verma@gmail.com", "password": "User@123", "full_name": "Neha Verma"},
    {"username": "aditya_rao", "email": "aditya.rao@gmail.com", "password": "User@123", "full_name": "Aditya Rao"},
]

PRODUCTS = [
    "Samsung Galaxy S23", "iPhone 15 Pro", "OnePlus 12", "Google Pixel 8",
    "Sony WH-1000XM5", "MacBook Air M2", "Dell XPS 15", "iPad Air",
    "Samsung Galaxy Watch 6", "AirPods Pro 2", "Bose QC45",
    "Asus ROG Phone 7", "Nothing Phone 2", "Xiaomi 14 Pro", "Realme GT 5"
]

PLATFORMS = ["Amazon", "Flipkart"]

ACTIVITY_TYPES = [
    ("search", "Searched for product"),
    ("prediction", "Requested price prediction"),
    ("price_trend", "Viewed price trend"),
    ("comparison", "Compared across platforms"),
]


def seed_database():
    """Seed the database with users and activity data."""
    # Initialize DB
    init_database()

    conn = get_db()
    cursor = conn.cursor()

    # Check if already seeded
    cursor.execute("SELECT COUNT(*) as c FROM users")
    if cursor.fetchone()['c'] > 0:
        print("⚠ Database already has users. Skipping seed.")
        conn.close()
        return

    print("🌱 Seeding 15 user accounts...")

    # Create users
    user_ids = []
    for user in USERS:
        uid = create_user(user["username"], user["email"], user["password"], user["full_name"])
        if uid:
            user_ids.append(uid)
            print(f"  ✓ Created user: {user['username']} (ID: {uid})")

    # Update some users' last_login to simulate active/inactive
    now = datetime.now()
    for i, uid in enumerate(user_ids):
        if i < 10:  # 10 users logged in recently (active)
            days_ago = random.randint(0, 5)
        else:  # 5 users haven't logged in recently (inactive)
            days_ago = random.randint(10, 30)

        login_time = (now - timedelta(days=days_ago)).strftime('%Y-%m-%d %H:%M:%S')
        conn.execute("UPDATE users SET last_login = ? WHERE id = ?", (login_time, uid))

    conn.commit()

    # Seed activity data (spread over last 30 days)
    print("\n📊 Seeding activity history...")
    total_activities = 0

    for uid in user_ids:
        # Each user gets 15-60 activities over the last 30 days
        num_activities = random.randint(15, 60)

        for _ in range(num_activities):
            activity_type, detail_template = random.choice(ACTIVITY_TYPES)
            product = random.choice(PRODUCTS)
            platform = random.choice(PLATFORMS)
            days_ago = random.randint(0, 30)
            hours_ago = random.randint(0, 23)
            minutes_ago = random.randint(0, 59)
            timestamp = (now - timedelta(days=days_ago, hours=hours_ago, minutes=minutes_ago)).strftime('%Y-%m-%d %H:%M:%S')

            details = f"{detail_template}: {product} on {platform}"

            conn.execute(
                "INSERT INTO user_activity (user_id, activity_type, details, product_name, platform, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                (uid, activity_type, details, product, platform, timestamp)
            )
            total_activities += 1

    conn.commit()
    print(f"  ✓ Created {total_activities} activity records")

    # Seed sessions (spread over last 30 days)
    print("\n🔐 Seeding session history...")
    total_sessions = 0

    for uid in user_ids:
        num_sessions = random.randint(5, 25)
        for _ in range(num_sessions):
            days_ago = random.randint(0, 30)
            hours_ago = random.randint(0, 23)
            start = now - timedelta(days=days_ago, hours=hours_ago)
            duration = random.uniform(0.5, 45)  # 0.5 to 45 minutes
            end = start + timedelta(minutes=duration)
            token = f"seed_session_{uid}_{total_sessions}"

            conn.execute(
                "INSERT INTO user_sessions (user_id, token, started_at, ended_at, duration_minutes) VALUES (?, ?, ?, ?, ?)",
                (uid, token, start.strftime('%Y-%m-%d %H:%M:%S'), end.strftime('%Y-%m-%d %H:%M:%S'), round(duration, 2))
            )
            total_sessions += 1

    conn.commit()
    conn.close()

    print(f"  ✓ Created {total_sessions} session records")
    print(f"\n✅ Seed complete!")
    print(f"   Users: {len(user_ids)}")
    print(f"   Activities: {total_activities}")
    print(f"   Sessions: {total_sessions}")
    print(f"\n📋 All accounts use password: User@123")


if __name__ == "__main__":
    seed_database()
