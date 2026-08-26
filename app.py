"""Mahadev Photography API - Complete Fixed Version"""

import base64
import hashlib
import hmac
import json
import os
import time
from datetime import datetime
from functools import wraps

# Load .env first
try:
    from dotenv import load_dotenv
    load_dotenv()
    print("✅ .env file loaded successfully")
except ImportError:
    print("⚠️ python-dotenv not installed, using system environment variables")
except Exception as e:
    print(f"⚠️ Error loading .env: {e}")

try:
    import pymysql
    print("✅ pymysql imported successfully")
except ImportError as e:
    print(f"❌ pymysql not installed: {e}")
    print("Run: pip install pymysql")
    exit(1)

try:
    from flask import Flask, jsonify, request, g, send_from_directory
    print("✅ Flask imported successfully")
except ImportError as e:
    print(f"❌ Flask not installed: {e}")
    print("Run: pip install flask")
    exit(1)

try:
    from werkzeug.security import generate_password_hash, check_password_hash
    print("✅ werkzeug imported successfully")
except ImportError as e:
    print(f"❌ werkzeug not installed: {e}")
    print("Run: pip install werkzeug")
    exit(1)

app = Flask(__name__, static_folder='.')
app.config['JSON_SORT_KEYS'] = False
app.config['JSON_AS_ASCII'] = False

# ========================================
# PRINT ENVIRONMENT FOR DEBUGGING
# ========================================

print("\n=== ENVIRONMENT VARIABLES ===")
print(f"DB_HOST: {os.environ.get('DB_HOST', 'NOT SET')}")
print(f"DB_PORT: {os.environ.get('DB_PORT', 'NOT SET')}")
print(f"DB_NAME: {os.environ.get('DB_NAME', 'NOT SET')}")
print(f"DB_USER: {os.environ.get('DB_USER', 'NOT SET')}")
print(f"DB_PASSWORD: {'*' * len(os.environ.get('DB_PASSWORD', '')) if os.environ.get('DB_PASSWORD') else 'NOT SET'}")
print("==============================\n")

# ========================================
# DATABASE CONNECTION (FIXED)
# ========================================

def get_db_config():
    """Get database configuration from environment with defaults"""
    return {
        'host': os.environ.get('DB_HOST', 'localhost'),
        'port': int(os.environ.get('DB_PORT', '3306')),
        'user': os.environ.get('DB_USER', 'root'),
        'password': os.environ.get('DB_PASSWORD', ''),
        'database': os.environ.get('DB_NAME', 'mahadev_photography'),
        'charset': 'utf8mb4',
        'cursorclass': pymysql.cursors.DictCursor,
        'autocommit': True,
        'connect_timeout': 10
    }

def get_db():
    """Get database connection with connection pooling"""
    if not hasattr(g, 'db'):
        try:
            config = get_db_config()
            print(f"🔌 Connecting to MySQL: {config['host']}:{config['port']}/{config['database']} as {config['user']}")
            g.db = pymysql.connect(**config)
            print("✅ Database connection established")
        except pymysql.err.OperationalError as e:
            print(f"❌ Database connection error: {e}")
            print("\nPossible fixes:")
            print("1. Make sure MySQL is running: 'net start MySQL80'")
            print("2. Check your password in .env file")
            print("3. Check database name: 'mahadev_photography'")
            return None
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            return None
    return g.db

@app.teardown_appcontext
def close_db(error):
    """Close database connection after request"""
    if hasattr(g, 'db'):
        try:
            g.db.close()
            print("🔌 Database connection closed")
        except:
            pass

def db():
    return get_db()

# ========================================
# RESPONSE HELPERS
# ========================================

def response(data, status=200):
    """Send JSON response"""
    return jsonify(data), status

@app.after_request
def cors(res):
    """Add CORS headers"""
    origin = os.environ.get('CORS_ORIGIN', '*')
    res.headers['Access-Control-Allow-Origin'] = origin
    res.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
    res.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    res.headers['Access-Control-Allow-Credentials'] = 'true'
    return res

