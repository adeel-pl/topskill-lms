#!/usr/bin/env python
"""
Test all 3 users login in browser simulation
"""
import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from portal.views import get_user_role

def test_user_login(username, password):
    """Test a single user login"""
    print(f'\n{"="*70}')
    print(f'Testing: {username} / {password}')
    print(f'{"="*70}')
    
    # Check user exists
    try:
        user = User.objects.get(username=username)
        print(f'✅ User exists in DB')
    except User.DoesNotExist:
        print(f'❌ User NOT FOUND in DB')
        return False
    
    # Test authentication
    auth_user = authenticate(username=username, password=password)
    if not auth_user:
        print(f'❌ Authentication FAILED')
        return False
    print(f'✅ Authentication SUCCESS')
    
    # Test role detection
    role = get_user_role(auth_user)
    print(f'✅ Role detected: {role}')
    
    # Test login via client
    client = Client()
    login_success = client.login(username=username, password=password)
    if not login_success:
        print(f'❌ Client login FAILED')
        return False
    print(f'✅ Client login SUCCESS')
    
    # Test redirect
    response = client.get('/portal/login/')
    if response.status_code == 302:
        redirect_url = response.url
        print(f'✅ Redirects to: {redirect_url}')
        if 'instructor' in redirect_url:
            print(f'   ✅ Correct redirect to instructor dashboard')
        else:
            print(f'   ⚠️  Unexpected redirect location')
    else:
        print(f'❌ No redirect (status: {response.status_code})')
        return False
    
    return True

if __name__ == '__main__':
    print('='*70)
    print('TESTING ALL 3 USERS')
    print('='*70)
    
    users = [
        ('teacher122', 'purelogics'),
        ('test_teacher', 'teacher123'),
        ('instructor', 'instructor123')
    ]
    
    results = {}
    for username, password in users:
        results[username] = test_user_login(username, password)
    
    print(f'\n{"="*70}')
    print('SUMMARY')
    print(f'{"="*70}')
    
    all_passed = True
    for username, password in users:
        status = '✅ PASS' if results[username] else '❌ FAIL'
        print(f'{username:15} {status}')
        if not results[username]:
            all_passed = False
    
    print(f'\n{"="*70}')
    if all_passed:
        print('✅ ALL 3 USERS WORKING!')
        print('='*70)
        print('\nYou can now login with any of these:')
        for username, password in users:
            print(f'  - {username} / {password}')
    else:
        print('❌ Some users still have issues')
    print('='*70)

