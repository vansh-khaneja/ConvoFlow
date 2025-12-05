"""
Query Node - Entry point for user queries in the chatbot workflow.
This node receives user input and passes it through the workflow.
"""

from typing import Dict, Any, List, Optional
import sys
import os

# Add the parent directory to the path to import base_node and ui_components
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from base_node import BaseNode, NodeInput, NodeOutput, NodeParameter, NodeStyling
from ui_components import (
    NodeUIConfig, UIGroup, DialogConfig,
    create_text_input, create_label, create_button,
    UIOption
)


class QueryNode(BaseNode):
    """
    Query Node - Handles user input queries.
    
    This node serves as the entry point for user queries in the chatbot workflow.
    """
    
    def _define_required_credentials(self, parameters: Optional[Dict[str, Any]] = None) -> List[str]:
        """No credentials required for QueryNode"""
        return []
    
    def _define_category(self) -> str:
        """Define category for QueryNode"""
        return "I/O"
    
    def _define_inputs(self) -> List[NodeInput]:
        """Define the input structure for QueryNode"""
        return []
    
    def _define_outputs(self) -> List[NodeOutput]:
        """Define the output structure for QueryNode"""
        return [
            NodeOutput(
                name="query",
                type="string",
                description="The processed query ready for the next node"
            )
        ]
    
    def _define_parameters(self) -> List[NodeParameter]:
        """Define the parameters for QueryNode"""
        return [
            NodeParameter(
                name="query",
                type="string",
                description="The user's input query or message",
                required=True,
                default_value="Hi there!"
            )
        ]
    
    def _define_styling(self) -> NodeStyling:
        """Define custom styling for QueryNode"""
        return NodeStyling(
            html_template="""
            <div class=\"query-node-container\">
                <div class=\"query-icon\">
                    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-message-square\"><path d=\"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z\"/></svg>
                </div>
                <div class=\"query-content\">
                    <div class=\"query-title\">User Input</div>
                    <div class=\"query-subtitle\">START POINT</div>
                </div>
            </div>
            """,
            custom_css="""
            .query-node-container {
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
            .query-node-container:hover {
                border-color: #22d3ee;
                box-shadow: 0 4px 12px rgba(6, 182, 212, 0.2);
            }
            .query-icon { margin-right: 12px; flex-shrink: 0; color: #06b6d4; display: flex; align-items: center; }
            .query-icon svg { width: 20px; height: 20px; }
            .query-content { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 2px; }
            .query-title { font-size: 13px; font-weight: 600; color: #ffffff; margin-bottom: 2px; line-height: 1.2; }
            .query-subtitle { font-size: 11px; color: #06b6d4; opacity: 0.9; line-height: 1.2; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
            """,
            icon="<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-message-square\"><path d=\"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z\"/></svg>", subtitle="START POINT", background_color="#1f1f1f", border_color="#06b6d4", text_color="#ffffff",
            shape="pill", width=220, height=90, css_classes="", inline_styles='{}', icon_position=""
        )
    
    def _define_ui_config(self) -> NodeUIConfig:
        """Define the UI configuration for QueryNode"""
        return NodeUIConfig(
            node_id=self.node_id,
            node_name="QueryNode",
            groups=[
                UIGroup(
                    name="query_config",
                    label="Query Configuration",
                    components=[
                        create_text_input(
                            name="query",
                            label="User Query *",
                            required=True,
                            default_value="Hi there!",
                            placeholder="Enter your query here...",
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
                )
            ],
            layout="vertical",
            global_styling={
                "font_family": "Inter, sans-serif",
                "color_scheme": "light"
            },
            dialog_config=DialogConfig(
                title="Configure QueryNode",
                description="Query Node - Handles user input queries. This node serves as the entry point for user queries in the chatbot workflow. It receives user input and passes it through to the next nodes in the workflow.",
                background_color="#1f1f1f",
                border_color="#06b6d4",
                text_color="#ffffff",
                icon="""<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor"><path d="M32,64a8,8,0,0,1,8-8H216a8,8,0,0,1,0,16H40A8,8,0,0,1,32,64Zm8,72h72a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16Zm88,48H40a8,8,0,0,0,0,16h88a8,8,0,0,0,0-16Zm109.66,13.66a8,8,0,0,1-11.32,0L206,177.36A40,40,0,1,1,217.36,166l20.3,20.3A8,8,0,0,1,237.66,197.66ZM184,168a24,24,0,1,0-24-24A24,24,0,0,0,184,168Z"></path></svg>""",
                icon_color="#06b6d4",
                header_background="#1f1f1f",
                footer_background="#1f1f1f",
                button_primary_color="#06b6d4",
                button_secondary_color="#374151"
            )
        )
    def execute(self, inputs: Dict[str, Any], parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the QueryNode logic
        
        Args:
            inputs: Empty dictionary (no inputs)
            parameters: Dictionary containing 'query'
            
        Returns:
            Dictionary containing the processed 'query'
        """
        query = parameters["query"]
        
        # Simple processing - just clean the query
        processed_query = query.strip()
        
        return {
            "query": processed_query
        }


