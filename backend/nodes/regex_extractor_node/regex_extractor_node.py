"""
RegexExtractor Node - Extracts data from text using regex patterns.
This node uses regular expressions to extract specific patterns from input text.
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
    create_text_input, create_textarea, create_label
)


class RegexExtractorNode(BaseNode):
    """
    RegexExtractor Node - Extracts data from text using regex patterns.

    This node takes a regex pattern and input text, then extracts matching content.
    It returns both the full matches and any capture groups found in the pattern.
    """
    
    def _define_required_credentials(self, parameters: Optional[Dict[str, Any]] = None) -> List[str]:
        """No credentials required for RegexExtractorNode"""
        return []

    def _define_category(self) -> str:
        """Define category for RegexExtractorNode"""
        return "Data Processing"

    def _define_inputs(self) -> List[NodeInput]:
        """Define the input structure for RegexExtractorNode"""
        return [
            NodeInput(
                name="query",
                type="string",
                description="The input query to search for patterns",
                required=True
            )
        ]

    def _define_outputs(self) -> List[NodeOutput]:
        """Define the output structure for RegexExtractorNode"""
        return [
            NodeOutput(
                name="query",
                type="string",
                description="Extracted matches (comma-separated if multiple)"
            )
        ]

    def _define_parameters(self) -> List[NodeParameter]:
        """Define the parameters for RegexExtractorNode"""
        return [
            NodeParameter(
                name="pattern",
                type="string",
                description="Regular expression pattern to match",
                required=True,
                default_value=r"\d+"
            ),
            NodeParameter(
                name="case_sensitive",
                type="boolean",
                description="Whether the pattern matching should be case sensitive",
                required=False,
                default_value=True
            )
        ]

    def _define_styling(self) -> NodeStyling:
        """Define custom styling for RegexExtractorNode"""
        return NodeStyling(
            html_template="""
            <div class="regex-node-container">
                <div class="regex-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-filter"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                </div>
                <div class="regex-content">
                    <div class="regex-title">Extract Pattern</div>
                    <div class="regex-subtitle">FIND TEXT</div>
                </div>
            </div>
            """,
            custom_css="""
            .regex-node-container {
                display: flex;
                align-items: center;
                padding: 14px 18px;
                background: #1f1f1f;
                border: 1.5px solid #ec4899;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                transition: all 0.2s ease;
                transform-origin: center center;
                width: 180px;
                height: 80px;
                position: relative;
            }
            .regex-node-container:hover {
                border-color: #f472b6;
                box-shadow: 0 4px 12px rgba(236, 72, 153, 0.2);
            }
            .regex-icon { margin-right: 12px; flex-shrink: 0; color: #ec4899; display: flex; align-items: center; }
            .regex-icon svg { width: 20px; height: 20px; }
            .regex-content { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 2px; }
            .regex-title { font-size: 13px; font-weight: 600; color: #ffffff; margin-bottom: 2px; line-height: 1.2; }
            .regex-subtitle { font-size: 11px; color: #ec4899; opacity: 0.9; line-height: 1.2; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
            """,
            icon="<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-filter\"><polygon points=\"22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3\"/></svg>",
            subtitle="FIND TEXT",
            background_color="#1f1f1f",
            border_color="#ec4899",
            text_color="#ffffff",
            shape="compact",
            width=180,
            height=80,
            css_classes="",
            inline_styles='{}',
            icon_position=""
        )

    def _define_ui_config(self) -> NodeUIConfig:
        """Define the UI configuration for RegexExtractorNode"""
        return NodeUIConfig(
            node_id=self.node_id,
            node_name="RegexExtractorNode",
            groups=[
                UIGroup(
                    name="pattern_config",
                    label="Pattern Configuration",
                    components=[
                        create_text_input(
                            name="pattern",
                            label="Regex Pattern *",
                            required=True,
                            default_value=r"\d+",
                            placeholder="Enter regex pattern (e.g., \\d+ for numbers)",
                            styling={
                                "width": "100%",
                                "font_family": "monospace"
                            }
                        ),
                        create_label(
                            text="Examples: \\d+ (numbers), \\w+ (words), [a-z]+ (lowercase letters), (\\d{3})-(\\d{4}) (phone pattern with groups)"
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
                title="Configure RegexExtractor",
                description="Extract data from text using regular expressions. This node searches for patterns in the input text and returns all matches and capture groups.",
                background_color="#1f1f1f",
                border_color="#ec4899",
                text_color="#ffffff",
                icon="""<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor"><path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM128,168a8,8,0,0,1-8,8H104a8,8,0,0,1-8-8V144a8,8,0,0,1,8-8h16a8,8,0,0,1,8,8Zm0-64a8,8,0,0,1-8,8H104a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8h16a8,8,0,0,1,8,8Zm32,64a8,8,0,0,1-8,8H136a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8h16a8,8,0,0,1,8,8Z"></path></svg>""",
                icon_color="#ec4899",
                header_background="#1f1f1f",
                footer_background="#1f1f1f",
                button_primary_color="#ec4899",
                button_secondary_color="#374151"
            )
        )

    def execute(self, inputs: Dict[str, Any], parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the RegexExtractorNode logic

        Args:
            inputs: Dictionary containing 'query'
            parameters: Dictionary containing 'pattern' and optionally 'case_sensitive'

        Returns:
            Dictionary containing 'query' with extracted matches (comma-separated)
        """
        query = inputs.get("query", "")
        pattern = parameters.get("pattern", r"\d+")
        case_sensitive = parameters.get("case_sensitive", True)

        # Compile the regex pattern
        flags = 0 if case_sensitive else re.IGNORECASE

        try:
            compiled_pattern = re.compile(pattern, flags)
        except re.error as e:
            # Return error information if pattern is invalid
            return {
                "query": f"ERROR: Invalid regex pattern - {str(e)}",
                "success": False,
                "metadata": {
                    "error": f"Invalid regex pattern - {str(e)}"
                }
            }

        # Find all matches
        matches = compiled_pattern.findall(query)

        # Handle tuple results from groups
        if matches and isinstance(matches[0], tuple):
            # If there are capture groups, flatten them
            result_list = []
            for match in matches:
                if isinstance(match, tuple):
                    result_list.extend(match)
                else:
                    result_list.append(match)
            matches = result_list

        # Join matches with comma
        extracted = ", ".join(str(m) for m in matches) if matches else ""

        return {
            "query": extracted
        }
