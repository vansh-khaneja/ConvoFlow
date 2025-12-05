"""
Debug Node - Debugging and inspection node for workflow data flow.
This node allows you to inspect messages/data at any point in the workflow.
"""

from typing import Dict, Any, List, Optional
import sys
import os
import json
from datetime import datetime

# Add the parent directory to the path to import base_node and ui_components
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from base_node import BaseNode, NodeInput, NodeOutput, NodeParameter, NodeStyling
from ui_components import (
    NodeUIConfig, UIGroup, DialogConfig,
    create_label, create_divider,
    UIOption
)


class DebugNode(BaseNode):
    """
    Debug Node - Inspects and displays data flowing through the workflow.
    
    This node serves as a debugging tool that allows you to see what data
    """
    
    def _define_required_credentials(self, parameters: Optional[Dict[str, Any]] = None) -> List[str]:
        """No credentials required for DebugNode"""
        return []
    
    def _define_category(self) -> str:
        """Define category for DebugNode"""
        return "Debug"
    
    def __init__(self):
        super().__init__()
        # Store debug history
        self.debug_history: List[Dict[str, Any]] = []
    
    def _define_inputs(self) -> List[NodeInput]:
        """Define the input structure for DebugNode"""
        return [
            NodeInput(
                name="input_data",
                type="any",
                description="Data to inspect and debug (can be any type)",
                required=True
            )
        ]
    
    def _define_outputs(self) -> List[NodeOutput]:
        """Define the output structure for DebugNode"""
        return [
            NodeOutput(
                name="output_data",
                type="any",
                description="Passes through the input data unchanged for further processing"
            )
        ]  # Debug node passes data through while displaying it
    
    def _define_parameters(self) -> List[NodeParameter]:
        """Define the parameters for DebugNode"""
        return [
            NodeParameter(
                name="label",
                type="string",
                description="Optional label to identify this debug point",
                required=False,
                default_value=""
            ),
            NodeParameter(
                name="show_type",
                type="boolean",
                description="Show the data type in the debug display",
                required=False,
                default_value=True
            )
        ]
    
    def _define_styling(self) -> NodeStyling:
        """Define custom styling for DebugNode"""
        return NodeStyling(
            html_template="""
            <div class="debug-node-container">
                <div class="debug-header">
                    <div class="debug-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bug"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="m6 13 2.5 2.5"/><path d="m17.47 9C19.4 8.8 21 7.1 21 5"/><path d="m18 13-2.5 2.5"/></svg>
                    </div>
                    <div class="debug-title-section">
                        <div class="debug-title">Debug</div>
                        <div class="debug-subtitle">INSPECT DATA</div>
                    </div>
                </div>
                <div class="debug-logs-container">
                    <div class="debug-logs" title="{{debug_content}}">{{debug_content or 'Waiting for data...'}}</div>
                </div>
            </div>
            """,
            custom_css="""
            .debug-node-container {
                display: flex;
                flex-direction: column;
                padding: 14px 16px;
                background: #1f1f1f;
                border: 1.5px solid #f59e0b;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                transition: all 0.2s ease;
                transform-origin: center center;
                width: 280px;
                min-height: 140px;
                position: relative;
            }
            .debug-node-container:hover {
                border-color: #fbbf24;
                box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
            }
            .debug-header {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
                gap: 10px;
                padding-bottom: 8px;
                border-bottom: 1px solid #2a2a2a;
            }
            .debug-icon {
                flex-shrink: 0;
                color: #f59e0b;
                display: flex;
                align-items: center;
            }
            .debug-icon svg { width: 20px; height: 20px; }
            .debug-title-section {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            .debug-title {
                font-size: 13px;
                font-weight: 600;
                color: #ffffff;
                line-height: 1.2;
            }
            .debug-subtitle {
                font-size: 11px;
                color: #f59e0b;
                opacity: 0.9;
                line-height: 1.2;
                font-weight: 700;
                letter-spacing: 0.5px;
                text-transform: uppercase;
            }
            .debug-logs-container {
                flex: 1;
                background: #0a0a0a;
                border-radius: 6px;
                padding: 8px;
                border: 1px solid #1a1a1a;
                box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
                min-height: 80px;
            }
            .debug-logs {
                font-size: 10px;
                color: #cbd5e1;
                font-family: 'Courier New', 'Consolas', 'Monaco', monospace;
                line-height: 1.5;
                white-space: pre-wrap;
                word-break: break-word;
                max-height: 100px;
                overflow-y: auto;
            }
            .debug-logs:empty::before {
                content: 'Waiting for data...';
                color: #6b7280;
                font-style: italic;
            }
            .debug-logs::-webkit-scrollbar {
                width: 4px;
            }
            .debug-logs::-webkit-scrollbar-track {
                background: #0f0f0f;
            }
            .debug-logs::-webkit-scrollbar-thumb {
                background: #f59e0b;
                border-radius: 2px;
            }
            .debug-logs::-webkit-scrollbar-thumb:hover {
                background: #fbbf24;
            }
            """,
            icon="<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-bug\"><path d=\"m8 2 1.88 1.88\"/><path d=\"M14.12 3.88 16 2\"/><path d=\"M9 7.13v-1a3.003 3.003 0 1 1 6 0v1\"/><path d=\"M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6\"/><path d=\"M12 20v-9\"/><path d=\"M6.53 9C4.6 8.8 3 7.1 3 5\"/><path d=\"m6 13 2.5 2.5\"/><path d=\"m17.47 9C19.4 8.8 21 7.1 21 5\"/><path d=\"m18 13-2.5 2.5\"/></svg>",
            subtitle="INSPECT DATA", background_color="#1f1f1f", border_color="#f59e0b", text_color="#ffffff",
            shape="custom", width=280, height=140, css_classes="", inline_styles='{}', icon_position="",
            hide_outputs=False  # Debug node now has outputs to pass data through
        )
    
    def _define_ui_config(self) -> NodeUIConfig:
        """Define the UI configuration for DebugNode"""
        return NodeUIConfig(
            node_id=self.node_id,
            node_name="DebugNode",
            groups=[
                UIGroup(
                    name="debug_info",
                    label="Debug Information",
                    components=[
                        create_label(
                            text="This node displays data flowing through your workflow for debugging purposes."
                        ),
                        create_divider(),
                        create_label(
                            text="This node passes data through unchanged, allowing you to inspect intermediate results without blocking the workflow."
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
                title="Configure DebugNode",
                description="Debug Node - Inspect data flowing through your workflow.",
                background_color="#1f1f1f",
                border_color="#f59e0b",
                text_color="#ffffff",
                icon="""<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bug"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="m6 13 2.5 2.5"/><path d="m17.47 9C19.4 8.8 21 7.1 21 5"/><path d="m18 13-2.5 2.5"/></svg>""",
                icon_color="#f59e0b",
                header_background="#1f1f1f",
                footer_background="#1f1f1f",
                button_primary_color="#f59e0b",
                button_secondary_color="#374151"
            )
        )
    
    def execute(self, inputs: Dict[str, Any], parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the DebugNode logic
        
        Args:
            inputs: Dictionary containing 'input_data' (data to inspect)
            parameters: Dictionary containing 'label' (optional label) and 'show_type' (boolean)
            
        Returns:
            Dictionary containing output_data (same as input, passed through) and debug_info
        """
        raw_input = inputs.get("input_data", "")
        label = parameters.get("label", "")
        show_type = parameters.get("show_type", True)
        
        # Handle empty input case
        if not raw_input and raw_input != 0 and raw_input != False:
            timestamp = datetime.now()
            timestamp_str = timestamp.strftime("%H:%M:%S.%f")[:-3]
            date_str = timestamp.strftime("%Y-%m-%d")
            
            debug_lines = []
            debug_lines.append(f"[{date_str} {timestamp_str}]")
            if label:
                debug_lines.append(f"Label: {label}")
            debug_lines.append("Type: empty")
            debug_lines.append("-" * 40)
            debug_lines.append("Waiting for data...")
            
            debug_content = "\n".join(debug_lines)
            
            self.node_data = {
                "debug_content": debug_content,
                "debug_history": self.debug_history[-10:]
            }
            # Pass through empty string instead of None to avoid being skipped by execution logic
            return {
                "output_data": "",  # Pass through empty string for empty input (to avoid being skipped)
                "debug_content": debug_content,  # Return debug_content directly like ResponseNode
                "debug_info": {
                    "label": label,
                    "type": "empty",
                    "preview": "No data",
                    "timestamp": datetime.now().isoformat(),
                    "data": None
                }
            }
        
        # Format debug display with enhanced information
        input_type = type(raw_input).__name__
        timestamp = datetime.now()
        timestamp_str = timestamp.strftime("%H:%M:%S.%f")[:-3]  # Format: HH:MM:SS.mmm
        date_str = timestamp.strftime("%Y-%m-%d")
        
        # Create debug content string with structured information
        debug_lines = []
        
        # Add timestamp header
        debug_lines.append(f"[{date_str} {timestamp_str}]")
        
        # Add label if provided
        if label:
            debug_lines.append(f"Label: {label}")
        
        # Add type information with size/length if applicable
        type_info = f"Type: {input_type}"
        if isinstance(raw_input, (str, list, dict)):
            if isinstance(raw_input, str):
                type_info += f" (length: {len(raw_input)})"
            elif isinstance(raw_input, list):
                type_info += f" (items: {len(raw_input)})"
            elif isinstance(raw_input, dict):
                type_info += f" (keys: {len(raw_input)})"
        
        if show_type:
            debug_lines.append(type_info)
        
        # Add separator line
        debug_lines.append("-" * 38)
        
        # Format the actual data
        if isinstance(raw_input, str):
            # For strings, show more content with word wrapping
            if len(raw_input) > 300:
                data_preview = raw_input[:300] + f"\n... (truncated, {len(raw_input)} total chars)"
            else:
                data_preview = raw_input
        elif isinstance(raw_input, (dict, list)):
            try:
                data_str = json.dumps(raw_input, indent=2)
                # For JSON, show more content since it's structured
                if len(data_str) > 500:
                    data_preview = data_str[:500] + f"\n... (truncated, {len(data_str)} total chars)"
                else:
                    data_preview = data_str
            except:
                data_preview = str(raw_input)[:300] + ("..." if len(str(raw_input)) > 300 else "")
        else:
            data_str = str(raw_input)
            if len(data_str) > 300:
                data_preview = data_str[:300] + f"\n... (truncated, {len(data_str)} total chars)"
            else:
                data_preview = data_str

        debug_lines.append(data_preview)

        # Join with newlines for vertical display
        debug_content = "\n".join(debug_lines)
        
        # Store debug history entry
        debug_entry = {
            "timestamp": datetime.now().isoformat(),
            "label": label,
            "data_type": input_type,
            "data": raw_input,
            "preview": data_preview
        }
        self.debug_history.append(debug_entry)
        
        # Store the debug content in the node's data for display in the HTML template
        self.node_data = {
            "debug_content": debug_content,
            "debug_history": self.debug_history[-10:]  # Keep last 10 entries
        }
        
        # Return output_data (to pass through), debug_content (for display like ResponseNode), and debug_info
        return {
            "output_data": raw_input,  # Pass through the input data unchanged
            "debug_content": debug_content,  # Return debug_content directly like ResponseNode returns final_response
            "debug_info": {
                "label": label,
                "type": input_type,
                "preview": data_preview,
                "timestamp": debug_entry["timestamp"],
                "data": raw_input  # Include the full data for inspection
            }
        }

