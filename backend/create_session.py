#!/usr/bin/env python
"""
Create a Django session for testing - bypasses login form
This creates a session cookie you can use in your browser
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from django.contrib.sessions.models import Session
from django.contrib.auth import login
from django.test import RequestFactory
from django.contrib.sessions.middleware import SessionMiddleware
from django.contrib.auth.middleware import AuthenticationMiddleware
import json

def create_session_for_user(username='instructor', password='instructor123'):
    """Create a session for a user and return session key"""
    print("=" * 60)
    print("CREATING SESSION FOR PORTAL LOGIN")
    print("=" * 60)
    
    # Get user
    try:
        user = User.objects.get(username=username)
        print(f"\n✅ Found user: {user.username}")
    except User.DoesNotExist:
        print(f"\n❌ User '{username}' not found!")
        return None
    
    # Authenticate
    from django.contrib.auth import authenticate
    auth_user = authenticate(username=username, password=password)
    if not auth_user:
        print(f"❌ Authentication failed for {username}")
        return None
    
    print(f"✅ Authentication successful")
    
    # Create a request factory
    factory = RequestFactory()
    request = factory.get('/portal/login/')
    
    # Add session middleware
    middleware = SessionMiddleware(lambda req: None)
    middleware.process_request(request)
    request.session.save()
    
    # Add auth middleware
    auth_middleware = AuthenticationMiddleware(lambda req: None)
    auth_middleware.process_request(request)
    
    # Log in the user
    login(request, auth_user)
    request.session.save()
    
    session_key = request.session.session_key
    print(f"\n✅ Session created!")
    print(f"\n📋 SESSION KEY: {session_key}")
    print(f"\n🔧 To use this in your browser:")
    print(f"   1. Open browser developer tools (F12)")
    print(f"   2. Go to Application/Storage tab")
    print(f"   3. Find Cookies -> http://localhost:8000")
    print(f"   4. Add/edit cookie:")
    print(f"      Name: sessionid")
    print(f"      Value: {session_key}")
    print(f"      Domain: localhost")
    print(f"      Path: /")
    print(f"   5. Refresh the page")
    print(f"\n   OR use this URL (if your browser supports it):")
    print(f"   http://localhost:8000/portal/instructor/")
    print(f"\n   Then manually set the cookie in browser dev tools")
    
    return session_key

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='Create Django session for testing')
    parser.add_argument('--username', default='instructor', help='Username to create session for')
    parser.add_argument('--password', default='instructor123', help='Password')
    args = parser.parse_args()
    
    create_session_for_user(args.username, args.password)

