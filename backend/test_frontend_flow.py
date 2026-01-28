#!/usr/bin/env python
"""Test the actual frontend login flow."""
import requests
import json

BASE_URL = 'http://localhost:8000'

# Test with the endpoints the frontend expects
print("=== Testing Frontend Login Flow ===\n")

# 1. Test login endpoint
print("1. Testing /api/auth/login/ endpoint")
login_data = {
    'email': 'test@example.com',
    'password': 'testpass123'
}

response = requests.post(
    f'{BASE_URL}/api/auth/login/',
    json=login_data,
    headers={'Content-Type': 'application/json'}
)

print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}\n")

# 2. Test if profile endpoint works
if response.status_code == 200:
    access_token = response.json()['access']
    print("2. Testing /api/auth/profile/ endpoint with token")
    
    profile_response = requests.get(
        f'{BASE_URL}/api/auth/profile/',
        headers={
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
    )
    
    print(f"Status: {profile_response.status_code}")
    print(f"Response: {json.dumps(profile_response.json(), indent=2)}\n")

# 3. Test token refresh endpoint (frontend expects this)
print("3. Testing /api/auth/token/refresh/ endpoint (used by frontend)")
if response.status_code == 200:
    refresh_token = response.json()['refresh']
    refresh_response = requests.post(
        f'{BASE_URL}/api/auth/token/refresh/',
        json={'refresh': refresh_token},
        headers={'Content-Type': 'application/json'}
    )
    
    print(f"Status: {refresh_response.status_code}")
    print(f"Response: {json.dumps(refresh_response.json(), indent=2)}")
