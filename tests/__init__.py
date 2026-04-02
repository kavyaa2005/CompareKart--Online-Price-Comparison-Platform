"""
Integration Test Suite
Complete test coverage for all critical user workflows and data persistence
"""

__version__ = "1.0.0"
__author__ = "Project Team"

# Test modules
from . import conftest
from . import test_helpers

__all__ = [
    "conftest",
    "test_helpers",
]
