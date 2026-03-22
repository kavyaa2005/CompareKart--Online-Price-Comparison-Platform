"""
Pytest configuration and fixtures for integration tests
"""

import pytest
import os
import sys
import tempfile
import sqlite3
from pathlib import Path

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from src.database import init_database, hash_password, get_db
from src.api import app
from fastapi.testclient import TestClient


@pytest.fixture(scope="session")
def test_db():
    """Create isolated test database for the entire session."""
    # Use temporary directory
    temp_dir = tempfile.mkdtemp()
    db_path = os.path.join(temp_dir, 'test_users.db')
    
    # Override DB_PATH in database module
    import src.database
    original_db_path = src.database.DB_PATH
    src.database.DB_PATH = db_path
    
    # Initialize test database
    init_database()
    
    yield db_path
    
    # Cleanup
    src.database.DB_PATH = original_db_path
    if os.path.exists(db_path):
        os.remove(db_path)


@pytest.fixture
def client(test_db):
    """Create FastAPI test client with isolated database."""
    return TestClient(app)


@pytest.fixture
def test_user_data():
    """Test user credentials for consistent testing."""
    return {
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "Test@123456",
        "full_name": "Test User"
    }


@pytest.fixture
def test_admin_data():
    """Test admin credentials."""
    return {
        "username": "admin",
        "email": "admin@example.com",
        "password": "Admin@123456",
        "full_name": "Admin User"
    }


@pytest.fixture
def registered_user(client, test_user_data):
    """Create and register a test user."""
    response = client.post("/auth/register", json=test_user_data)
    assert response.status_code == 201
    return test_user_data


@pytest.fixture
def registered_admin(client, test_admin_data):
    """Create and register a test admin."""
    data = test_admin_data.copy()
    data["role"] = "admin"
    response = client.post("/auth/register", json=data)
    assert response.status_code == 201
    return test_admin_data


@pytest.fixture
def user_token(client, registered_user, test_user_data):
    """Get authentication token for regular user."""
    response = client.post("/auth/login", json={
        "username": test_user_data["username"],
        "password": test_user_data["password"]
    })
    assert response.status_code == 200
    data = response.json()
    return data.get("access_token") or data.get("token")


@pytest.fixture
def admin_token(client, registered_admin, test_admin_data):
    """Get authentication token for admin."""
    response = client.post("/auth/login", json={
        "username": test_admin_data["username"],
        "password": test_admin_data["password"]
    })
    assert response.status_code == 200
    data = response.json()
    return data.get("access_token") or data.get("token")


@pytest.fixture
def authenticated_client(client, user_token):
    """Create client with authenticated headers for regular user."""
    client.headers = {"Authorization": f"Bearer {user_token}"}
    return client


@pytest.fixture
def authenticated_admin_client(client, admin_token):
    """Create client with authenticated headers for admin."""
    client.headers = {"Authorization": f"Bearer {admin_token}"}
    return client
