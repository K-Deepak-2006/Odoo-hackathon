#!/usr/bin/env python3
"""
Additional debug script to test edge cases
"""

import requests
import json

# Supabase configuration
SUPABASE_URL = "https://nkedmsegzsznwkzhcues.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rZWRtc2VnenN6bndremhjdWVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMDExNDUsImV4cCI6MjA2Nzg3NzE0NX0.lABoqyLgWoqaTY4pfetwSazwpJEO-M8YxvGfcW66SsE"

EMAIL_FUNCTION_URL = f"{SUPABASE_URL}/functions/v1/send-email-notification"

headers = {
    'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY
}

# Test 1: Valid email, invalid type
print("=== Test 1: Valid email, invalid type ===")
payload1 = {
    "to": "test@example.com",
    "subject": "Test",
    "type": "invalid_type",
    "requestData": {
        "fromUserName": "Test User",
        "toUserName": "Test Recipient", 
        "message": "Test message"
    }
}

try:
    response = requests.post(EMAIL_FUNCTION_URL, headers=headers, json=payload1, timeout=30)
    print(f"Status Code: {response.status_code}")
    result = response.json()
    print(f"Success: {result.get('success')}")
    print(f"Error: {result.get('error')}")
    print(f"Email Preview: {result.get('emailPreview', '')[:100]}...")
except Exception as e:
    print(f"Exception: {e}")

print("\n=== Test 2: Missing required fields ===")
payload2 = {
    "to": "test@example.com"
    # Missing subject, type, requestData
}

try:
    response = requests.post(EMAIL_FUNCTION_URL, headers=headers, json=payload2, timeout=30)
    print(f"Status Code: {response.status_code}")
    result = response.json()
    print(f"Success: {result.get('success')}")
    print(f"Error: {result.get('error')}")
except Exception as e:
    print(f"Exception: {e}")

print("\n=== Test 3: Empty payload ===")
payload3 = {}

try:
    response = requests.post(EMAIL_FUNCTION_URL, headers=headers, json=payload3, timeout=30)
    print(f"Status Code: {response.status_code}")
    result = response.json()
    print(f"Success: {result.get('success')}")
    print(f"Error: {result.get('error')}")
except Exception as e:
    print(f"Exception: {e}")