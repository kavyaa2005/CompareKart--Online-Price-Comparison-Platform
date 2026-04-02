"""
SQLite Database for User Management & Activity Tracking
"""

import sqlite3
import os
import hashlib
import secrets
import json
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Any

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'users.db')
SCHEMA_VERSION = 4


DEFAULT_ADMIN_SETTINGS = {
    "site_name": "Price Intelligence System",
    "currency": "USD",
    "default_platforms": ["Amazon", "Flipkart"],
    "alerts_enabled": True,
    "prediction_confidence_threshold": 0.7,
}


def get_db():
    """Get a database connection."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def hash_password(password: str, salt: str = None) -> tuple:
    """Hash a password with salt."""
    if salt is None:
        salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
    return hashed.hex(), salt


def verify_password(password: str, hashed: str, salt: str) -> bool:
    """Verify a password against its hash."""
    check_hash, _ = hash_password(password, salt)
    return check_hash == hashed


def init_database():
    """Initialize DB via migrations + seed flow."""
    migrate_database(seed=True)
    print("✓ Database initialized")


def migrate_database(seed: bool = True) -> Dict[str, Any]:
    """Run schema migrations in a backward-compatible way."""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("PRAGMA user_version")
    row = cursor.fetchone()
    current_version = int(row[0] if row else 0)

    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            password_salt TEXT NOT NULL,
            full_name TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            last_login TEXT,
            is_active INTEGER NOT NULL DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS user_activity (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            activity_type TEXT NOT NULL,
            details TEXT,
            product_name TEXT,
            platform TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS user_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT UNIQUE NOT NULL,
            started_at TEXT NOT NULL DEFAULT (datetime('now')),
            ended_at TEXT,
            duration_minutes REAL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS user_alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            alert_id TEXT UNIQUE NOT NULL,
            product_id TEXT NOT NULL,
            condition_text TEXT NOT NULL,
            target_price REAL NOT NULL,
            status TEXT NOT NULL DEFAULT 'Active',
            created_at TEXT NOT NULL DEFAULT (date('now')),
            triggered_at TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS user_preferences (
            user_id INTEGER PRIMARY KEY,
            budget_min REAL NOT NULL DEFAULT 0,
            budget_max REAL NOT NULL DEFAULT 5000,
            categories_json TEXT NOT NULL DEFAULT '[]',
            platforms_json TEXT NOT NULL DEFAULT '["Amazon", "Flipkart"]',
            email_notifications INTEGER NOT NULL DEFAULT 1,
            push_notifications INTEGER NOT NULL DEFAULT 1,
            updated_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS user_wishlist (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(user_id, product_id)
        );

        CREATE TABLE IF NOT EXISTS admin_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            value_type TEXT NOT NULL DEFAULT 'string',
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS user_profile_extended (
            user_id INTEGER PRIMARY KEY,
            phone TEXT,
            city TEXT,
            bio TEXT,
            avatar_url TEXT,
            updated_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS product_approvals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_name TEXT NOT NULL UNIQUE,
            pair_id INTEGER,
            approved_at TEXT NOT NULL DEFAULT (datetime('now')),
            approved_by TEXT DEFAULT 'admin',
            status TEXT DEFAULT 'active'
        );

        CREATE INDEX IF NOT EXISTS idx_activity_user ON user_activity(user_id);
        CREATE INDEX IF NOT EXISTS idx_activity_type ON user_activity(activity_type);
        CREATE INDEX IF NOT EXISTS idx_activity_date ON user_activity(created_at);
        CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_alerts_user ON user_alerts(user_id);
        CREATE INDEX IF NOT EXISTS idx_alerts_status ON user_alerts(status);
        CREATE INDEX IF NOT EXISTS idx_wishlist_user ON user_wishlist(user_id);
        CREATE INDEX IF NOT EXISTS idx_wishlist_product ON user_wishlist(product_id);
        CREATE INDEX IF NOT EXISTS idx_product_approvals_name ON product_approvals(product_name);
        CREATE INDEX IF NOT EXISTS idx_product_approvals_status ON product_approvals(status);
    """)

    applied_steps: List[str] = []

    # v1 baseline: table/index creation is idempotent via CREATE IF NOT EXISTS.
    if current_version < 1:
        applied_steps.append("v1_baseline_tables")

    if current_version < 2:
        _ensure_role_column_with_connection(conn)
        applied_steps.append("v2_users_role_column")
    else:
        _ensure_role_column_with_connection(conn)

    if current_version < 3:
        seeded_prefs = _seed_missing_user_preferences_with_connection(conn)
        seeded_profiles = _seed_missing_user_profiles_with_connection(conn)
        applied_steps.append(
            f"v3_backfill_user_rows(prefs={seeded_prefs},profiles={seeded_profiles})"
        )

    if current_version < 4:
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(product_approvals)")
        if not cursor.fetchall():
            cursor.execute("""
                CREATE TABLE product_approvals (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    product_name TEXT NOT NULL UNIQUE,
                    pair_id INTEGER,
                    approved_at TEXT NOT NULL DEFAULT (datetime('now')),
                    approved_by TEXT DEFAULT 'admin',
                    status TEXT DEFAULT 'active'
                )
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_product_approvals_name ON product_approvals(product_name)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_product_approvals_status ON product_approvals(status)")
        applied_steps.append("v4_product_approvals_table")

    conn.commit()
    conn.execute(f"PRAGMA user_version={SCHEMA_VERSION}")
    conn.commit()
    conn.close()

    if seed:
        _seed_admin_user()
        _seed_admin_settings()

    return {
        "schema_version_before": current_version,
        "schema_version_after": SCHEMA_VERSION,
        "applied_steps": applied_steps,
        "seed_executed": seed,
        "db_path": DB_PATH,
    }


def _ensure_role_column():
    """Add role column if it doesn't exist (migration for existing DBs)."""
    conn = get_db()
    _ensure_role_column_with_connection(conn)
    conn.close()


def _ensure_role_column_with_connection(conn: sqlite3.Connection):
    """Add role column if it doesn't exist using an open connection."""
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(users)")
    columns = [col[1] for col in cursor.fetchall()]
    if 'role' not in columns:
        cursor.execute("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'")
    # For DBs where column exists but may have NULLs due to manual edits.
    cursor.execute("UPDATE users SET role = 'user' WHERE role IS NULL OR TRIM(role) = ''")


def _seed_admin_user():
    """Create default admin user if not exists."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE username = 'admin'")
    if not cursor.fetchone():
        password_hash, salt = hash_password('Admin@123')
        cursor.execute(
            "INSERT INTO users (username, email, password_hash, password_salt, full_name, role) VALUES (?, ?, ?, ?, ?, ?)",
            ('admin', 'admin@priceintel.com', password_hash, salt, 'System Administrator', 'admin')
        )
        conn.commit()
        print("✓ Admin user created (username: admin, password: Admin@123)")
    conn.close()


def _seed_admin_settings():
    """Create default admin settings if not exists."""
    conn = get_db()
    cursor = conn.cursor()

    for key, value in DEFAULT_ADMIN_SETTINGS.items():
        if isinstance(value, bool):
            value_type = "boolean"
            stored_value = "true" if value else "false"
        elif isinstance(value, (dict, list)):
            value_type = "json"
            stored_value = json.dumps(value)
        elif isinstance(value, (int, float)):
            value_type = "number"
            stored_value = str(value)
        else:
            value_type = "string"
            stored_value = str(value)

        cursor.execute(
            """
            INSERT INTO admin_settings (key, value, value_type)
            VALUES (?, ?, ?)
            ON CONFLICT(key) DO NOTHING
            """,
            (key, stored_value, value_type)
        )

    conn.commit()
    conn.close()


def _seed_missing_user_preferences_with_connection(conn: sqlite3.Connection) -> int:
    """Backfill default preferences rows for users created before preferences table existed."""
    before_changes = conn.total_changes
    conn.execute(
        """
        INSERT INTO user_preferences (user_id)
        SELECT u.id
        FROM users u
        LEFT JOIN user_preferences p ON p.user_id = u.id
        WHERE p.user_id IS NULL
        """
    )
    return conn.total_changes - before_changes


def _seed_missing_user_profiles_with_connection(conn: sqlite3.Connection) -> int:
    """Backfill empty profile extension rows for legacy users."""
    before_changes = conn.total_changes
    conn.execute(
        """
        INSERT INTO user_profile_extended (user_id, updated_at)
        SELECT u.id, datetime('now')
        FROM users u
        LEFT JOIN user_profile_extended pe ON pe.user_id = u.id
        WHERE pe.user_id IS NULL
        """
    )
    return conn.total_changes - before_changes


def create_user(username: str, email: str, password: str, full_name: str, role: str = 'user') -> Optional[int]:
    """Create a new user. Returns user ID or None if exists."""
    conn = get_db()
    try:
        password_hash, salt = hash_password(password)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (username, email, password_hash, password_salt, full_name, role) VALUES (?, ?, ?, ?, ?, ?)",
            (username, email, password_hash, salt, full_name, role)
        )
        conn.commit()
        return cursor.lastrowid
    except sqlite3.IntegrityError:
        return None
    finally:
        conn.close()


def authenticate_user(username: str, password: str) -> Optional[Dict]:
    """Authenticate user. Returns user dict or None."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ? AND is_active = 1", (username,))
    row = cursor.fetchone()
    conn.close()

    if row and verify_password(password, row['password_hash'], row['password_salt']):
        # Update last login
        conn = get_db()
        conn.execute("UPDATE users SET last_login = datetime('now') WHERE id = ?", (row['id'],))
        conn.commit()
        conn.close()
        return {
            "id": row['id'],
            "username": row['username'],
            "email": row['email'],
            "full_name": row['full_name'],
            "role": row['role'] if 'role' in row.keys() else 'user',
            "created_at": row['created_at'],
        }
    return None


