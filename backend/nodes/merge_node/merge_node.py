"""
Merge Node - Combines data from multiple inputs.
This node merges outputs from two different nodes with an optional separator.
"""

from typing import Dict, Any, List, Optional
import sys
import os

# Add the parent directory to the path to import base_node and ui_components
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from base_node import BaseNode, NodeInput, NodeOutput, NodeParameter, NodeStyling, is_error_output, extract_error_message
from ui_components import (
    NodeUIConfig, UIGroup, DialogConfig,
    create_text_input, create_label
)


class MergeNode(BaseNode):
    """
    Merge Node - Combines data from multiple inputs.

    This node takes two inputs and combines them into one output.
    """
    
    def _define_required_credentials(self, parameters: Optional[Dict[str, Any]] = None) -> List[str]:
        """No credentials required for MergeNode"""
        return []
    
    def _define_category(self) -> str:
        """Define category for MergeNode"""
        return "Data Processing"

    def _define_inputs(self) -> List[NodeInput]:
        """Define the input structure for MergeNode"""
        return [
            NodeInput(
                name="input1",
                type="string",
                description="First input to merge",
                required=False
            ),
            NodeInput(
                name="input2",
                type="string",
                description="Second input to merge",
                required=False
            )
        ]

    def _define_outputs(self) -> List[NodeOutput]:
        """Define the output structure for MergeNode"""
        return [
            NodeOutput(
                name="query",
                type="string",
                description="Combined result from both inputs"
            )
        ]

    def _define_parameters(self) -> List[NodeParameter]:
        """Define the parameters for MergeNode"""
        return [
            NodeParameter(
                name="separator",
                type="string",
                description="Separator to place between inputs (leave empty for no separator)",
                required=False,
                default_value=""
            )
        ]

    def _define_styling(self) -> NodeStyling:
        """Define custom styling for MergeNode"""
        return NodeStyling(
            html_template="""
            <div class="merge-node-container">
                <div class="merge-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-git-merge"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/></svg>
                </div>
                <div class="merge-content">
                    <div class="merge-title">Merge</div>
                    <div class="merge-subtitle">COMBINE DATA</div>
                </div>
            </div>
            """,
            custom_css="""
            .merge-node-container {
                display: flex;
                align-items: center;
                padding: 14px 18px;
                background: #1f1f1f;
                border: 1.5px solid #14b8a6;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                transition: all 0.2s ease;
                transform-origin: center center;
                width: 180px;
                height: 80px;
                position: relative;
            }
            .merge-node-container:hover {
                border-color: #2dd4bf;
                box-shadow: 0 4px 12px rgba(20, 184, 166, 0.2);
            }
            .merge-icon { margin-right: 12px; flex-shrink: 0; color: #14b8a6; display: flex; align-items: center; }
            .merge-icon svg { width: 20px; height: 20px; }
            .merge-content { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 2px; }
            .merge-title { font-size: 13px; font-weight: 600; color: #ffffff; margin-bottom: 2px; line-height: 1.2; }
            .merge-subtitle { font-size: 11px; color: #14b8a6; opacity: 0.9; line-height: 1.2; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
            """,
            icon="<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-git-merge\"><circle cx=\"18\" cy=\"18\" r=\"3\"/><circle cx=\"6\" cy=\"6\" r=\"3\"/><path d=\"M6 21V9a9 9 0 0 0 9 9\"/></svg>",
            subtitle="COMBINE DATA",
            background_color="#1f1f1f",
            border_color="#14b8a6",
            text_color="#ffffff",
            shape="compact",
            width=180,
            height=80,
            css_classes="",
            inline_styles='{}',
            icon_position=""
        )

    def _define_ui_config(self) -> NodeUIConfig:
        """Define the UI configuration for MergeNode"""
        return NodeUIConfig(
            node_id=self.node_id,
            node_name="MergeNode",
            groups=[
                UIGroup(
                    name="separator_config",
                    label="Merge Settings",
                    components=[
                        create_text_input(
                            name="separator",
                            label="Separator (Optional)",
                            required=False,
                            default_value="",
                            placeholder="e.g., ',', '|', '-'. Leave empty for space only.",
                            styling={
                                "width": "100%"
                            }
                        ),
                        create_label(
                            text="Note: A space will be added on both sides of the separator. Leave empty to merge with a single space."
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
                title="Configure Merge Node",
                description="Combine two inputs into one output. Optionally add a separator between them.",
                background_color="#1f1f1f",
                border_color="#14b8a6",
                text_color="#ffffff",
                icon="""<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor"><path d="M136,32V64a8,8,0,0,1-16,0V32a8,8,0,0,1,16,0Zm88,88H136V96a8,8,0,0,0-16,0v24H32a8,8,0,0,0,0,16h88v24a8,8,0,0,0,16,0V136h88a8,8,0,0,0,0-16ZM128,192a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V200A8,8,0,0,0,128,192Z"></path></svg>""",
                icon_color="#14b8a6",
                header_background="#1f1f1f",
                footer_background="#1f1f1f",
                button_primary_color="#14b8a6",
                button_secondary_color="#374151"
            )
        )

    def execute(self, inputs: Dict[str, Any], parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the MergeNode logic

        Args:
            inputs: Dictionary containing 'input1' and 'input2'
            parameters: Dictionary containing 'separator'

        Returns:
            Dictionary containing 'query' with combined result
        """
        input1 = inputs.get("input1", "")
        input2 = inputs.get("input2", "")
        separator = parameters.get("separator", "")

        # Check if inputs are error outputs (if they're dicts)
        # Also check if string inputs contain error patterns
        error_detected = False
        error_message = None
        
        # Check input1
        if isinstance(input1, dict) and is_error_output(input1):
            error_detected = True
            error_message = extract_error_message(input1) or "Error in input1"
        elif isinstance(input1, str) and input1.strip().startswith(("Error:", "ERROR:", "error:")):
            error_detected = True
            error_message = input1
        
        # Check input2
        if not error_detected:
            if isinstance(input2, dict) and is_error_output(input2):
                error_detected = True
                error_message = extract_error_message(input2) or "Error in input2"
            elif isinstance(input2, str) and input2.strip().startswith(("Error:", "ERROR:", "error:")):
                error_detected = True
                error_message = input2
        
        # If error detected, propagate it
        if error_detected:
            return {
                "query": error_message or "An error occurred in input",
                "success": False,
                "metadata": {
                    "error": error_message or "An error occurred in input"
                }
            }

        # Convert to strings if not already
        input1_str = str(input1).strip() if input1 else ""
        input2_str = str(input2).strip() if input2 else ""

        # Combine inputs with proper spacing
        if input1_str and input2_str:
            # Both inputs have values
            if separator:
                # If separator provided, add space on both sides of separator
                result = f"{input1_str} {separator} {input2_str}"
            else:
                # If no separator, add space between texts
                result = f"{input1_str} {input2_str}"
        elif input1_str:
            # Only input1 has value
            result = input1_str
        elif input2_str:
            # Only input2 has value
            result = input2_str
        else:
            # Both inputs are empty
            result = ""

        return {
            "query": result
        }
