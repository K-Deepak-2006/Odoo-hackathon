#!/usr/bin/env python3
"""
Debug script to investigate the invalid payload handling
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

# Test with invalid email and type
payload = {
    "to": "invalid-email",  # Invalid email format
    "subject": "Test",
    "type": "invalid_type",  # Invalid type
    "requestData": {}
}

print("Testing invalid payload...")
print(f"Payload: {json.dumps(payload, indent=2)}")

try:
    response = requests.post(EMAIL_FUNCTION_URL, headers=headers, json=payload, timeout=30)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"Success: {result.get('success')}")
        print(f"Error: {result.get('error')}")
        print(f"Details: {result.get('details')}")
        
except Exception as e:
    print(f"Exception: {e}")