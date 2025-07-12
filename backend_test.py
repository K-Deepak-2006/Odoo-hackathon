#!/usr/bin/env python3
"""
Backend Testing Suite for SkillSwap Email Notification System
Tests the Supabase Edge Function for email notifications via Resend API
"""

import requests
import json
import time
from typing import Dict, Any

# Supabase configuration
SUPABASE_URL = "https://nkedmsegzsznwkzhcues.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rZWRtc2VnenN6bndremhjdWVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMDExNDUsImV4cCI6MjA2Nzg3NzE0NX0.lABoqyLgWoqaTY4pfetwSazwpJEO-M8YxvGfcW66SsE"

# Email function endpoint
EMAIL_FUNCTION_URL = f"{SUPABASE_URL}/functions/v1/send-email-notification"

class EmailNotificationTester:
    def __init__(self):
        self.headers = {
            'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY
        }
        self.test_results = []

    def log_test(self, test_name: str, success: bool, details: str):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        self.test_results.append({
            'test': test_name,
            'success': success,
            'details': details
        })

    def test_email_function_request_sent(self):
        """Test sending a 'request_sent' email notification"""
        test_name = "Email Function - Request Sent"
        
        payload = {
            "to": "test.recipient@example.com",
            "subject": "New Skill Swap Request from Sarah Johnson",
            "type": "request_sent",
            "requestData": {
                "fromUserName": "Sarah Johnson",
                "toUserName": "Alex Chen",
                "message": "Hi Alex! I'd love to learn React from you. I can teach you Python data analysis in return. I have 3 years of experience with pandas and matplotlib."
            }
        }

        try:
            response = requests.post(EMAIL_FUNCTION_URL, headers=self.headers, json=payload, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    self.log_test(test_name, True, f"Email sent successfully. ID: {result.get('emailId', 'N/A')}")
                    return True
                else:
                    self.log_test(test_name, False, f"Function returned success=false: {result.get('error', 'Unknown error')}")
                    return False
            else:
                self.log_test(test_name, False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except requests.exceptions.Timeout:
            self.log_test(test_name, False, "Request timeout (30s)")
            return False
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")
            return False

    def test_email_function_request_accepted(self):
        """Test sending a 'request_accepted' email notification"""
        test_name = "Email Function - Request Accepted"
        
        payload = {
            "to": "test.sender@example.com",
            "subject": "Your skill swap request was accepted!",
            "type": "request_accepted",
            "requestData": {
                "fromUserName": "Sarah Johnson",
                "toUserName": "Alex Chen",
                "message": "Hi Alex! I'd love to learn React from you. I can teach you Python data analysis in return."
            }
        }

        try:
            response = requests.post(EMAIL_FUNCTION_URL, headers=self.headers, json=payload, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    self.log_test(test_name, True, f"Email sent successfully. ID: {result.get('emailId', 'N/A')}")
                    return True
                else:
                    self.log_test(test_name, False, f"Function returned success=false: {result.get('error', 'Unknown error')}")
                    return False
            else:
                self.log_test(test_name, False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except requests.exceptions.Timeout:
            self.log_test(test_name, False, "Request timeout (30s)")
            return False
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")
            return False

    def test_email_function_request_rejected(self):
        """Test sending a 'request_rejected' email notification"""
        test_name = "Email Function - Request Rejected"
        
        payload = {
            "to": "test.sender@example.com",
            "subject": "Update on your skill swap request",
            "type": "request_rejected",
            "requestData": {
                "fromUserName": "Sarah Johnson",
                "toUserName": "Alex Chen",
                "message": "Hi Alex! I'd love to learn React from you. I can teach you Python data analysis in return."
            }
        }

        try:
            response = requests.post(EMAIL_FUNCTION_URL, headers=self.headers, json=payload, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    self.log_test(test_name, True, f"Email sent successfully. ID: {result.get('emailId', 'N/A')}")
                    return True
                else:
                    self.log_test(test_name, False, f"Function returned success=false: {result.get('error', 'Unknown error')}")
                    return False
            else:
                self.log_test(test_name, False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except requests.exceptions.Timeout:
            self.log_test(test_name, False, "Request timeout (30s)")
            return False
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")
            return False

    def test_email_function_invalid_payload(self):
        """Test error handling with invalid payload"""
        test_name = "Email Function - Invalid Payload"
        
        payload = {
            "to": "invalid-email",  # Invalid email format
            "subject": "Test",
            "type": "invalid_type",  # Invalid type
            "requestData": {}
        }

        try:
            response = requests.post(EMAIL_FUNCTION_URL, headers=self.headers, json=payload, timeout=30)
            
            # We expect this to fail, so a 4xx or 5xx status or success=false is correct
            if response.status_code >= 400:
                self.log_test(test_name, True, f"Correctly rejected invalid payload with HTTP {response.status_code}")
                return True
            elif response.status_code == 200:
                result = response.json()
                if not result.get('success'):
                    self.log_test(test_name, True, f"Correctly rejected invalid payload: {result.get('error', 'Unknown error')}")
                    return True
                else:
                    self.log_test(test_name, False, "Function accepted invalid payload when it should have rejected it")
                    return False
            else:
                self.log_test(test_name, False, f"Unexpected response: HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")
            return False

    def test_email_function_missing_auth(self):
        """Test authentication requirement"""
        test_name = "Email Function - Missing Auth"
        
        payload = {
            "to": "test@example.com",
            "subject": "Test",
            "type": "request_sent",
            "requestData": {
                "fromUserName": "Test User",
                "toUserName": "Test Recipient",
                "message": "Test message"
            }
        }

        # Headers without authentication
        headers_no_auth = {
            'Content-Type': 'application/json'
        }

        try:
            response = requests.post(EMAIL_FUNCTION_URL, headers=headers_no_auth, json=payload, timeout=30)
            
            # We expect this to fail with 401 or similar
            if response.status_code in [401, 403]:
                self.log_test(test_name, True, f"Correctly rejected request without auth: HTTP {response.status_code}")
                return True
            else:
                self.log_test(test_name, False, f"Function should require authentication but returned: HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")
            return False

    def test_email_template_generation(self):
        """Test that email templates are properly generated"""
        test_name = "Email Template Generation"
        
        payload = {
            "to": "template.test@example.com",
            "subject": "Template Test",
            "type": "request_sent",
            "requestData": {
                "fromUserName": "Template Tester",
                "toUserName": "Template Recipient",
                "message": "This is a test message to verify template generation works correctly."
            }
        }

        try:
            response = requests.post(EMAIL_FUNCTION_URL, headers=self.headers, json=payload, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success') and result.get('emailPreview'):
                    preview = result.get('emailPreview', '')
                    # Check if template contains expected elements
                    if 'SkillSwap' in preview and 'Template Tester' in preview:
                        self.log_test(test_name, True, f"Template generated correctly with user data")
                        return True
                    else:
                        self.log_test(test_name, False, f"Template missing expected content: {preview[:100]}...")
                        return False
                else:
                    self.log_test(test_name, False, f"No email preview returned: {result}")
                    return False
            else:
                self.log_test(test_name, False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all email notification tests"""
        print("🧪 Starting Email Notification System Tests")
        print("=" * 60)
        
        tests = [
            self.test_email_function_request_sent,
            self.test_email_function_request_accepted,
            self.test_email_function_request_rejected,
            self.test_email_function_invalid_payload,
            self.test_email_function_missing_auth,
            self.test_email_template_generation
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            try:
                if test():
                    passed += 1
                time.sleep(1)  # Small delay between tests
            except Exception as e:
                print(f"❌ Test {test.__name__} failed with exception: {e}")
        
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All email notification tests passed!")
            return True
        else:
            print(f"⚠️  {total - passed} tests failed")
            return False

def main():
    """Main test execution"""
    tester = EmailNotificationTester()
    success = tester.run_all_tests()
    
    print("\n📋 Detailed Test Summary:")
    for result in tester.test_results:
        status = "✅" if result['success'] else "❌"
        print(f"{status} {result['test']}: {result['details']}")
    
    return success

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)