def get_user_by_id(user_id: int) -> Optional[Dict]:
    """Get user by ID."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, username, email, full_name, role, created_at, last_login, is_active FROM users WHERE id = ?",
        (user_id,)
    )
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None


def log_activity(user_id: int, activity_type: str, details: str = None,
                 product_name: str = None, platform: str = None):
    """Log a user activity."""
    conn = get_db()
    conn.execute(
        "INSERT INTO user_activity (user_id, activity_type, details, product_name, platform) VALUES (?, ?, ?, ?, ?)",
        (user_id, activity_type, details, product_name, platform)
    )
    conn.commit()
    conn.close()


def create_session(user_id: int, token: str):
    """Create a new user session."""
    conn = get_db()
    conn.execute(
        "INSERT INTO user_sessions (user_id, token) VALUES (?, ?)",
        (user_id, token)
    )
    conn.commit()
    conn.close()


def end_session(token: str):
    """End a user session."""
    conn = get_db()
    conn.execute(
        """UPDATE user_sessions 
           SET ended_at = datetime('now'), 
               duration_minutes = (julianday(datetime('now')) - julianday(started_at)) * 1440
           WHERE token = ? AND ended_at IS NULL""",
        (token,)
    )
    conn.commit()
    conn.close()


def is_session_active(token: str, user_id: int) -> bool:
    """Check whether a JWT token still has an active (not ended) session row."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT 1
        FROM user_sessions
        WHERE token = ? AND user_id = ? AND ended_at IS NULL
        LIMIT 1
        """,
        (token, user_id)
    )
    row = cursor.fetchone()
    conn.close()
    return row is not None


# ============================================================================
# ANALYTICS QUERIES (for Admin Dashboard)
# ============================================================================

def get_user_count() -> Dict[str, int]:
    """Get total and active user counts."""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as total FROM users")
    total = cursor.fetchone()['total']

    # Active = logged in within last 7 days
    cursor.execute(
        "SELECT COUNT(*) as active FROM users WHERE last_login >= datetime('now', '-7 days')"
    )
    active = cursor.fetchone()['active']

    conn.close()
    return {"total_users": total, "active_users": active}


def get_activity_stats() -> Dict[str, Any]:
    """Get activity statistics for admin dashboard."""
    conn = get_db()
    cursor = conn.cursor()

    # Total activities
    cursor.execute("SELECT COUNT(*) as total FROM user_activity")
    total_activities = cursor.fetchone()['total']

    # Activities by type
    cursor.execute(
        "SELECT activity_type, COUNT(*) as count FROM user_activity GROUP BY activity_type ORDER BY count DESC"
    )
    by_type = [dict(row) for row in cursor.fetchall()]

    # Activities per day (last 30 days)
    cursor.execute("""
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM user_activity
        WHERE created_at >= datetime('now', '-30 days')
        GROUP BY DATE(created_at)
        ORDER BY date
    """)
    daily = [dict(row) for row in cursor.fetchall()]

    # Most searched products
    cursor.execute("""
        SELECT product_name, COUNT(*) as searches
        FROM user_activity
        WHERE product_name IS NOT NULL
        GROUP BY product_name
        ORDER BY searches DESC
        LIMIT 10
    """)
    popular_products = [dict(row) for row in cursor.fetchall()]

    # Most used platforms
    cursor.execute("""
        SELECT platform, COUNT(*) as queries
        FROM user_activity
        WHERE platform IS NOT NULL
        GROUP BY platform
        ORDER BY queries DESC
    """)
    popular_platforms = [dict(row) for row in cursor.fetchall()]

    # Predictions per user
    cursor.execute("SELECT COUNT(*) as total FROM users")
    user_count = cursor.fetchone()['total']
    cursor.execute("SELECT COUNT(*) as preds FROM user_activity WHERE activity_type = 'prediction'")
    pred_count = cursor.fetchone()['preds']
    preds_per_user = pred_count / max(user_count, 1)

    conn.close()
    return {
        "total_activities": total_activities,
        "by_type": by_type,
        "daily_trend": daily,
        "popular_products": popular_products,
        "popular_platforms": popular_platforms,
        "predictions_per_user": round(preds_per_user, 2)
    }


def get_session_stats() -> Dict[str, Any]:
    """Get session statistics for admin dashboard."""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as total FROM user_sessions")
    total_sessions = cursor.fetchone()['total']

    cursor.execute(
        "SELECT AVG(duration_minutes) as avg_duration FROM user_sessions WHERE duration_minutes IS NOT NULL"
    )
    avg_duration = cursor.fetchone()['avg_duration'] or 0

    # Sessions per day (last 30 days)
    cursor.execute("""
        SELECT DATE(started_at) as date, COUNT(*) as sessions, 
               COUNT(DISTINCT user_id) as active_users,
               SUM(CASE WHEN duration_minutes < 1 THEN 1 ELSE 0 END) as bounces
        FROM user_sessions
        WHERE started_at >= datetime('now', '-30 days')
        GROUP BY DATE(started_at)
        ORDER BY date
    """)
    daily = [dict(row) for row in cursor.fetchall()]

    # Calculate bounce rate
    cursor.execute("SELECT COUNT(*) as total FROM user_sessions WHERE duration_minutes IS NOT NULL")
    total_ended = cursor.fetchone()['total']
    cursor.execute("SELECT COUNT(*) as bounces FROM user_sessions WHERE duration_minutes < 1 AND duration_minutes IS NOT NULL")
    bounces = cursor.fetchone()['bounces']
    bounce_rate = (bounces / max(total_ended, 1)) * 100

    conn.close()
    return {
        "total_sessions": total_sessions,
        "avg_session_duration_minutes": round(avg_duration, 2),
        "bounce_rate": round(bounce_rate, 2),
        "daily_trend": daily
    }


def get_recent_logs(limit: int = 100) -> List[Dict]:
    """Get recent activity logs for admin dashboard."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT ua.created_at as timestamp, 
               ua.activity_type,
               ua.details,
               ua.product_name,
               ua.platform,
               u.username
        FROM user_activity ua
        JOIN users u ON ua.user_id = u.id
        ORDER BY ua.created_at DESC
        LIMIT ?
    """, (limit,))
    logs = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return logs


def get_all_users() -> List[Dict]:
    """Get all users for admin view."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT u.id, u.username, u.email, u.full_name, u.created_at, u.last_login, u.is_active,
               COUNT(ua.id) as total_activities
        FROM users u
        LEFT JOIN user_activity ua ON u.id = ua.user_id
        GROUP BY u.id
        ORDER BY u.created_at DESC
    """)
    users = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return users


# ============================================================================
# USER ALERTS (User Panel Persistence)
# ============================================================================

def list_user_alerts(user_id: int) -> List[Dict[str, Any]]:
    """Get all alerts for a user (newest first)."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT alert_id, product_id, condition_text, target_price, status, created_at, triggered_at
        FROM user_alerts
        WHERE user_id = ?
        ORDER BY id DESC
        """,
        (user_id,)
    )
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows


def create_user_alert(user_id: int, product_id: str, target_price: float,
                      condition_text: str, status: str = 'Active') -> Dict[str, Any]:
    """Create a new alert for a user and return the stored alert payload."""
    alert_id = f"alert_{int(datetime.utcnow().timestamp() * 1000)}_{secrets.token_hex(3)}"

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO user_alerts (user_id, alert_id, product_id, condition_text, target_price, status)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (user_id, alert_id, product_id, condition_text, target_price, status)
    )
    conn.commit()
    conn.close()

    return {
        "alert_id": alert_id,
        "product_id": product_id,
        "condition_text": condition_text,
        "target_price": target_price,
        "status": status,
        "created_at": datetime.utcnow().strftime('%Y-%m-%d'),
        "triggered_at": None,
    }


def get_user_alert(user_id: int, alert_id: str) -> Optional[Dict[str, Any]]:
    """Get a single alert by alert_id scoped to user."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT alert_id, product_id, condition_text, target_price, status, created_at, triggered_at
        FROM user_alerts
        WHERE user_id = ? AND alert_id = ?
        """,
        (user_id, alert_id)
    )
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def update_user_alert_status(user_id: int, alert_id: str, status: str,
                             triggered_at: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Update alert status and optional triggered_at timestamp."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        UPDATE user_alerts
        SET status = ?, triggered_at = ?
        WHERE user_id = ? AND alert_id = ?
        """,
        (status, triggered_at, user_id, alert_id)
    )
    conn.commit()
    changed = cursor.rowcount
    conn.close()

    if changed == 0:
        return None
    return get_user_alert(user_id, alert_id)


