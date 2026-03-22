"""
Run SQLite schema migration + seed flow for the project database.
Usage:
  python -m src.run_migrations
  python -m src.run_migrations --no-seed
  python -m src.run_migrations --status
"""

import argparse
import json

try:
    from .database import migrate_database, get_db_setup_status
except ImportError:
    from database import migrate_database, get_db_setup_status


def main():
    parser = argparse.ArgumentParser(description="Run DB migrations for users.db")
    parser.add_argument(
        "--no-seed",
        action="store_true",
        help="Run schema migrations only (skip default seeding).",
    )
    parser.add_argument(
        "--status",
        action="store_true",
        help="Print setup status after migration.",
    )
    args = parser.parse_args()

    result = migrate_database(seed=not args.no_seed)

    print("Migration complete")
    print(json.dumps(result, indent=2))

    if args.status:
        print("\nSetup status")
        print(json.dumps(get_db_setup_status(), indent=2))


if __name__ == "__main__":
    main()
