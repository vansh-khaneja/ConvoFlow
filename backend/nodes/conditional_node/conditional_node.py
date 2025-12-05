"""
Conditional Node - Evaluates a condition on inputs and branches.

Supports operators: equals, contains, starts_with, ends_with.
Outputs two sockets: "true" and "false" to enable branching.
"""

from typing import Dict, Any, List, Optional
import sys
import os

# Add the parent directory to the path to import base_node and ui_components
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from base_node import BaseNode, NodeInput, NodeOutput, NodeParameter, NodeStyling, is_error_output, extract_error_message
from ui_components import (
    NodeUIConfig, UIGroup, DialogConfig,
    create_text_input, create_select, create_checkbox,
    UIOption
)


class ConditionalNode(BaseNode):
    """
    Conditional Node - Evaluates a condition and routes accordingly.

    Inputs:
      - left (required): left-hand value (commonly connect from QueryNode's `query`).
      - right (optional): right-hand value (alternatively use parameter `right_value`).

    Parameters:
      - operator: equals | contains | starts_with | ends_with
      - right_value: literal right-hand value if not provided via input
      - case_sensitive: compare with case sensitivity (default False)

    Outputs:
      - true: emits the `left` value when condition is True (for branching)
      - false: emits the `left` value when condition is False (for branching)
      - condition: boolean result for downstream logic or inspection
    """
    
    def _define_required_credentials(self, parameters: Optional[Dict[str, Any]] = None) -> List[str]:
        """No credentials required for ConditionalNode"""
        return []
    
    def _define_category(self) -> str:
        """Define category for ConditionalNode"""
        return "Logic"

    def _define_inputs(self) -> List[NodeInput]:
        return [
            NodeInput(
                name="left",
                type="string",
                description="Left-hand value to evaluate (e.g., user query)",
                required=True,
            ),
            NodeInput(
                name="right",
                type="string",
                description="Optional right-hand value; if absent, uses parameter right_value",
                required=False,
            ),
        ]

    def _define_outputs(self) -> List[NodeOutput]:
        return [
            NodeOutput(
                name="true",
                type="string",
                description="Pass-through when condition True (for branching)",
            ),
            NodeOutput(
                name="false",
                type="string",
                description="Pass-through when condition False (for branching)",
            ),
            NodeOutput(
                name="condition",
                type="boolean",
                description="Boolean result of the evaluation",
            ),
        ]

    def _define_parameters(self) -> List[NodeParameter]:
        return [
            NodeParameter(
                name="operator",
                type="string",
                description="Comparison operator",
                required=True,
                default_value="contains",
                options=["equals", "contains", "starts_with", "ends_with"],
            ),
            NodeParameter(
                name="right_value",
                type="string",
                description="Literal right-hand value (used if input `right` not connected)",
                required=False,
                default_value="",
            ),
            NodeParameter(
                name="case_sensitive",
                type="boolean",
                description="Enable case-sensitive comparison",
                required=False,
                default_value=False,
            ),
        ]

    def _define_styling(self) -> NodeStyling:
        # Custom HTML to render a diamond shape with amber accent
        return NodeStyling(
            html_template="""
            <div class=\"cond-node-outer\">
                <div class=\"cond-node-inner\">
                    <div class=\"cond-icon\">
                        <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-git-branch\"><line x1=\"6\" x2=\"6\" y1=\"3\" y2=\"15\"/><circle cx=\"18\" cy=\"6\" r=\"3\"/><circle cx=\"6\" cy=\"18\" r=\"3\"/><path d=\"M18 9a9 9 0 0 1-9 9\"/></svg>
                    </div>
                    <div class=\"cond-content\">
                        <div class=\"cond-title\">Condition</div>
                        <div class=\"cond-subtitle\">IF/ELSE</div>
                    </div>
                </div>
            </div>
            """,
            custom_css="""
            .cond-node-outer {
                width: 120px; height: 120px; position: relative;
                background: #1f1f1f;
                border: 1.5px solid #f59e0b;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                border-radius: 12px;
            }
            .cond-node-outer:hover { 
                border-color: #fbbf24; 
                box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
            }
            .cond-node-inner { 
                position: absolute; 
                inset: 0; 
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                justify-content: center; 
                gap: 6px;
                width: 100%;
                height: 100%;
            }
            .cond-icon { 
                color: #f59e0b; 
                display: flex; 
                align-items: center; 
                justify-content: center;
            }
            .cond-icon svg { width: 20px; height: 20px; }
            .cond-content { 
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                justify-content: center; 
                min-width: 0;
                gap: 2px;
            }
            .cond-title { 
                font-size: 12px; 
                font-weight: 700; 
                color: #ffffff; 
                line-height: 1.2; 
                text-align: center;
                white-space: nowrap;
            }
            .cond-subtitle { 
                font-size: 9px; 
                color: #f59e0b; 
                opacity: 0.9; 
                line-height: 1.2; 
                font-weight: 700; 
                letter-spacing: 0.5px; 
                text-transform: uppercase; 
                text-align: center;
                white-space: nowrap;
            }
            """,
            icon="<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-git-branch\"><line x1=\"6\" x2=\"6\" y1=\"3\" y2=\"15\"/><circle cx=\"18\" cy=\"6\" r=\"3\"/><circle cx=\"6\" cy=\"18\" r=\"3\"/><path d=\"M18 9a9 9 0 0 1-9 9\"/></svg>", subtitle="IF/ELSE", background_color="#1f1f1f", border_color="#f59e0b", text_color="#ffffff",
            shape="rounded", width=120, height=120, css_classes="", inline_styles='{}', icon_position=""
        )

    def _define_ui_config(self) -> NodeUIConfig:
        return NodeUIConfig(
            node_id=self.node_id,
            node_name="ConditionalNode",
            groups=[
                UIGroup(
                    name="condition_config",
                    label="Condition Configuration",
                    components=[
                        create_select(
                            name="operator",
                            label="Operator *",
                            required=True,
                            options=[
                                UIOption(label="equals", value="equals"),
                                UIOption(label="contains", value="contains"),
                                UIOption(label="starts_with", value="starts_with"),
                                UIOption(label="ends_with", value="ends_with"),
                            ],
                            default_value="contains",
                        ),
                        create_text_input(
                            name="right_value",
                            label="Right Value (optional if `right` input connected)",
                            required=False,
                            default_value="",
                            placeholder="Enter literal value...",
                        ),
                        create_checkbox(
                            name="case_sensitive",
                            label="Case sensitive",
                            required=False,
                            default_value=False,
                        ),
                    ],
                    styling={
                        "padding": "16px",
                        "background": "#2a2a2a",
                        "border_radius": "8px",
                        "border": "1px solid #404040",
                    },
                )
            ],
            layout="vertical",
            global_styling={"font_family": "Inter, sans-serif", "color_scheme": "light"},
            dialog_config=DialogConfig(
                title="Configure ConditionalNode",
                description="Evaluate a condition and branch outputs to true/false.",
                background_color="#1f1f1f",
                border_color="#f59e0b",
                text_color="#ffffff",
                icon="""<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path d=\"M10 6h4M4 12h16M10 18h4\" stroke=\"#f59e0b\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n</svg>""",
                icon_color="#f59e0b",
                header_background="#1f1f1f",
                footer_background="#1f1f1f",
                button_primary_color="#f59e0b",
                button_secondary_color="#374151",
            ),
        )

    def execute(self, inputs: Dict[str, Any], parameters: Dict[str, Any]) -> Dict[str, Any]:
        left_value = inputs.get("left", "")
        right_value = inputs.get("right")
        if right_value is None:
            right_value = parameters.get("right_value", "")

        # Check if inputs are error outputs
        error_detected = False
        error_message = None
        
        # Check left input
        if isinstance(left_value, dict) and is_error_output(left_value):
            error_detected = True
            error_message = extract_error_message(left_value) or "Error in left input"
        elif isinstance(left_value, str) and left_value.strip().startswith(("Error:", "ERROR:", "error:")):
            error_detected = True
            error_message = left_value
        
        # Check right input
        if not error_detected:
            if isinstance(right_value, dict) and is_error_output(right_value):
                error_detected = True
                error_message = extract_error_message(right_value) or "Error in right input"
            elif isinstance(right_value, str) and right_value.strip().startswith(("Error:", "ERROR:", "error:")):
                error_detected = True
                error_message = right_value
        
        # If error detected, propagate it
        if error_detected:
            return {
                "condition": False,
                "true": "",
                "false": "",
                "success": False,
                "metadata": {
                    "error": error_message or "An error occurred in input"
                }
            }

        operator = parameters.get("operator", "contains")
        case_sensitive_param = parameters.get("case_sensitive", False)
        
        # Handle case_sensitive parameter - could be bool, string "true"/"false", or other
        if isinstance(case_sensitive_param, bool):
            case_sensitive = case_sensitive_param
        elif isinstance(case_sensitive_param, str):
            # Handle string values like "true", "True", "false", "False"
            case_sensitive = case_sensitive_param.lower() in ("true", "1", "yes", "on")
        else:
            # For any other type, convert to bool
            case_sensitive = bool(case_sensitive_param)

        # Prepare values
        left_str = "" if left_value is None else str(left_value)
        right_str = "" if right_value is None else str(right_value)

        if not case_sensitive:
            left_cmp = left_str.lower()
            right_cmp = right_str.lower()
        else:
            left_cmp = left_str
            right_cmp = right_str

        # Evaluate
        if operator == "equals":
            result = left_cmp == right_cmp
        elif operator == "contains":
            result = right_cmp in left_cmp
        elif operator == "starts_with":
            result = left_cmp.startswith(right_cmp)
        elif operator == "ends_with":
            result = left_cmp.endswith(right_cmp)
        else:
            # Fallback safe default
            result = False

        # Expose for template
        self.node_data = {"operator": operator}

        # Emit only the active branch to avoid multiple-path routing conflicts
        output: Dict[str, Any] = {"condition": result}
        if result:
            output["true"] = left_str
        else:
            output["false"] = left_str
        return output


