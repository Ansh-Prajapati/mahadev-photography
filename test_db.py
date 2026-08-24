"""Test database connection - Run this first!"""

import os
import sys

# Load .env
try:
    from dotenv import load_dotenv
    load_dotenv()
    print("✅ .env loaded")
except:
    print("⚠️ python-dotenv not installed")

try:
    import pymysql
    print("✅ pymysql imported")
except ImportError:
    print("❌ pymysql not installed. Run: pip install pymysql")
    sys.exit(1)

# Get configuration
config = {
    'host': os.environ.get('DB_HOST', 'localhost'),
    'port': int(os.environ.get('DB_PORT', '3306')),
    'user': os.environ.get('DB_USER', 'root'),
    'password': os.environ.get('DB_PASSWORD', ''),
    'database': os.environ.get('DB_NAME', 'mahadev_photography'),
    'charset': 'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor,
    'autocommit': True
}

print("\n=== Database Configuration ===")
print(f"Host: {config['host']}")
print(f"Port: {config['port']}")
print(f"Database: {config['database']}")
print(f"User: {config['user']}")
print(f"Password: {'*' * len(config['password'])}")
print("===============================\n")

print("🔌 Attempting to connect...")

try:
    conn = pymysql.connect(**config)
    print("✅ Connection successful!\n")
    
    with conn.cursor() as cur:
        # Check users table
        cur.execute("SELECT COUNT(*) as count FROM users")
        user_count = cur.fetchone()['count']
        print(f"✅ Users: {user_count}")
        
        # Check packages
        cur.execute("SELECT COUNT(*) as count FROM packages")
        package_count = cur.fetchone()['count']
        print(f"✅ Packages: {package_count}")
        
        # Show users
        cur.execute("SELECT id, name, email, role FROM users")
        users = cur.fetchall()
        print("\n📋 Users:")
        for user in users:
            print(f"   - {user['name']} ({user['email']}) - {user['role']}")
    
    conn.close()
    print("\n🎉 Database is ready!")
    
except pymysql.err.OperationalError as e:
    print(f"❌ Connection error: {e}")
    print("\nPossible fixes:")
    print("1. Start MySQL: net start MySQL80")
    print("2. Check password in .env file")
    print("3. Verify database exists: CREATE DATABASE mahadev_photography;")
    
except Exception as e:
    print(f"❌ Error: {e}")