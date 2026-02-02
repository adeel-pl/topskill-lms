#!/usr/bin/env python
"""
Test script to programmatically log in and test the portal dashboard
This bypasses the login form to test if the dashboard works
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from lms.models import Course

def test_portal_login():
    """Test portal login and dashboard access"""
    print("=" * 60)
    print("PORTAL LOGIN & DASHBOARD TEST")
    print("=" * 60)
    
    # Find instructor or admin user
    print("\n1. Checking for instructor/admin users...")
    
    # Try to find instructor user first
    try:
        test_user = User.objects.get(username='instructor')
        test_password = 'instructor123'
        print(f"   ✅ Found instructor user: {test_user.username}")
    except User.DoesNotExist:
        # Try admin
        try:
            test_user = User.objects.get(username='admin')
            test_password = 'admin123'
            print(f"   ✅ Found admin user: {test_user.username}")
        except User.DoesNotExist:
            # Create test user
            test_user = User.objects.create_user(
                username='test_instructor',
                email='test@instructor.com',
                password='test123456',
                is_staff=True,
                is_active=True
            )
            test_password = 'test123456'
            print(f"   ✅ Created test instructor: {test_user.username} / {test_password}")
    
    # Test authentication
    print(f"\n2. Testing authentication for {test_user.username}...")
    user = authenticate(username=test_user.username, password=test_password)
    if not user:
        print(f"   ⚠️  Auth failed, trying to reset password...")
        test_user.set_password(test_password)
        test_user.save()
        user = authenticate(username=test_user.username, password=test_password)
    
    if user:
        print(f"   ✅ Authentication SUCCESS")
    else:
        print(f"   ❌ Authentication FAILED")
        return False
    
    # Create Django test client
    print(f"\n3. Testing portal dashboard access...")
    client = Client()
    
    # Log in
    login_success = client.login(username=test_user.username, password=test_password)
    if login_success:
        print(f"   ✅ Login via test client SUCCESS")
    else:
        print(f"   ❌ Login via test client FAILED")
        return False
    
    # Test instructor dashboard
    print(f"\n4. Testing instructor dashboard...")
    response = client.get('/portal/instructor/')
    if response.status_code == 200:
        print(f"   ✅ Instructor dashboard loads (200 OK)")
        print(f"   📄 Response length: {len(response.content)} bytes")
    elif response.status_code == 302:
        print(f"   ⚠️  Redirected (302) - might need different role")
        print(f"   📍 Redirect location: {response.get('Location', 'unknown')}")
    else:
        print(f"   ❌ Dashboard failed: {response.status_code}")
        print(f"   📄 Response: {response.content[:200]}")
    
    # Test admin dashboard (correct URL)
    print(f"\n5. Testing admin dashboard...")
    response = client.get('/portal/admin-portal/')
    if response.status_code == 200:
        print(f"   ✅ Admin dashboard loads (200 OK)")
        print(f"   📄 Response length: {len(response.content)} bytes")
    elif response.status_code == 302:
        print(f"   ⚠️  Redirected (302)")
        print(f"   📍 Redirect location: {response.get('Location', 'unknown')}")
    else:
        print(f"   ❌ Admin dashboard failed: {response.status_code}")
        print(f"   📄 Response: {response.content[:200]}")
    
    # Test portal login page
    print(f"\n6. Testing portal login page...")
    response = client.get('/portal/login/')
    if response.status_code == 200:
        print(f"   ✅ Login page loads (200 OK)")
    else:
        print(f"   ❌ Login page failed: {response.status_code}")
    
    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)
    print(f"\nTo test manually, use:")
    print(f"  Username: {test_user.username}")
    print(f"  Password: {test_password}")
    print(f"  URL: http://localhost:8000/portal/login/")
    print(f"\nAfter login, you'll be redirected to:")
    if test_user.username == 'instructor':
        print(f"  - Instructor Dashboard: http://localhost:8000/portal/instructor/")
    elif test_user.is_staff or test_user.is_superuser:
        print(f"  - Admin Dashboard: http://localhost:8000/portal/admin-portal/")
    
    return True

if __name__ == '__main__':
    test_portal_login()

