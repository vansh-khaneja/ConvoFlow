"""
CustomAPI Node - Makes HTTP requests to external APIs.
This node allows making custom API calls with configurable methods, headers, and body.
"""

from typing import Dict, Any, List, Optional
import sys
import os
import requests
import json
import re

# Add the parent directory to the path to import base_node and ui_components
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from base_node import BaseNode, NodeInput, NodeOutput, NodeParameter, NodeStyling
from ui_components import (
    NodeUIConfig, UIGroup, DialogConfig,
    create_text_input, create_textarea, create_select, create_label, UIOption
)


class CustomAPINode(BaseNode):
    """
    CustomAPI Node - Makes HTTP requests to external APIs.

    This node allows you to integrate any external API into your workflow.
    Supports GET, POST, PUT, DELETE methods with custom headers and body.
    Use {{query}} in URL or body to insert the input value.
    """
    
    def _define_required_credentials(self, parameters: Optional[Dict[str, Any]] = None) -> List[str]:
        """No credentials required for CustomAPINode (credentials may be in headers/body)"""
        return []

    def _define_category(self) -> str:
        """Define category for CustomAPINode"""
        return "Integration"

    def _define_inputs(self) -> List[NodeInput]:
        """Define the input structure for CustomAPINode"""
        return [
            NodeInput(
                name="input1",
                type="string",
                description="First input value (use {{input1}} in URL/body)",
                required=False
            ),
            NodeInput(
                name="input2",
                type="string",
                description="Second input value (use {{input2}} in URL/body)",
                required=False
            ),
            NodeInput(
                name="input3",
                type="string",
                description="Third input value (use {{input3}} in URL/body)",
                required=False
            )
        ]

    def _define_outputs(self) -> List[NodeOutput]:
        """Define the output structure for CustomAPINode"""
        return [
            NodeOutput(
                name="query",
                type="string",
                description="API response (JSON will be stringified)"
            )
        ]

    def _define_parameters(self) -> List[NodeParameter]:
        """Define the parameters for CustomAPINode"""
        return [
            NodeParameter(
                name="url",
                type="string",
                description="API endpoint URL (use {{input1}}, {{input2}}, {{input3}} to insert inputs)",
                required=True,
                default_value="https://api.example.com/data"
            ),
            NodeParameter(
                name="method",
                type="string",
                description="HTTP method",
                required=True,
                default_value="GET",
                options=["GET", "POST", "PUT", "DELETE"]
            ),
            NodeParameter(
                name="headers",
                type="string",
                description="Request headers in JSON format (e.g., {\"Authorization\": \"Bearer token\"})",
                required=False,
                default_value="{}"
            ),
            NodeParameter(
                name="body",
                type="string",
                description="Request body in JSON format (use {{input1}}, {{input2}}, {{input3}} to insert inputs)",
                required=False,
                default_value="{}"
            ),
            NodeParameter(
                name="timeout",
                type="number",
                description="Request timeout in seconds",
                required=False,
                default_value=30
            )
        ]

    def _define_styling(self) -> NodeStyling:
        """Define custom styling for CustomAPINode"""
        return NodeStyling(
            html_template="""
            <div class="api-node-container">
                <div class="api-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                </div>
                <div class="api-content">
                    <div class="api-title">API Call</div>
                    <div class="api-subtitle">EXTERNAL API</div>
                </div>
            </div>
            """,
            custom_css="""
            .api-node-container {
                display: flex;
                align-items: center;
                padding: 16px 20px;
                background: #1f1f1f;
                border: 1.5px solid #f97316;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                transition: all 0.2s ease;
                transform-origin: center center;
                width: 220px;
                height: 100px;
                position: relative;
            }
            .api-node-container:hover {
                border-color: #fb923c;
                box-shadow: 0 4px 12px rgba(249, 115, 22, 0.2);
            }
            .api-icon { margin-right: 12px; flex-shrink: 0; color: #f97316; display: flex; align-items: center; }
            .api-icon svg { width: 20px; height: 20px; }
            .api-content { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 2px; }
            .api-title { font-size: 13px; font-weight: 600; color: #ffffff; margin-bottom: 2px; line-height: 1.2; }
            .api-subtitle { font-size: 11px; color: #f97316; opacity: 0.9; line-height: 1.2; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
            """,
            icon="<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-globe\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z\"/></svg>",
            subtitle="EXTERNAL API",
            background_color="#1f1f1f",
            border_color="#f97316",
            text_color="#ffffff",
            shape="rounded",
            width=220,
            height=100,
            css_classes="",
            inline_styles='{}',
            icon_position=""
        )

    def _define_ui_config(self) -> NodeUIConfig:
        """Define the UI configuration for CustomAPINode"""
        return NodeUIConfig(
            node_id=self.node_id,
            node_name="CustomAPINode",
            groups=[
                UIGroup(
                    name="api_config",
                    label="API Configuration",
                    components=[
                        create_text_input(
                            name="url",
                            label="API URL *",
                            required=True,
                            default_value="https://api.example.com/data",
                            placeholder="https://api.example.com/endpoint",
                            styling={
                                "width": "100%"
                            }
                        ),
                        create_select(
                            name="method",
                            label="HTTP Method *",
                            required=True,
                            default_value="GET",
                            options=[
                                UIOption(value="GET", label="GET"),
                                UIOption(value="POST", label="POST"),
                                UIOption(value="PUT", label="PUT"),
                                UIOption(value="DELETE", label="DELETE")
                            ],
                            styling={
                                "width": "100%"
                            }
                        ),
                        create_label(
                            text="Use {{input1}}, {{input2}}, {{input3}} in URL or body to insert input values"
                        )
                    ],
                    styling={
                        "padding": "16px",
                        "background": "#2a2a2a",
                        "border_radius": "8px",
                        "border": "1px solid #404040"
                    }
                ),
                UIGroup(
                    name="headers_config",
                    label="Headers (Optional)",
                    components=[
                        create_textarea(
                            name="headers",
                            label="Headers (JSON)",
                            required=False,
                            default_value="{}",
                            placeholder='{"Authorization": "Bearer YOUR_TOKEN", "Content-Type": "application/json"}',
                            rows=4,
                            styling={
                                "width": "100%",
                                "font_family": "monospace"
                            }
                        )
                    ],
                    styling={
                        "padding": "16px",
                        "background": "#2a2a2a",
                        "border_radius": "8px",
                        "border": "1px solid #404040"
                    }
                ),
                UIGroup(
                    name="body_config",
                    label="Request Body (Optional)",
                    components=[
                        create_textarea(
                            name="body",
                            label="Body (JSON)",
                            required=False,
                            default_value="{}",
                            placeholder='{"name": "{{input1}}", "age": "{{input2}}", "email": "{{input3}}"}',
                            rows=6,
                            styling={
                                "width": "100%",
                                "font_family": "monospace"
                            }
                        )
                    ],
                    styling={
                        "padding": "16px",
                        "background": "#2a2a2a",
                        "border_radius": "8px",
                        "border": "1px solid #404040"
                    }
                )
            ],
            layout="vertical",
            global_styling={
                "font_family": "Inter, sans-serif",
                "color_scheme": "light"
            },
            dialog_config=DialogConfig(
                title="Configure Custom API",
                description="Make HTTP requests to external APIs. Use {{input1}}, {{input2}}, {{input3}} as placeholders to insert input values in URL or body.",
                background_color="#1f1f1f",
                border_color="#f97316",
                text_color="#ffffff",
                icon="""<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor"><path d="M136,128a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h40A8,8,0,0,1,136,128ZM224,48V156.69A15.86,15.86,0,0,1,219.31,168L168,219.31A15.86,15.86,0,0,1,156.69,224H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32H208A16,16,0,0,1,224,48ZM48,208h108.7L208,156.69V48H48Zm136-64H152a8,8,0,0,0,0,16h32a8,8,0,0,0,0-16Zm0-32H152a8,8,0,0,0,0,16h32a8,8,0,0,0,0-16ZM88,96h40a8,8,0,0,0,0-16H88a8,8,0,0,0,0,16Z"></path></svg>""",
                icon_color="#f97316",
                header_background="#1f1f1f",
                footer_background="#1f1f1f",
                button_primary_color="#f97316",
                button_secondary_color="#374151"
            )
        )

    def _replace_template_vars(self, text: str, input_values: Dict[str, str]) -> str:
        """Replace {{input1}}, {{input2}}, {{input3}} placeholders with actual values"""
        if not text:
            return text

        result = text
        for key, value in input_values.items():
            placeholder = f"{{{{{key}}}}}"  # Creates {{key}}
            result = result.replace(placeholder, str(value) if value else "")

        return result

    def execute(self, inputs: Dict[str, Any], parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the CustomAPINode logic

        Args:
            inputs: Dictionary containing 'input1', 'input2', 'input3'
            parameters: Dictionary containing 'url', 'method', 'headers', 'body', 'timeout'

        Returns:
            Dictionary containing 'query' with API response
        """
        # Collect all input values
        input_values = {
            "input1": inputs.get("input1", ""),
            "input2": inputs.get("input2", ""),
            "input3": inputs.get("input3", "")
        }

        url = parameters.get("url", "")
        method = parameters.get("method", "GET").upper()
        headers_str = parameters.get("headers", "{}")
        body_str = parameters.get("body", "{}")
        timeout = parameters.get("timeout", 30)

        # Replace template variables
        url = self._replace_template_vars(url, input_values)
        body_str = self._replace_template_vars(body_str, input_values)

        # Parse headers
        try:
            headers = json.loads(headers_str) if headers_str.strip() else {}
        except json.JSONDecodeError as e:
            return {
                "query": f"ERROR: Invalid headers JSON - {str(e)}",
                "success": False,
                "metadata": {
                    "error": f"Invalid headers JSON - {str(e)}"
                }
            }

        # Parse body
        body = None
        if method in ["POST", "PUT", "DELETE"]:
            try:
                body = json.loads(body_str) if body_str.strip() and body_str != "{}" else None
            except json.JSONDecodeError as e:
                return {
                    "query": f"ERROR: Invalid body JSON - {str(e)}",
                    "success": False,
                    "metadata": {
                        "error": f"Invalid body JSON - {str(e)}"
                    }
                }

        # Make the API request
        try:
            if method == "GET":
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == "POST":
                response = requests.post(url, headers=headers, json=body, timeout=timeout)
            elif method == "PUT":
                response = requests.put(url, headers=headers, json=body, timeout=timeout)
            elif method == "DELETE":
                response = requests.delete(url, headers=headers, json=body, timeout=timeout)
            else:
                return {
                    "query": f"ERROR: Unsupported HTTP method - {method}",
                    "success": False,
                    "metadata": {
                        "error": f"Unsupported HTTP method - {method}"
                    }
                }

            # Check if request was successful
            response.raise_for_status()

            # Try to parse as JSON, otherwise return text
            try:
                response_data = response.json()
                return {
                    "query": json.dumps(response_data, indent=2)
                }
            except json.JSONDecodeError:
                return {
                    "query": response.text
                }

        except requests.exceptions.Timeout:
            return {
                "query": f"ERROR: Request timeout after {timeout} seconds",
                "success": False,
                "metadata": {
                    "error": f"Request timeout after {timeout} seconds"
                }
            }
        except requests.exceptions.ConnectionError:
            return {
                "query": "ERROR: Connection failed - could not reach the API",
                "success": False,
                "metadata": {
                    "error": "Connection failed - could not reach the API"
                }
            }
        except requests.exceptions.HTTPError as e:
            return {
                "query": f"ERROR: HTTP {response.status_code} - {str(e)}",
                "success": False,
                "metadata": {
                    "error": f"HTTP {response.status_code} - {str(e)}"
                }
            }
        except Exception as e:
            return {
                "query": f"ERROR: {str(e)}",
                "success": False,
                "metadata": {
                    "error": str(e)
                }
            }
