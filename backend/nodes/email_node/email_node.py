"""
Email Node - Send emails via email service providers.
This node sends emails using configured email services (Resend, etc.).
"""

from typing import Dict, Any, List, Optional
import sys
import os

# Add the parent directory to the path to import base_node and ui_components
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from base_node import BaseNode, NodeInput, NodeOutput, NodeParameter, NodeStyling
from ui_components import (
    NodeUIConfig, UIGroup, DialogConfig,
    create_text_input, create_textarea, create_select, create_label, create_divider,
    UIOption
)

# Import email services
try:
    sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'email_services'))
    from resend_service.resend_service import ResendService
except ImportError:
    ResendService = None


class EmailNode(BaseNode):
    """
    Email Node - Send emails via email service providers.

    This node allows you to send emails using various email services.
    Configure the email provider and add API credentials in Settings > Credentials.
    The email body comes from the input connection.
    """

    def _define_category(self) -> str:
        """Define category for EmailNode"""
        return "Integration"
    
    def _define_required_credentials(self, parameters: Optional[Dict[str, Any]] = None) -> List[str]:
        """
        Define required credentials for EmailNode.
        Returns the credentials needed for the default provider (Resend).
        """
        return ["RESEND_API_KEY"]

    def _define_inputs(self) -> List[NodeInput]:
        """Define the input structure for EmailNode"""
        return [
            NodeInput(
                name="query",
                type="string",
                description="Email body content (can come from previous nodes)",
                required=True
            )
        ]

    def _define_outputs(self) -> List[NodeOutput]:
        """Define the output structure for EmailNode"""
        return [
            NodeOutput(
                name="status",
                type="string",
                description="Email sending status message"
            ),
            NodeOutput(
                name="success",
                type="boolean",
                description="Whether the email was sent successfully"
            )
        ]

    def _define_parameters(self) -> List[NodeParameter]:
        """Define the parameters for EmailNode"""
        return [
            # Email Service Provider
            NodeParameter(
                name="provider",
                type="string",
                description="Email service provider",
                required=True,
                default_value="resend",
                options=["resend"]  # Can add more providers later: sendgrid, mailgun, etc.
            ),

            # Email Details
            NodeParameter(
                name="from_email",
                type="string",
                description="Sender email address (e.g., notifications@yourdomain.com or use onboarding@resend.dev for testing)",
                required=False,
                default_value="onboarding@resend.dev"
            ),
            NodeParameter(
                name="from_name",
                type="string",
                description="Sender display name",
                required=False,
                default_value="Convo Flow"
            ),
            NodeParameter(
                name="to_email",
                type="string",
                description="Recipient email address",
                required=True,
                default_value=""
            ),
            NodeParameter(
                name="subject",
                type="string",
                description="Email subject line",
                required=True,
                default_value="Notification from Convo Flow"
            ),
            NodeParameter(
                name="content_type",
                type="string",
                description="Email content format",
                required=True,
                default_value="html",
                options=["plain", "html"]
            )
        ]

    def _define_styling(self) -> NodeStyling:
        """Define custom styling for EmailNode"""
        return NodeStyling(
            html_template="""
            <div class="email-node-container">
                <div class="email-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
                <div class="email-content">
                    <div class="email-title">Send Email</div>
                    <div class="email-subtitle">EMAIL MESSAGE</div>
                </div>
            </div>
            """,
            custom_css="""
            .email-node-container {
                display: flex;
                align-items: center;
                padding: 16px 20px;
                background: #1f1f1f;
                border: 1.5px solid #ef4444;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                transition: all 0.2s ease;
                transform-origin: center center;
                width: 220px;
                height: 100px;
                position: relative;
            }
            .email-node-container:hover {
                border-color: #f87171;
                box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
            }
            .email-icon { margin-right: 12px; flex-shrink: 0; color: #ef4444; display: flex; align-items: center; }
            .email-icon svg { width: 20px; height: 20px; }
            .email-content { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 2px; }
            .email-title { font-size: 13px; font-weight: 600; color: #ffffff; margin-bottom: 2px; line-height: 1.2; }
            .email-subtitle { font-size: 11px; color: #ef4444; opacity: 0.9; line-height: 1.2; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
            """,
            icon="<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-mail\"><rect width=\"20\" height=\"16\" x=\"2\" y=\"4\" rx=\"2\"/><path d=\"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7\"/></svg>",
            subtitle="EMAIL MESSAGE",
            background_color="#1f1f1f",
            border_color="#ef4444",
            text_color="#ffffff",
            shape="rounded",
            width=220,
            height=100,
            css_classes="",
            inline_styles='{}',
            icon_position=""
        )

    def _define_ui_config(self) -> NodeUIConfig:
        """Define the UI configuration for EmailNode"""
        return NodeUIConfig(
            node_id=self.node_id,
            node_name="EmailNode",
            groups=[
                UIGroup(
                    name="provider_config",
                    label="Email Service Provider",
                    components=[
                        create_select(
                            name="provider",
                            label="Provider *",
                            required=True,
                            default_value="resend",
                            options=[
                                UIOption(value="resend", label="Resend")
                            ],
                            searchable=False
                        ),
                        create_divider(),
                        create_label(
                            text="⚠️ Add your RESEND_API_KEY in Settings > Credentials to use this node."
                        )
                    ],
                    styling={
                        "background": "#2a2a2a",
                        "border_radius": "12px",
                    }
                ),
                UIGroup(
                    name="email_details",
                    label="Email Configuration",
                    description="Configure the email sender, recipient, and content",
                    components=[
                        create_text_input(
                            name="from_email",
                            label="From Email",
                            required=False,
                            default_value="onboarding@resend.dev",
                            placeholder="notifications@yourdomain.com"
                        ),
                        create_text_input(
                            name="from_name",
                            label="From Name",
                            required=False,
                            default_value="Convo Flow",
                            placeholder="Your Bot Name"
                        ),
                        create_text_input(
                            name="to_email",
                            label="To Email *",
                            required=True,
                            default_value="",
                            placeholder="recipient@example.com"
                        ),
                        create_text_input(
                            name="subject",
                            label="Subject *",
                            required=True,
                            default_value="Notification from Convo Flow",
                            placeholder="Your email subject"
                        ),
                        create_select(
                            name="content_type",
                            label="Content Type",
                            required=True,
                            default_value="html",
                            options=[
                                UIOption(value="html", label="HTML"),
                                UIOption(value="plain", label="Plain Text")
                            ],
                            searchable=False
                        )
                    ],
                    styling={
                        "background": "#2a2a2a",
                        "border_radius": "12px",
                    }
                )
            ],
            layout="vertical",
            global_styling={
                "font_family": "Inter, sans-serif",
                "color_scheme": "light"
            },
            dialog_config=DialogConfig(
                title="Configure Email Node",
                description="Send emails via email service providers (Resend, SendGrid, etc.)",
                background_color="#1f1f1f",
                border_color="#ef4444",
                text_color="#ffffff",
                icon="""<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>""",
                icon_color="#ef4444",
                header_background="#1f1f1f",
                footer_background="#1f1f1f",
                button_primary_color="#ef4444",
                button_secondary_color="#374151"
            )
        )

    def execute(self, inputs: Dict[str, Any], parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the EmailNode logic

        Args:
            inputs: Dictionary containing 'query' (email body content)
            parameters: Dictionary containing provider and email details

        Returns:
            Dictionary containing status and success boolean
        """
        # Get email body from input connection
        email_body = inputs.get("query", "")

        if not email_body:
            return {
                "status": "Error: No email body provided",
                "success": False,
                "metadata": {
                    "error": "No email body provided"
                }
            }

        # Get parameters
        provider = parameters.get("provider", "resend")
        from_email = parameters.get("from_email", "onboarding@resend.dev")
        from_name = parameters.get("from_name", "Convo Flow")
        to_email = parameters.get("to_email", "")
        subject = parameters.get("subject", "Notification from Convo Flow")
        content_type = parameters.get("content_type", "html")

        # Validate required fields
        if not to_email:
            return {
                "status": "Error: Recipient email is required",
                "success": False,
                "metadata": {
                    "error": "Recipient email is required"
                }
            }

        # Initialize the appropriate service
        if provider == "resend":
            if ResendService is None:
                return {
                    "status": "Error: Resend service not available",
                    "success": False,
                    "metadata": {
                        "error": "Resend service not available"
                    }
                }

            service = ResendService()

            # Check if service is configured
            if not service.is_configured():
                return {
                    "status": "Error: RESEND_API_KEY not configured. Add it in Settings > Credentials.",
                    "success": False,
                    "metadata": {
                        "error": "RESEND_API_KEY not configured. Add it in Settings > Credentials."
                    }
                }

            # Send email using Resend
            result = service.send_email(
                to_email=to_email,
                subject=subject,
                html_body=email_body if content_type == "html" else None,
                text_body=email_body if content_type == "plain" else None,
                from_email=from_email,
                from_name=from_name
            )

            # Store result in node data for display
            self.node_data = {
                "to_email": to_email,
                "subject": subject,
                "provider": provider
            }

            return {
                "status": result.get("status") or result.get("error", "Unknown error"),
                "success": result.get("success", False)
            }
        else:
            return {
                "status": f"Error: Unsupported email provider '{provider}'",
                "success": False,
                "metadata": {
                    "error": f"Unsupported email provider '{provider}'"
                }
            }
