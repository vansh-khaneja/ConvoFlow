"""
Resend Email Service - Send emails using Resend API
"""

import os
import requests
from typing import Dict, Any, Optional


class ResendService:
    """
    Resend Email Service - Send emails via Resend API

    API key is read from RESEND_API_KEY environment variable.
    """

    def __init__(self):
        """Initialize Resend service with API key from environment"""
        self.api_key = os.getenv("RESEND_API_KEY")
        self.api_url = "https://api.resend.com/emails"

        if not self.api_key:
            print("Warning: RESEND_API_KEY not found in environment variables")

    def send_email(
        self,
        to_email: str,
        subject: str,
        html_body: Optional[str] = None,
        text_body: Optional[str] = None,
        from_email: Optional[str] = None,
        from_name: Optional[str] = "Convo Flow",
        cc: Optional[str] = None,
        bcc: Optional[str] = None,
        reply_to: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send an email using Resend API

        Args:
            to_email: Recipient email address
            subject: Email subject line
            html_body: HTML email body (optional if text_body provided)
            text_body: Plain text email body (optional if html_body provided)
            from_email: Sender email (defaults to env variable or onboarding@resend.dev)
            from_name: Sender display name
            cc: CC recipients (comma-separated)
            bcc: BCC recipients (comma-separated)
            reply_to: Reply-to email address

        Returns:
            Dictionary with success status, message_id, and any errors
        """
        # Check if API key is available
        if not self.api_key:
            return {
                "success": False,
                "error": "RESEND_API_KEY not configured. Add it in Settings > Credentials.",
                "message_id": None
            }

        # Validate inputs
        if not to_email:
            return {
                "success": False,
                "error": "Recipient email (to_email) is required",
                "message_id": None
            }

        if not subject:
            return {
                "success": False,
                "error": "Email subject is required",
                "message_id": None
            }

        if not html_body and not text_body:
            return {
                "success": False,
                "error": "Either html_body or text_body is required",
                "message_id": None
            }

        # Default from email
        if not from_email:
            # Use environment variable or Resend's default testing domain
            from_email = os.getenv("RESEND_FROM_EMAIL", "onboarding@resend.dev")

        # Build email payload
        payload = {
            "from": f"{from_name} <{from_email}>",
            "to": [to_email] if isinstance(to_email, str) else to_email,
            "subject": subject
        }

        # Add body content
        if html_body:
            payload["html"] = html_body
        if text_body:
            payload["text"] = text_body

        # Add optional fields
        if cc:
            payload["cc"] = [email.strip() for email in cc.split(",")]
        if bcc:
            payload["bcc"] = [email.strip() for email in bcc.split(",")]
        if reply_to:
            payload["reply_to"] = reply_to

        try:
            # Send request to Resend API
            response = requests.post(
                self.api_url,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json=payload,
                timeout=30
            )

            # Check response
            if response.status_code == 200:
                result = response.json()
                return {
                    "success": True,
                    "message_id": result.get("id"),
                    "status": f"Email sent successfully to {to_email}"
                }
            else:
                error_data = response.json() if response.text else {}
                error_message = error_data.get("message", response.text or "Unknown error")

                return {
                    "success": False,
                    "error": f"Resend API error ({response.status_code}): {error_message}",
                    "message_id": None
                }

        except requests.exceptions.Timeout:
            return {
                "success": False,
                "error": "Request timeout - Resend API did not respond in time",
                "message_id": None
            }
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"Network error: {str(e)}",
                "message_id": None
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Unexpected error: {str(e)}",
                "message_id": None
            }

    def is_configured(self) -> bool:
        """Check if the service is properly configured with an API key"""
        return bool(self.api_key)
