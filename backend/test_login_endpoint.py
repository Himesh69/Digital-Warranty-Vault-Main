#!/usr/bin/env python
"""Test the login endpoint."""
import requests
import json

BASE_URL = 'http://localhost:8000'

# Test login with the test user we created
login_data = {
    'email': 'test@example.com',
    'password': 'testpass123'
}

print(f"Testing login endpoint: {BASE_URL}/api/auth/login/")
print(f"Credentials: {login_data}")

try:
    response = requests.post(
        f'{BASE_URL}/api/auth/login/',
        json=login_data,
        headers={'Content-Type': 'application/json'}
    )
    
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response:\n{json.dumps(response.json(), indent=2)}")
    
except Exception as e:
    print(f"Error: {e}")
