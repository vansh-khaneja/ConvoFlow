"""
TextTransform Node - Transforms and manipulates text.
This node provides various text transformation operations.
"""

from typing import Dict, Any, List, Optional
import sys
import os
import re

# Add the parent directory to the path to import base_node and ui_components
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from base_node import BaseNode, NodeInput, NodeOutput, NodeParameter, NodeStyling
from ui_components import (
    NodeUIConfig, UIGroup, DialogConfig,
    create_text_input, create_select, create_label, UIOption
)


class TextTransformNode(BaseNode):
    """
    TextTransform Node - Transforms and manipulates text.

    This node applies various text transformations like uppercase, lowercase,
    """
    
    def _define_required_credentials(self, parameters: Optional[Dict[str, Any]] = None) -> List[str]:
        """No credentials required for TextTransformNode"""
        return []
    
    def _define_category(self) -> str:
        """Define category for TextTransformNode"""
        return "Data Processing"

    def _define_inputs(self) -> List[NodeInput]:
        """Define the input structure for TextTransformNode"""
        return [
            NodeInput(
                name="query",
                type="string",
                description="The input text to transform",
                required=True
            )
        ]

    def _define_outputs(self) -> List[NodeOutput]:
        """Define the output structure for TextTransformNode"""
        return [
            NodeOutput(
                name="query",
                type="string",
                description="The transformed text"
            )
        ]

    def _define_parameters(self) -> List[NodeParameter]:
        """Define the parameters for TextTransformNode"""
        return [
            NodeParameter(
                name="operation",
                type="string",
                description="Text transformation operation to perform",
                required=True,
                default_value="lowercase",
                options=["uppercase", "lowercase", "title_case", "trim", "replace", "remove_spaces", "reverse"]
            ),
            NodeParameter(
                name="find_text",
                type="string",
                description="Text to find (for replace operation)",
                required=False,
                default_value=""
            ),
            NodeParameter(
                name="replace_text",
                type="string",
                description="Text to replace with (for replace operation)",
                required=False,
                default_value=""
            )
        ]

    def _define_styling(self) -> NodeStyling:
        """Define custom styling for TextTransformNode"""
        return NodeStyling(
            html_template="""
            <div class="transform-node-container">
                <div class="transform-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wand-2"><path d="m21.64 3.64-1.28-1.28a1.5 1.5 0 0 0-2.12 0L2.36 18.24a1.5 1.5 0 0 0 0 2.12l1.28 1.28a1.5 1.5 0 0 0 2.12 0L21.64 5.76a1.5 1.5 0 0 0 0-2.12Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>
                </div>
                <div class="transform-content">
                    <div class="transform-title">Transform Text</div>
                    <div class="transform-subtitle">MODIFY TEXT</div>
                </div>
            </div>
            """,
            custom_css="""
            .transform-node-container {
                display: flex;
                align-items: center;
                padding: 16px 20px;
                background: #1f1f1f;
                border: 1.5px solid #6366f1;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                transition: all 0.2s ease;
                transform-origin: center center;
                width: 220px;
                height: 100px;
                position: relative;
            }
            .transform-node-container:hover {
                border-color: #818cf8;
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
            }
            .transform-icon { margin-right: 12px; flex-shrink: 0; color: #6366f1; display: flex; align-items: center; }
            .transform-icon svg { width: 20px; height: 20px; }
            .transform-content { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 2px; }
            .transform-title { font-size: 13px; font-weight: 600; color: #ffffff; margin-bottom: 2px; line-height: 1.2; }
            .transform-subtitle { font-size: 11px; color: #6366f1; opacity: 0.9; line-height: 1.2; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
            """,
            icon="<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-wand-2\"><path d=\"m21.64 3.64-1.28-1.28a1.5 1.5 0 0 0-2.12 0L2.36 18.24a1.5 1.5 0 0 0 0 2.12l1.28 1.28a1.5 1.5 0 0 0 2.12 0L21.64 5.76a1.5 1.5 0 0 0 0-2.12Z\"/><path d=\"m14 7 3 3\"/><path d=\"M5 6v4\"/><path d=\"M19 14v4\"/><path d=\"M10 2v2\"/><path d=\"M7 8H3\"/><path d=\"M21 16h-4\"/><path d=\"M11 3H9\"/></svg>",
            subtitle="MODIFY TEXT",
            background_color="#1f1f1f",
            border_color="#6366f1",
            text_color="#ffffff",
            shape="rounded",
            width=220,
            height=100,
            css_classes="",
            inline_styles='{}',
            icon_position=""
        )

    def _define_ui_config(self) -> NodeUIConfig:
        """Define the UI configuration for TextTransformNode"""
        return NodeUIConfig(
            node_id=self.node_id,
            node_name="TextTransformNode",
            groups=[
                UIGroup(
                    name="operation_config",
                    label="Transformation Settings",
                    components=[
                        create_select(
                            name="operation",
                            label="Operation *",
                            required=True,
                            default_value="lowercase",
                            options=[
                                UIOption(value="uppercase", label="UPPERCASE"),
                                UIOption(value="lowercase", label="lowercase"),
                                UIOption(value="title_case", label="Title Case"),
                                UIOption(value="trim", label="Trim Whitespace"),
                                UIOption(value="replace", label="Find & Replace"),
                                UIOption(value="remove_spaces", label="Remove All Spaces"),
                                UIOption(value="reverse", label="Reverse Text")
                            ],
                            styling={
                                "width": "100%"
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
                    name="replace_config",
                    label="Replace Settings (for Find & Replace)",
                    components=[
                        create_text_input(
                            name="find_text",
                            label="Find Text",
                            required=False,
                            default_value="",
                            placeholder="Text to find",
                            styling={
                                "width": "100%"
                            }
                        ),
                        create_text_input(
                            name="replace_text",
                            label="Replace With",
                            required=False,
                            default_value="",
                            placeholder="Replacement text",
                            styling={
                                "width": "100%"
                            }
                        ),
                        create_label(
                            text="Note: Find & Replace settings only apply when 'Find & Replace' operation is selected"
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
                title="Configure Text Transform",
                description="Apply various text transformations to your input. Choose from uppercase, lowercase, trim, replace, and more.",
                background_color="#1f1f1f",
                border_color="#6366f1",
                text_color="#ffffff",
                icon="""<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor"><path d="M224,48V208a8,8,0,0,1-16,0V128H152v80a8,8,0,0,1-16,0V48a8,8,0,0,1,16,0v64h56V48a8,8,0,0,1,16,0ZM96,168a8,8,0,0,0-8,8v16H56V176a8,8,0,0,0-16,0v32a8,8,0,0,0,8,8H88a8,8,0,0,0,8-8V176A8,8,0,0,0,96,168Zm0-128H48a8,8,0,0,0-8,8V80a8,8,0,0,0,16,0V56H88V80a8,8,0,0,0,16,0V48A8,8,0,0,0,96,40Z"></path></svg>""",
                icon_color="#6366f1",
                header_background="#1f1f1f",
                footer_background="#1f1f1f",
                button_primary_color="#6366f1",
                button_secondary_color="#374151"
            )
        )

    def execute(self, inputs: Dict[str, Any], parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the TextTransformNode logic

        Args:
            inputs: Dictionary containing 'query'
            parameters: Dictionary containing 'operation', 'find_text', 'replace_text'

        Returns:
            Dictionary containing 'query' with transformed text
        """
        query = inputs.get("query", "")
        operation = parameters.get("operation", "lowercase")
        find_text = parameters.get("find_text", "")
        replace_text = parameters.get("replace_text", "")

        # Perform the transformation
        try:
            if operation == "uppercase":
                result = query.upper()
            elif operation == "lowercase":
                result = query.lower()
            elif operation == "title_case":
                result = query.title()
            elif operation == "trim":
                result = query.strip()
            elif operation == "replace":
                if find_text:
                    result = query.replace(find_text, replace_text)
                else:
                    result = query  # No find_text provided, return original
            elif operation == "remove_spaces":
                result = query.replace(" ", "")
            elif operation == "reverse":
                result = query[::-1]
            else:
                return {
                    "query": f"ERROR: Unknown operation - {operation}",
                    "success": False,
                    "metadata": {
                        "error": f"Unknown operation - {operation}"
                    }
                }

            return {
                "query": result
            }

        except Exception as e:
            return {
                "query": f"ERROR: Text transformation failed - {str(e)}",
                "success": False,
                "metadata": {
                    "error": f"Text transformation failed - {str(e)}"
                }
            }