def update_user_alert(user_id: int, alert_id: str, product_id: str,
                      target_price: float, condition_text: str,
                      status: str, triggered_at: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Update editable alert fields while preserving alert_id."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        UPDATE user_alerts
        SET product_id = ?, condition_text = ?, target_price = ?, status = ?, triggered_at = ?
        WHERE user_id = ? AND alert_id = ?
        """,
        (product_id, condition_text, target_price, status, triggered_at, user_id, alert_id)
    )
    conn.commit()
    changed = cursor.rowcount
    conn.close()

    if changed == 0:
        return None
    return get_user_alert(user_id, alert_id)


def delete_user_alert(user_id: int, alert_id: str) -> bool:
    """Delete alert by alert_id for a user. Returns True if deleted."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "DELETE FROM user_alerts WHERE user_id = ? AND alert_id = ?",
        (user_id, alert_id)
    )
    conn.commit()
    changed = cursor.rowcount
    conn.close()
    return changed > 0


# ============================================================================
# USER PREFERENCES
# ============================================================================

def get_user_preferences(user_id: int) -> Dict[str, Any]:
    """Get user preferences, creating default row if missing."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT budget_min, budget_max, categories_json, platforms_json,
               email_notifications, push_notifications
        FROM user_preferences
        WHERE user_id = ?
        """,
        (user_id,)
    )
    row = cursor.fetchone()

    if not row:
        cursor.execute(
            "INSERT INTO user_preferences (user_id) VALUES (?)",
            (user_id,)
        )
        conn.commit()
        cursor.execute(
            """
            SELECT budget_min, budget_max, categories_json, platforms_json,
                   email_notifications, push_notifications
            FROM user_preferences
            WHERE user_id = ?
            """,
            (user_id,)
        )
        row = cursor.fetchone()

    conn.close()

    return {
        "budgetMin": float(row["budget_min"]),
        "budgetMax": float(row["budget_max"]),
        "categories": json.loads(row["categories_json"] or "[]"),
        "platforms": json.loads(row["platforms_json"] or "[]"),
        "emailNotifications": bool(row["email_notifications"]),
        "pushNotifications": bool(row["push_notifications"]),
    }


