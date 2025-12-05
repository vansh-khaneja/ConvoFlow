"""
Text Input Node - Provides static text input that can be used anywhere in the workflow.
This node allows you to manually enter text that can be connected to other nodes.
"""

from typing import Dict, Any, List, Optional
import sys
import os

# Add the parent directory to the path to import base_node and ui_components
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from base_node import BaseNode, NodeInput, NodeOutput, NodeParameter, NodeStyling
from ui_components import (
    NodeUIConfig, UIGroup, DialogConfig,
    create_textarea, create_label,
    UIOption
)


class TextInputNode(BaseNode):
    """
    Text Input Node - Provides static text input for workflows.
    
    This node allows you to manually enter text that can be connected to other nodes.
    Unlike QueryNode, multiple TextInputNodes can be used in a single workflow.
    """
    
    def _define_required_credentials(self, parameters: Optional[Dict[str, Any]] = None) -> List[str]:
        """No credentials required for TextInputNode"""
        return []
    
    def _define_category(self) -> str:
        """Define category for TextInputNode"""
        return "Data Processing"
    
    def _define_inputs(self) -> List[NodeInput]:
        """Define the input structure for TextInputNode"""
        return []
    
    def _define_outputs(self) -> List[NodeOutput]:
        """Define the output structure for TextInputNode"""
        return [
            NodeOutput(
                name="text",
                type="string",
                description="The text content entered in this node"
            )
        ]
    
    def _define_parameters(self) -> List[NodeParameter]:
        """Define the parameters for TextInputNode"""
        return [
            NodeParameter(
                name="text",
                type="string",
                description="The text content to output",
                required=False,
                default_value=""
            )
        ]
    
    def _define_styling(self) -> NodeStyling:
        """Define custom styling for TextInputNode"""
        return NodeStyling(
            html_template="""
            <div class="text-input-node-container">
                <div class="text-input-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
                </div>
                <div class="text-input-content">
                    <div class="text-input-title">Text Input</div>
                    <div class="text-input-subtitle">STATIC TEXT</div>
                </div>
            </div>
            """,
            custom_css="""
            .text-input-node-container {
                display: flex;
                align-items: center;
                padding: 16px 20px;
                background: #1f1f1f;
                border: 1.5px solid #8b5cf6;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                transition: all 0.2s ease;
                transform-origin: center center;
                width: 220px;
                height: 100px;
                position: relative;
            }
            .text-input-node-container:hover {
                border-color: #a78bfa;
                box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
            }
            .text-input-icon { margin-right: 12px; flex-shrink: 0; color: #8b5cf6; display: flex; align-items: center; }
            .text-input-icon svg { width: 20px; height: 20px; }
            .text-input-content { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 2px; }
            .text-input-title { font-size: 13px; font-weight: 600; color: #ffffff; margin-bottom: 2px; line-height: 1.2; }
            .text-input-subtitle { font-size: 11px; color: #8b5cf6; opacity: 0.9; line-height: 1.2; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
            """,
            icon="<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-type\"><polyline points=\"4 7 4 4 20 4 20 7\"/><line x1=\"9\" y1=\"20\" x2=\"15\" y2=\"20\"/><line x1=\"12\" y1=\"4\" x2=\"12\" y2=\"20\"/></svg>",
            subtitle="STATIC TEXT",
            background_color="#1f1f1f",
            border_color="#8b5cf6",
            text_color="#ffffff",
            shape="rounded",
            width=220,
            height=100,
            css_classes="",
            inline_styles='{}',
            icon_position=""
        )
    
    def _define_ui_config(self) -> NodeUIConfig:
        """Define the UI configuration for TextInputNode"""
        return NodeUIConfig(
            node_id=self.node_id,
            node_name="TextInputNode",
            groups=[
                UIGroup(
                    name="text_config",
                    label="Text Input",
                    description="Enter static text that can be used anywhere in your workflow",
                    components=[
                        create_textarea(
                            name="text",
                            label="Text Content",
                            required=False,
                            default_value="",
                            placeholder="Enter your text here...",
                            rows=6
                        ),
                        create_label(
                            text="This text will be output and can be connected to other nodes. Multiple Text Input nodes can be used in a workflow."
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
                title="Configure Text Input",
                description="Text Input Node - Provides static text that can be used anywhere in your workflow. Unlike QueryNode, multiple Text Input nodes can be used in a single workflow.",
                background_color="#1f1f1f",
                border_color="#8b5cf6",
                text_color="#ffffff",
                icon="""<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>""",
                icon_color="#8b5cf6",
                header_background="#1f1f1f",
                footer_background="#1f1f1f",
                button_primary_color="#8b5cf6",
                button_secondary_color="#374151"
            )
        )
    
    def execute(self, inputs: Dict[str, Any], parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the TextInputNode logic
        
        Args:
            inputs: Empty dictionary (no inputs)
            parameters: Dictionary containing 'text'
            
        Returns:
            Dictionary containing the 'text' output
        """
        text = parameters.get("text", "")
        
        return {
            "text": text
        }

