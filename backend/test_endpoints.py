#!/usr/bin/env python
"""
Comprehensive endpoint testing script for TopSkill LMS API
Tests all CRUD operations for major endpoints
"""
import requests
import json
import sys

BASE_URL = "http://localhost:8000/api"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_success(msg):
    print(f"{Colors.GREEN}✓ {msg}{Colors.END}")

def print_error(msg):
    print(f"{Colors.RED}✗ {msg}{Colors.END}")

def print_info(msg):
    print(f"{Colors.BLUE}ℹ {msg}{Colors.END}")

def print_warning(msg):
    print(f"{Colors.YELLOW}⚠ {msg}{Colors.END}")

def get_auth_token():
    """Get JWT token for admin user"""
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login/",
            json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            data = response.json()
            # Handle nested tokens structure
            if 'tokens' in data:
                return data['tokens'].get('access')
            return data.get('access')
        else:
            print_error(f"Failed to login: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print_error(f"Error getting auth token: {e}")
        return None

def test_endpoint(method, url, token=None, data=None, expected_status=200, description=""):
    """Test a single endpoint"""
    headers = {}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    
    try:
        if method.upper() == 'GET':
            response = requests.get(url, headers=headers)
        elif method.upper() == 'POST':
            response = requests.post(url, headers=headers, json=data)
        elif method.upper() == 'PUT':
            response = requests.put(url, headers=headers, json=data)
        elif method.upper() == 'PATCH':
            response = requests.patch(url, headers=headers, json=data)
        elif method.upper() == 'DELETE':
            response = requests.delete(url, headers=headers)
        else:
            print_error(f"Unknown method: {method}")
            return False
        
        if response.status_code == expected_status:
            print_success(f"{method} {url} - {description}")
            return True
        else:
            print_error(f"{method} {url} - Expected {expected_status}, got {response.status_code} - {response.text[:100]}")
            return False
    except Exception as e:
        print_error(f"{method} {url} - Exception: {e}")
        return False

def test_crud_endpoint(name, base_url, token, sample_data=None, update_data=None):
    """Test full CRUD operations for an endpoint"""
    print_info(f"\n=== Testing {name} ===")
    
    results = {
        'list': False,
        'create': False,
        'read': False,
        'update': False,
        'delete': False
    }
    
    # LIST (GET)
    results['list'] = test_endpoint('GET', f"{BASE_URL}{base_url}", token, expected_status=200, description="List")
    
    # CREATE (POST)
    created_id = None
    if sample_data:
        try:
            response = requests.post(
                f"{BASE_URL}{base_url}",
                headers={'Authorization': f'Bearer {token}'},
                json=sample_data
            )
            if response.status_code in [200, 201]:
                created_id = response.json().get('id')
                results['create'] = True
                print_success(f"POST {base_url} - Create")
            else:
                print_error(f"POST {base_url} - Create failed: {response.status_code} - {response.text[:100]}")
        except Exception as e:
            print_error(f"POST {base_url} - Create exception: {e}")
    else:
        print_warning(f"Skipping CREATE for {name} (no sample data)")
        results['create'] = None
    
    # READ (GET by ID)
    if created_id:
        results['read'] = test_endpoint('GET', f"{BASE_URL}{base_url}{created_id}/", token, expected_status=200, description="Read")
    else:
        # Try to get first item from list
        try:
            response = requests.get(f"{BASE_URL}{base_url}", headers={'Authorization': f'Bearer {token}'})
            if response.status_code == 200:
                data = response.json()
                items = data.get('results', data) if isinstance(data, dict) else data
                if isinstance(items, list) and len(items) > 0:
                    created_id = items[0].get('id')
                    results['read'] = test_endpoint('GET', f"{BASE_URL}{base_url}{created_id}/", token, expected_status=200, description="Read")
                else:
                    print_warning(f"No items found for {name} to test READ")
        except Exception as e:
            print_error(f"Error getting item for READ test: {e}")
    
    # UPDATE (PUT/PATCH)
    if created_id and update_data:
        results['update'] = test_endpoint('PATCH', f"{BASE_URL}{base_url}{created_id}/", token, update_data, expected_status=200, description="Update")
    else:
        print_warning(f"Skipping UPDATE for {name}")
        results['update'] = None
    
    # DELETE
    if created_id:
        results['delete'] = test_endpoint('DELETE', f"{BASE_URL}{base_url}{created_id}/", token, expected_status=204, description="Delete")
    else:
        print_warning(f"Skipping DELETE for {name} (no created item)")
        results['delete'] = None
    
    return results

def main():
    print_info("Starting comprehensive endpoint testing...")
    print_info(f"Base URL: {BASE_URL}")
    
    # Get auth token
    print_info("\nGetting authentication token...")
    token = get_auth_token()
    if not token:
        print_error("Failed to get auth token. Exiting.")
        sys.exit(1)
    print_success("Authentication successful")
    
    # Get a course ID for testing
    print_info("\nGetting test course...")
    try:
        response = requests.get(f"{BASE_URL}/courses/", headers={'Authorization': f'Bearer {token}'})
        if response.status_code == 200:
            courses = response.json().get('results', response.json())
            if isinstance(courses, list) and len(courses) > 0:
                test_course_id = courses[0].get('id')
                print_success(f"Using course ID: {test_course_id}")
            else:
                print_error("No courses found")
                sys.exit(1)
        else:
            print_error("Failed to get courses")
            sys.exit(1)
    except Exception as e:
        print_error(f"Error getting courses: {e}")
        sys.exit(1)
    
    all_results = {}
    
    # Test Announcements
    all_results['announcements'] = test_crud_endpoint(
        'Announcements',
        '/announcements/',
        token,
        sample_data={
            'course': test_course_id,
            'title': 'Test Announcement',
            'content': 'This is a test announcement',
            'is_pinned': False,
            'is_active': True
        },
        update_data={'title': 'Updated Test Announcement'}
    )
    
    # Test Q&A
    all_results['qandas'] = test_crud_endpoint(
        'Q&A',
        '/qandas/',
        token,
        sample_data={
            'course': test_course_id,
            'question': 'Test Question?',
            'answer': 'This is a test answer',
            'order': 1,
            'is_active': True
        },
        update_data={'question': 'Updated Test Question?'}
    )
    
    # Test Wishlist
    all_results['wishlist'] = test_crud_endpoint(
        'Wishlist',
        '/wishlist/',
        token,
        sample_data={'course': test_course_id},
        update_data=None  # Wishlist doesn't need update
    )
    
    # Test Reviews
    all_results['reviews'] = test_crud_endpoint(
        'Reviews',
        '/reviews/',
        token,
        sample_data={
            'course': test_course_id,
            'rating': 5,
            'comment': 'Great test course!'
        },
        update_data={'rating': 4, 'comment': 'Updated review'}
    )
    
    # Test Assignments (read-only for students, but test GET)
    print_info("\n=== Testing Assignments ===")
    all_results['assignments'] = {
        'list': test_endpoint('GET', f"{BASE_URL}/assignments/", token, expected_status=200, description="List")
    }
    
    # Test Quizzes
    print_info("\n=== Testing Quizzes ===")
    all_results['quizzes'] = {
        'list': test_endpoint('GET', f"{BASE_URL}/quizzes/", token, expected_status=200, description="List")
    }
    
    # Test Assignment Submissions
    print_info("\n=== Testing Assignment Submissions ===")
    all_results['assignment_submissions'] = {
        'list': test_endpoint('GET', f"{BASE_URL}/assignment-submissions/", token, expected_status=200, description="List")
    }
    
    # Test Quiz Attempts
    print_info("\n=== Testing Quiz Attempts ===")
    all_results['quiz_attempts'] = {
        'list': test_endpoint('GET', f"{BASE_URL}/quiz-attempts/", token, expected_status=200, description="List")
    }
    
    # Test Batch Sessions
    print_info("\n=== Testing Batch Sessions ===")
    all_results['batch_sessions'] = {
        'list': test_endpoint('GET', f"{BASE_URL}/batch-sessions/", token, expected_status=200, description="List")
    }
    
    # Test Session Registrations
    print_info("\n=== Testing Session Registrations ===")
    all_results['session_registrations'] = {
        'list': test_endpoint('GET', f"{BASE_URL}/session-registrations/", token, expected_status=200, description="List")
    }
    
    # Test Notes
    print_info("\n=== Testing Notes ===")
    all_results['notes'] = {
        'list': test_endpoint('GET', f"{BASE_URL}/notes/", token, expected_status=200, description="List")
    }
    
    # Test Resources
    print_info("\n=== Testing Resources ===")
    all_results['resources'] = {
        'list': test_endpoint('GET', f"{BASE_URL}/resources/", token, expected_status=200, description="List")
    }
    
    # Test Lecture Progress
    print_info("\n=== Testing Lecture Progress ===")
    all_results['lecture_progress'] = {
        'list': test_endpoint('GET', f"{BASE_URL}/lecture-progress/", token, expected_status=200, description="List")
    }
    
    # Summary
    print_info("\n" + "="*60)
    print_info("TEST SUMMARY")
    print_info("="*60)
    
    for endpoint, results in all_results.items():
        print(f"\n{endpoint.upper()}:")
        for operation, result in results.items():
            if result is True:
                print_success(f"  {operation.upper()}: ✓")
            elif result is False:
                print_error(f"  {operation.upper()}: ✗")
            elif result is None:
                print_warning(f"  {operation.upper()}: - (skipped)")
    
    print_info("\n" + "="*60)
    print_info("Testing complete!")

if __name__ == "__main__":
    main()