def get_input():
    """Get JSON input from request"""
    return request.get_json(silent=True) or {}

# ========================================
# AUTHENTICATION
# ========================================

def generate_token(user):
    """Generate JWT-like token"""
    payload = {
        'id': user['id'],
        'email': user['email'],
        'name': user['name'],
        'role': user['role'],
        'exp': int(time.time()) + 43200  # 12 hours
    }
    body = base64.urlsafe_b64encode(
        json.dumps(payload, separators=(',', ':')).encode()
    ).decode().rstrip('=')
    
    secret = os.environ.get('AUTH_SECRET')
    if not secret:
        secret = 'default-secret-change-me-in-production'
        print("WARNING: Using default AUTH_SECRET. Set this in environment variables!")
    
    signature = hmac.new(
        secret.encode(),
        body.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return f"{body}.{signature}"

def verify_token(token):
    """Verify and decode token"""
    try:
        if not token or '.' not in token:
            return None
        
        body, signature = token.split('.', 1)
        secret = os.environ.get('AUTH_SECRET')
        if not secret:
            secret = 'default-secret-change-me-in-production'
        
        expected = hmac.new(
            secret.encode(),
            body.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(signature, expected):
            return None
        
        padding = 4 - (len(body) % 4)
        if padding != 4:
            body += '=' * padding
        
        payload = json.loads(base64.urlsafe_b64decode(body))
        
        if payload['exp'] < time.time():
            return None
        
        return payload
    except Exception as e:
        print(f"Token verification error: {e}")
        return None

def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return response({'error': 'Authentication required'}, 401)
        
        token = auth_header[7:]
        user = verify_token(token)
        
        if not user:
            return response({'error': 'Invalid or expired session'}, 401)
        
        g.user = user
        return f(*args, **kwargs)
    return decorated

# ========================================
# AUTH ENDPOINT (FIXED)
# ========================================

@app.route('/api/auth.py', methods=['POST', 'OPTIONS'])
def auth():
    """Admin login"""
    if request.method == 'OPTIONS':
        return response({})
    
    data = get_input()
    email = str(data.get('email', '')).strip().lower()
    password = str(data.get('password', ''))
    
    print(f"🔐 Login attempt: {email}")
    
    if not email or not password:
        return response({'error': 'Email and password are required'}, 400)
    
    conn = db()
    if not conn:
        print("❌ No database connection")
        return response({'error': 'Database connection failed. Please check your configuration.'}, 500)
    
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT * FROM users WHERE LOWER(email) = %s LIMIT 1",
                (email,)
            )
            user = cur.fetchone()
            
            if not user:
                print(f"❌ User not found: {email}")
                return response({'error': 'Invalid email or password'}, 401)
            
            stored = user['password']
            print(f"🔐 Found user: {user['name']} ({user['email']})")
            
            # Check password (supports both hashed and plain)
            valid = False
            if stored.startswith(('pbkdf2:', 'scrypt:', '$2y$', '$2a$', '$2b$')):
                try:
                    valid = check_password_hash(stored, password)
                except:
                    valid = False
            else:
                valid = hmac.compare_digest(stored, password)
            
            if not valid:
                print(f"❌ Invalid password for: {email}")
                return response({'error': 'Invalid email or password'}, 401)
            
            # Upgrade legacy password
            if not stored.startswith(('pbkdf2:', 'scrypt:', '$2y$', '$2a$', '$2b$')):
                try:
                    hashed = generate_password_hash(password)
                    cur.execute(
                        "UPDATE users SET password = %s WHERE id = %s",
                        (hashed, user['id'])
                    )
                    print(f"✅ Password upgraded for: {email}")
                except Exception as e:
                    print(f"⚠️ Password upgrade failed: {e}")
            
            token = generate_token(user)
            print(f"✅ Login successful: {email}")
            
            return response({
                'success': True,
                'token': token,
                'user': {
                    'id': user['id'],
                    'name': user['name'],
                    'email': user['email'],
                    'role': user['role']
                }
            })
    except Exception as e:
        print(f"❌ Login error: {e}")
        return response({'error': f'Login failed: {str(e)}'}, 500)

# ========================================
# GALLERY ENDPOINT
# ========================================

@app.route('/api/gallery.py', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
def gallery():
    """Gallery CRUD operations"""
    if request.method == 'OPTIONS':
        return response({})
    
    if request.method != 'GET':
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return response({'error': 'Authentication required'}, 401)
        
        token = auth_header[7:]
        user = verify_token(token)
        if not user:
            return response({'error': 'Invalid or expired session'}, 401)
    
    conn = db()
    if not conn:
        return response({'error': 'Database connection failed'}, 500)
    
    try:
        with conn.cursor() as cur:
            if request.method == 'GET':
                image_id = request.args.get('id')
                
                if image_id:
                    cur.execute("SELECT * FROM gallery WHERE id = %s", (image_id,))
                    item = cur.fetchone()
                    if item:
                        return response({'success': True, 'data': item})
                    return response({'error': 'Image not found'}, 404)
                
                cur.execute("SELECT * FROM gallery ORDER BY created_at DESC")
                return response({'success': True, 'data': cur.fetchall()})
            
            data = get_input()
            image_id = data.get('id') or request.args.get('id')
            
            if request.method == 'DELETE':
                if not image_id:
                    return response({'error': 'ID is required'}, 400)
                
                cur.execute("DELETE FROM gallery WHERE id = %s", (image_id,))
                return response({'success': True, 'message': 'Image deleted'})
            
            title = str(data.get('title', '')).strip()
            image_url = str(data.get('image_url', '')).strip()
            
            if not title or not image_url:
                return response({'error': 'Title and image URL are required'}, 400)
            
            category = data.get('category', 'custom')
            description = data.get('description', '')
            featured = 1 if data.get('featured') else 0
            
            if request.method == 'POST':
                cur.execute("""
                    INSERT INTO gallery (title, category, image_url, description, featured)
                    VALUES (%s, %s, %s, %s, %s)
                """, (title, category, image_url, description, featured))
                
                return response({
                    'success': True,
                    'id': cur.lastrowid,
                    'message': 'Image added'
                }, 201)
            
            if not image_id:
                return response({'error': 'ID is required'}, 400)
            
            cur.execute("""
                UPDATE gallery 
                SET title = %s, category = %s, image_url = %s, 
                    description = %s, featured = %s
                WHERE id = %s
            """, (title, category, image_url, description, featured, image_id))
            
            return response({'success': True, 'message': 'Image updated'})
    except Exception as e:
        print(f"❌ Gallery error: {e}")
        return response({'error': str(e)}, 500)

# ========================================
# PACKAGES ENDPOINT
# ========================================

@app.route('/api/packages.py', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
def packages():
    """Packages CRUD operations"""
    if request.method == 'OPTIONS':
        return response({})
    
    if request.method != 'GET':
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return response({'error': 'Authentication required'}, 401)
        
        token = auth_header[7:]
        user = verify_token(token)
        if not user:
            return response({'error': 'Invalid or expired session'}, 401)
    
    conn = db()
    if not conn:
        return response({'error': 'Database connection failed'}, 500)
    
    try:
        with conn.cursor() as cur:
            if request.method == 'GET':
                package_id = request.args.get('id')
                
                if package_id:
                    cur.execute("SELECT * FROM packages WHERE id = %s", (package_id,))
                    item = cur.fetchone()
                    if item:
                        try:
                            item['features'] = json.loads(item['features'] or '[]')
                        except:
                            item['features'] = []
                        return response({'success': True, 'data': item})
                    return response({'error': 'Package not found'}, 404)
                
                cur.execute("SELECT * FROM packages ORDER BY price ASC")
                items = cur.fetchall()
                for item in items:
                    try:
                        item['features'] = json.loads(item['features'] or '[]')
                    except:
                        item['features'] = []
                return response({'success': True, 'data': items})
            
            data = get_input()
            package_id = data.get('id') or request.args.get('id')
            
            if request.method == 'DELETE':
                if not package_id:
                    return response({'error': 'ID is required'}, 400)
                
                cur.execute("DELETE FROM packages WHERE id = %s", (package_id,))
                return response({'success': True, 'message': 'Package deleted'})
            
            name = str(data.get('name', '')).strip()
            price = data.get('price')
            
            if not name or price is None:
                return response({'error': 'Name and price are required'}, 400)
            
            try:
                price = float(price)
            except:
                return response({'error': 'Invalid price format'}, 400)
            
            features = data.get('features', [])
            if isinstance(features, str):
                try:
                    features = json.loads(features)
                except:
                    features = [features]
            
            featured = 1 if data.get('featured') else 0
            
            if request.method == 'POST':
                cur.execute("""
                    INSERT INTO packages (name, price, features, featured)
                    VALUES (%s, %s, %s, %s)
                """, (name, price, json.dumps(features), featured))
                
                return response({
                    'success': True,
                    'id': cur.lastrowid,
                    'message': 'Package added'
                }, 201)
            
            if not package_id:
                return response({'error': 'ID is required'}, 400)
            
            cur.execute("""
                UPDATE packages 
                SET name = %s, price = %s, features = %s, featured = %s
                WHERE id = %s
            """, (name, price, json.dumps(features), featured, package_id))
            
            return response({'success': True, 'message': 'Package updated'})
    except Exception as e:
        print(f"❌ Packages error: {e}")
        return response({'error': str(e)}, 500)

# ========================================
# SUBMISSIONS ENDPOINT
# ========================================

@app.route('/api/submissions.py', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
def submissions():
    """Contact form submissions"""
    if request.method == 'OPTIONS':
        return response({})
    
    conn = db()
    if not conn:
        return response({'error': 'Database connection failed'}, 500)
    
    try:
        with conn.cursor() as cur:
            if request.method == 'GET':
                auth_header = request.headers.get('Authorization', '')
                if not auth_header.startswith('Bearer '):
                    return response({'error': 'Authentication required'}, 401)
                
                token = auth_header[7:]
                user = verify_token(token)
                if not user:
                    return response({'error': 'Invalid or expired session'}, 401)
                
                cur.execute("SELECT * FROM submissions ORDER BY created_at DESC")
                return response({'success': True, 'data': cur.fetchall()})
            
            if request.method == 'POST':
                data = get_input()
                
                name = str(data.get('name', '')).strip()
                email = str(data.get('email', '')).strip()
                message = str(data.get('message', '')).strip()
                
                if not name or not email or not message:
                    return response({
                        'error': 'Name, email, and message are required'
                    }, 400)
                
                phone = data.get('phone', '')
                service = data.get('service', '')
                
                cur.execute("""
                    INSERT INTO submissions (name, email, phone, service, message, status)
                    VALUES (%s, %s, %s, %s, %s, 'new')
                """, (name, email, phone, service, message))
                
                return response({
                    'success': True,
                    'message': 'Thank you. We will be in touch shortly.'
                }, 201)
            
            auth_header = request.headers.get('Authorization', '')
            if not auth_header.startswith('Bearer '):
                return response({'error': 'Authentication required'}, 401)
            
            token = auth_header[7:]
            user = verify_token(token)
            if not user:
                return response({'error': 'Invalid or expired session'}, 401)
            
            data = get_input()
            submission_id = data.get('id') or request.args.get('id')
            
            if not submission_id:
                return response({'error': 'ID is required'}, 400)
            
            if request.method == 'DELETE':
                cur.execute("DELETE FROM submissions WHERE id = %s", (submission_id,))
                return response({'success': True, 'message': 'Submission deleted'})
            
            status = data.get('status')
            if status not in ('new', 'read', 'replied'):
                return response({'error': 'Invalid status. Must be new, read, or replied'}, 400)
            
            cur.execute(
                "UPDATE submissions SET status = %s WHERE id = %s",
                (status, submission_id)
            )
            return response({'success': True, 'message': 'Status updated'})
    except Exception as e:
        print(f"❌ Submissions error: {e}")
        return response({'error': str(e)}, 500)

# ========================================
# DASHBOARD ENDPOINT
# ========================================

@app.route('/api/dashboard.py', methods=['GET', 'OPTIONS'])
def dashboard():
    """Dashboard statistics"""
    if request.method == 'OPTIONS':
        return response({})
    
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return response({'error': 'Authentication required'}, 401)
    
    token = auth_header[7:]
    user = verify_token(token)
    if not user:
        return response({'error': 'Invalid or expired session'}, 401)
    
    conn = db()
    if not conn:
        return response({'error': 'Database connection failed'}, 500)
    
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) as count FROM gallery")
            total_images = cur.fetchone()['count']
            
            cur.execute("SELECT COUNT(*) as count FROM packages")
            total_packages = cur.fetchone()['count']
            
            cur.execute("SELECT COUNT(*) as count FROM submissions")
            total_submissions = cur.fetchone()['count']
            
            cur.execute("SELECT COALESCE(SUM(price), 0) as total FROM packages")
            total_revenue = float(cur.fetchone()['total'])
            
            cur.execute("SELECT * FROM submissions ORDER BY created_at DESC LIMIT 5")
            recent_submissions = cur.fetchall()
            
            for sub in recent_submissions:
                if sub.get('created_at'):
                    sub['created_at'] = sub['created_at'].isoformat() if hasattr(sub['created_at'], 'isoformat') else str(sub['created_at'])
            
            return response({
                'success': True,
                'data': {
                    'total_images': total_images,
                    'total_packages': total_packages,
                    'total_submissions': total_submissions,
                    'total_revenue': total_revenue,
                    'recent_submissions': recent_submissions
                }
            })
    except Exception as e:
        print(f"❌ Dashboard error: {e}")
        return response({'error': str(e)}, 500)

# ========================================
# HEALTH CHECK
# ========================================

@app.route('/api/health', methods=['GET', 'OPTIONS'])
def health():
    """Health check endpoint"""
    if request.method == 'OPTIONS':
        return response({})
    
    conn = db()
    db_status = 'connected' if conn else 'disconnected'
    
    return response({
        'status': 'ok',
        'timestamp': datetime.now().isoformat(),
        'database': db_status,
        'environment': os.environ.get('FLASK_ENV', 'development')
    })

# ========================================
# SERVE STATIC FILES
# ========================================

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    if path.startswith('api/'):
        return response({'error': 'API endpoint not found'}, 404)
    return send_from_directory('.', path)

# ========================================
# RUN APPLICATION
# ========================================

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV', 'development') == 'development'
    
    print("\n🚀 Starting Mahadev Photography Server...")
    print(f"📍 http://localhost:{port}")
    print(f"🔧 Debug mode: {debug}")
    print("\n📋 Admin Login:")
    print("   Email: admin@mahadevphotography.com")
    print("   Password: admin123")
    print("\n" + "="*50 + "\n")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
    
@app.route('/api/debug-env', methods=['GET'])
def debug_env():
    """Debug environment variables"""
    return response({
        'DB_HOST': os.environ.get('DB_HOST', 'NOT SET'),
        'DB_PORT': os.environ.get('DB_PORT', 'NOT SET'),
        'DB_NAME': os.environ.get('DB_NAME', 'NOT SET'),
        'DB_USER': os.environ.get('DB_USER', 'NOT SET'),
        'DB_PASSWORD': '***' if os.environ.get('DB_PASSWORD') else 'NOT SET',
        'DB_SSL': os.environ.get('DB_SSL', 'NOT SET'),
        'FLASK_ENV': os.environ.get('FLASK_ENV', 'NOT SET')
    })