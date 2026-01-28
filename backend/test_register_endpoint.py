#!/usr/bin/env python
"""Test the registration endpoint."""
import requests
import json
import random

BASE_URL = 'http://localhost:8000'

# Test registration with a new user
test_email = f'newuser{random.randint(1000, 9999)}@example.com'
register_data = {
    'email': test_email,
    'name': 'New Test User',
    'password': 'testpass123',
    'password2': 'testpass123'
}

print(f"Testing registration endpoint: {BASE_URL}/api/auth/register/")
print(f"Registration data: {register_data}")

try:
    response = requests.post(
        f'{BASE_URL}/api/auth/register/',
        json=register_data,
        headers={'Content-Type': 'application/json'}
    )
    
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response:\n{json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 201:
        # Now try to login with the registered user
        print(f"\n\n--- Testing Login ---")
        login_data = {
            'email': test_email,
            'password': 'testpass123'
        }
        
        login_response = requests.post(
            f'{BASE_URL}/api/auth/login/',
            json=login_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"Login Status Code: {login_response.status_code}")
        print(f"Login Response:\n{json.dumps(login_response.json(), indent=2)}")
    
except Exception as e:
    print(f"Error: {e}")