def save_user_preferences(user_id: int, preferences: Dict[str, Any]) -> Dict[str, Any]:
    """Upsert user preferences and return saved payload."""
    budget_min = float(preferences.get("budgetMin", 0))
    budget_max = float(preferences.get("budgetMax", 5000))
    categories = preferences.get("categories", [])
    platforms = preferences.get("platforms", ["Amazon", "Flipkart"])
    email_notifications = 1 if preferences.get("emailNotifications", True) else 0
    push_notifications = 1 if preferences.get("pushNotifications", True) else 0

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO user_preferences (
            user_id, budget_min, budget_max, categories_json, platforms_json,
            email_notifications, push_notifications, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(user_id) DO UPDATE SET
            budget_min = excluded.budget_min,
            budget_max = excluded.budget_max,
            categories_json = excluded.categories_json,
            platforms_json = excluded.platforms_json,
            email_notifications = excluded.email_notifications,
            push_notifications = excluded.push_notifications,
            updated_at = datetime('now')
        """,
        (
            user_id,
            budget_min,
            budget_max,
            json.dumps(categories),
            json.dumps(platforms),
            email_notifications,
            push_notifications,
        )
    )
    conn.commit()
    conn.close()

    return get_user_preferences(user_id)


# ============================================================================
# USER WISHLIST
# ============================================================================

def list_user_wishlist(user_id: int) -> List[str]:
    """List product IDs in user's wishlist."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT product_id
        FROM user_wishlist
        WHERE user_id = ?
        ORDER BY created_at DESC
        """,
        (user_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    return [row["product_id"] for row in rows]


def add_user_wishlist_item(user_id: int, product_id: str) -> bool:
    """Add a product to user wishlist. Returns True when inserted."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT OR IGNORE INTO user_wishlist (user_id, product_id)
        VALUES (?, ?)
        """,
        (user_id, product_id)
    )
    conn.commit()
    inserted = cursor.rowcount > 0
    conn.close()
    return inserted


def remove_user_wishlist_item(user_id: int, product_id: str) -> bool:
    """Remove a product from user wishlist. Returns True when removed."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "DELETE FROM user_wishlist WHERE user_id = ? AND product_id = ?",
        (user_id, product_id)
    )
    conn.commit()
    removed = cursor.rowcount > 0
    conn.close()
    return removed


