#!/usr/bin/env python
"""Test authentication setup."""
import os
import sys
import django

# Setup Django
sys.path.insert(0, r'c:\Users\lenovo\Downloads\Digital-Warranty-Vault-main\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'warranty_vault.settings')
django.setup()

from django.contrib.auth import authenticate
from users.models import User

# Check if test user exists
test_email = 'test@example.com'
test_password = 'testpass123'

# Delete existing test user if it exists
User.objects.filter(email=test_email).delete()

# Create a test user
user = User.objects.create_user(
    email=test_email,
    name='Test User',
    password=test_password
)

print(f"✓ Created test user: {user.email}")
print(f"  User ID: {user.id}")
print(f"  Password hash: {user.password[:50]}...")

# Try to authenticate
authenticated_user = authenticate(username=test_email, password=test_password)
if authenticated_user:
    print(f"✓ Authentication SUCCESSFUL!")
    print(f"  Authenticated as: {authenticated_user.email}")
else:
    print(f"✗ Authentication FAILED!")
    
    # Debug: Check if user exists
    user_check = User.objects.filter(email=test_email).first()
    if user_check:
        print(f"  User exists in database")
        print(f"  Password check result: {user_check.check_password(test_password)}")
    else:
        print(f"  User does NOT exist in database")
