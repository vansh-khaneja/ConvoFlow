"""
Response Node - Final output node for chatbot responses.
This node formats and returns the final response to the user.
"""

from typing import Dict, Any, List, Optional
import sys
import os

# Add the parent directory to the path to import base_node and ui_components
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from base_node import BaseNode, NodeInput, NodeOutput, NodeParameter, NodeStyling, is_error_output, extract_error_message
from ui_components import (
    NodeUIConfig, UIGroup, DialogConfig,
    create_label, create_divider,
    UIOption
)


class ResponseNode(BaseNode):
    """
    Response Node - Handles final response formatting and output.
    
    This node serves as the final output point for chatbot responses.
    """
    
    def _define_required_credentials(self, parameters: Optional[Dict[str, Any]] = None) -> List[str]:
        """No credentials required for ResponseNode"""
        return []
    
    def _define_category(self) -> str:
        """Define category for ResponseNode"""
        return "I/O"
    
    def _define_inputs(self) -> List[NodeInput]:
        """Define the input structure for ResponseNode"""
        return [
            NodeInput(
                name="input_data",
                type="string",
                description="Combined input data from multiple connections (user query, knowledge base response, etc.)",
                required=True
            )
        ]
    
    def _define_outputs(self) -> List[NodeOutput]:
        """Define the output structure for ResponseNode"""
        return [
            NodeOutput(
                name="final_response",
                type="string",
                description="The final processed response that will be displayed"
            )
        ]
    
    def _define_parameters(self) -> List[NodeParameter]:
        """Define the parameters for ResponseNode"""
        return []
    
    def _define_styling(self) -> NodeStyling:
        """Define custom styling for ResponseNode"""
        return NodeStyling(
            html_template="""
            <div class="response-node-container">
                <div class="response-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                </div>
                <div class="response-content">
                    <div class="response-title">Response</div>
                    <div class="response-subtitle">END POINT</div>
                </div>
            </div>
            """,
            custom_css="""
            .response-node-container {
                display: flex;
                align-items: center;
                padding: 16px 20px;
                background: #1f1f1f;
                border: 1.5px solid #06b6d4;
                border-radius: 9999px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                transition: all 0.2s ease;
                transform-origin: center center;
                width: 220px;
                height: 90px;
                position: relative;
            }
            .response-node-container:hover {
                border-color: #22d3ee;
                box-shadow: 0 4px 12px rgba(6, 182, 212, 0.2);
            }
            .response-icon { margin-right: 12px; flex-shrink: 0; color: #06b6d4; display: flex; align-items: center; }
            .response-icon svg { width: 20px; height: 20px; }
            .response-content { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 2px; }
            .response-title { font-size: 13px; font-weight: 600; color: #ffffff; margin-bottom: 2px; line-height: 1.2; }
            .response-subtitle { font-size: 11px; color: #06b6d4; opacity: 0.9; line-height: 1.2; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
            """,
            icon="<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-send\"><path d=\"m22 2-7 20-4-9-9-4Z\"/><path d=\"M22 2 11 13\"/></svg>", subtitle="END POINT", background_color="#1f1f1f", border_color="#06b6d4", text_color="#ffffff",
            shape="pill", width=220, height=90, css_classes="", inline_styles='{}', icon_position="",
            hide_outputs=True  # Response node is terminal - hide output handles
        )
    
    def _define_ui_config(self) -> NodeUIConfig:
        """Define the UI configuration for ResponseNode"""
        return NodeUIConfig(
            node_id=self.node_id,
            node_name="ResponseNode",
            groups=[
                UIGroup(
                    name="response_display",
                    label="Response Display",
                    components=[
                        create_label(
                            text="This node displays the final response from your workflow."
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
                title="Configure ResponseNode",
                description="Response Node - Displays the final response from your workflow.",
                background_color="#1f1f1f",
                border_color="#06b6d4",
                text_color="#ffffff",
                icon="""<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle-more-icon lucide-message-circle-more"><path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/></svg>""",
                icon_color="#06b6d4",
                header_background="#1f1f1f",
                footer_background="#1f1f1f",
                button_primary_color="#06b6d4",
                button_secondary_color="#374151"
            )
        )
    
    def execute(self, inputs: Dict[str, Any], parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the ResponseNode logic
        
        Args:
            inputs: Dictionary containing 'input_data' (automatically combined from multiple connections)
            parameters: Empty dictionary (no parameters)
            
        Returns:
            Dictionary containing final_response and response_content for display
        """
        raw_input = inputs.get("input_data", "")
        # Be tolerant to non-string inputs (e.g., booleans from routing nodes)
        input_data = (raw_input if isinstance(raw_input, str) else str(raw_input)).strip()
        
        # Check if input is an error - treat input_data as a potential error output
        # Since input_data is a string, we need to check if it contains error patterns
        error_detected = False
        error_message = None
        
        # Check for error patterns in the input string
        if input_data:
            error_prefixes = ["Error:", "ERROR:", "error:"]
            for prefix in error_prefixes:
                if input_data.strip().startswith(prefix):
                    error_detected = True
                    error_message = input_data
                    break
            
            # Also check for common error phrases
            if not error_detected:
                error_phrases = ["failed to", "not configured", "not set", "not found", "not available", "invalid"]
                if any(phrase in input_data.lower() for phrase in error_phrases):
                    # More careful check - only flag if it's clearly an error message
                    if any(indicator in input_data.lower() for indicator in ["error:", "failed", "not configured", "not set", "not found"]):
                        error_detected = True
                        error_message = input_data
        
        # If error detected, return proper error format
        if error_detected:
            self.node_data = {
                "response_content": "An error occurred in the workflow. Please check the error details."
            }
            return {
                "final_response": "An error occurred in the workflow. Please check the error details.",
                "success": False,
                "metadata": {
                    "error": error_message or "An error occurred in the workflow"
                }
            }
        
        # Process the combined input data normally
        if input_data:
            # Check if it's already formatted as "Combined inputs:"
            if input_data.startswith("Combined inputs:"):
                # Extract the actual content
                content = input_data.replace("Combined inputs:", "").strip()
                final_response = content
            else:
                # Single input or already processed
                final_response = input_data
        else:
            # No input received
            final_response = "No response yet"
        
        # Store the response content in the node's data for display in the HTML template
        self.node_data = {
            "response_content": final_response
        }
        
        # Return only final_response (response_content is redundant)
        return {
            "final_response": final_response
        }