# ============================================================================
# USER PROFILE EXTENDED
# ============================================================================

def get_user_profile_extended(user_id: int) -> Dict[str, str]:
    """Get merged user profile fields from users + user_profile_extended."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT u.full_name, u.email, pe.phone, pe.city, pe.bio
        FROM users u
        LEFT JOIN user_profile_extended pe ON pe.user_id = u.id
        WHERE u.id = ?
        """,
        (user_id,)
    )
    row = cursor.fetchone()
    conn.close()

    if not row:
        return {
            "name": "",
            "email": "",
            "phone": "",
            "city": "",
            "bio": "",
        }

    return {
        "name": row["full_name"] or "",
        "email": row["email"] or "",
        "phone": row["phone"] or "",
        "city": row["city"] or "",
        "bio": row["bio"] or "",
    }


# ============================================================================
# PRODUCT APPROVALS (DATABASE PERSISTENCE)
# ============================================================================

def get_all_approved_products() -> Dict[str, Dict[str, Any]]:
    """Load all approved products from database. Returns dict mapping product_name -> details."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT product_name, pair_id, approved_at FROM product_approvals WHERE status = 'active' ORDER BY approved_at DESC"
    )
    rows = cursor.fetchall()
    conn.close()
    
    approved = {}
    for row in rows:
        approved[row["product_name"]] = {
            "pair_id": row["pair_id"],
            "approved_at": row["approved_at"],
        }
    return approved


def approve_product(product_name: str, pair_id: int = None) -> bool:
    """Add a product to approved list. Returns True if successfully added."""
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            INSERT INTO product_approvals (product_name, pair_id, approved_by, status)
            VALUES (?, ?, 'admin', 'active')
            ON CONFLICT(product_name) DO UPDATE SET status = 'active'
            """,
            (product_name, pair_id)
        )
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        print(f"Error approving product: {e}")
        return False
    finally:
        conn.close()


def reject_product(product_name: str) -> bool:
    """Mark a product as rejected. Returns True if updated."""
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "UPDATE product_approvals SET status = 'rejected' WHERE product_name = ?",
            (product_name,)
        )
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        print(f"Error rejecting product: {e}")
        return False
    finally:
        conn.close()


def is_product_approved(product_name: str) -> bool:
    """Check if a product is in approved status."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id FROM product_approvals WHERE product_name = ? AND status = 'active'",
        (product_name,)
    )
    exists = cursor.fetchone() is not None
    conn.close()
    return exists


def save_user_profile_extended(user_id: int, profile: Dict[str, str]) -> Dict[str, str]:
    """Save merged profile fields into users + user_profile_extended."""
    name = (profile.get("name") or "").strip()
    email = (profile.get("email") or "").strip()
    phone = (profile.get("phone") or "").strip()
    city = (profile.get("city") or "").strip()
    bio = (profile.get("bio") or "").strip()

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE users
        SET full_name = ?, email = ?
        WHERE id = ?
        """,
        (name, email, user_id)
    )

    cursor.execute(
        """
        INSERT INTO user_profile_extended (user_id, phone, city, bio, updated_at)
        VALUES (?, ?, ?, ?, datetime('now'))
        ON CONFLICT(user_id) DO UPDATE SET
            phone = excluded.phone,
            city = excluded.city,
            bio = excluded.bio,
            updated_at = datetime('now')
        """,
        (user_id, phone, city, bio)
    )

    conn.commit()
    conn.close()

    return get_user_profile_extended(user_id)


# ============================================================================
# ADMIN SETTINGS
# ============================================================================

def _parse_admin_setting(value: str, value_type: str) -> Any:
    """Convert stored admin setting value back to its native type."""
    if value_type == "boolean":
        return str(value).lower() == "true"
    if value_type == "number":
        try:
            parsed = float(value)
            if parsed.is_integer():
                return int(parsed)
            return parsed
        except Exception:
            return value
    if value_type == "json":
        try:
            return json.loads(value)
        except Exception:
            return value
    return value


def get_admin_settings() -> Dict[str, Any]:
    """Get all admin settings as key-value dictionary."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT key, value, value_type FROM admin_settings ORDER BY key")
    rows = cursor.fetchall()
    conn.close()

    settings: Dict[str, Any] = {}
    for row in rows:
        settings[row["key"]] = _parse_admin_setting(row["value"], row["value_type"])
    return settings


def save_admin_settings(settings: Dict[str, Any]) -> Dict[str, Any]:
    """Upsert multiple admin settings and return updated map."""
    conn = get_db()
    cursor = conn.cursor()

    for key, value in settings.items():
        if isinstance(value, bool):
            value_type = "boolean"
            stored_value = "true" if value else "false"
        elif isinstance(value, (dict, list)):
            value_type = "json"
            stored_value = json.dumps(value)
        elif isinstance(value, (int, float)):
            value_type = "number"
            stored_value = str(value)
        else:
            value_type = "string"
            stored_value = str(value)

        cursor.execute(
            """
            INSERT INTO admin_settings (key, value, value_type, updated_at)
            VALUES (?, ?, ?, datetime('now'))
            ON CONFLICT(key) DO UPDATE SET
                value = excluded.value,
                value_type = excluded.value_type,
                updated_at = datetime('now')
            """,
            (key, stored_value, value_type)
        )

    conn.commit()
    conn.close()
    return get_admin_settings()


# ============================================================================
# DB MIGRATION / VERSION STATUS
# ============================================================================

def get_db_setup_status() -> Dict[str, Any]:
    """Return lightweight DB migration and schema status for frontend checks."""
    required_tables = [
        'users',
        'user_activity',
        'user_sessions',
        'user_alerts',
        'user_preferences',
        'user_wishlist',
        'admin_settings',
        'user_profile_extended',
    ]

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("PRAGMA user_version")
    row = cursor.fetchone()
    db_user_version = int(row[0] if row else 0)

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    existing_tables = {r['name'] for r in cursor.fetchall()}

    missing_tables = [name for name in required_tables if name not in existing_tables]
    all_required_present = len(missing_tables) == 0

    conn.close()

    return {
        'schema_version_expected': SCHEMA_VERSION,
        'schema_version_db': db_user_version,
        'all_required_tables_present': all_required_present,
        'missing_tables': missing_tables,
        'required_tables_count': len(required_tables),
        'found_tables_count': len(required_tables) - len(missing_tables),
        'db_path': DB_PATH,
    }
