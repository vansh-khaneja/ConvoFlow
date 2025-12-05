from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
import sys
import os

# Add the parent directory to the path to import ui_components
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ui_components import NodeUIConfig, UIGroup, UIComponent


# Error detection helper functions
def is_error_output(output: Dict[str, Any]) -> bool:
    """
    Check if a node output represents an error.
    
    Args:
        output: Dictionary containing node output
        
    Returns:
        True if the output represents an error, False otherwise
    """
    if not isinstance(output, dict):
        return False
    
    # Check for explicit success: False flag
    if output.get("success") is False:
        return True
    
    # Check for metadata.error
    if output.get("metadata") and isinstance(output.get("metadata"), dict):
        if output["metadata"].get("error"):
            return True
    
    # Check for error prefixes in string fields
    error_prefixes = ["Error:", "ERROR:", "error:"]
    for key, value in output.items():
        if isinstance(value, str):
            # Check if string starts with any error prefix
            for prefix in error_prefixes:
                if value.strip().startswith(prefix):
                    return True
            # Check if string contains error indicators
            if "error" in value.lower() and any(indicator in value.lower() for indicator in ["failed", "not available", "not found", "invalid", "missing"]):
                # More careful check - only flag if it's clearly an error message
                if any(phrase in value.lower() for phrase in ["error:", "failed to", "not configured", "not set", "not found"]):
                    return True
    
    return False


def extract_error_message(output: Dict[str, Any]) -> Optional[str]:
    """
    Extract error message from a node output.
    
    Args:
        output: Dictionary containing node output
        
    Returns:
        Error message string if error is detected, None otherwise
    """
    if not is_error_output(output):
        return None
    
    # Try metadata.error first
    if output.get("metadata") and isinstance(output.get("metadata"), dict):
        error_msg = output["metadata"].get("error")
        if error_msg:
            return str(error_msg)
    
    # Try common error fields
    for field in ["error", "status", "query", "response", "summary", "text"]:
        if field in output:
            value = output[field]
            if isinstance(value, str):
                # Check if it's an error message
                if value.strip().startswith(("Error:", "ERROR:", "error:")):
                    return value
                # Check for error indicators
                if any(phrase in value.lower() for phrase in ["error:", "failed to", "not configured", "not set", "not found", "invalid"]):
                    return value
    
    # Default error message
    return "An error occurred during node execution"


@dataclass
class NodeInput:
    """Standardized input structure for nodes"""
    name: str
    type: str
    description: str
    required: bool = True
    default_value: Any = None


@dataclass
class NodeOutput:
    """Standardized output structure for nodes"""
    name: str
    type: str
    description: str


@dataclass
class NodeParameter:
    """Standardized parameter structure for nodes"""
    name: str
    type: str
    description: str
    required: bool = True
    default_value: Any = None
    options: Optional[List[str]] = None


@dataclass
class NodeStyling:
    """Styling configuration for node appearance"""
    icon: Optional[str] = None  # SVG string, emoji, or image URL
    background_color: Optional[str] = None  # CSS color
    border_color: Optional[str] = None  # CSS color
    text_color: Optional[str] = None  # CSS color
    custom_css: Optional[str] = None  # Additional CSS styles
    subtitle: Optional[str] = None  # Custom subtitle text
    icon_position: str = "left"  # "left", "right", "top", "bottom"
    shape: str = "rectangle"  # "rectangle", "circle", "rounded", "hexagon", "diamond", "pill", "compact", "custom"
    width: Optional[int] = None  # Fixed width in pixels
    height: Optional[int] = None  # Fixed height in pixels
    html_template: Optional[str] = None  # Custom HTML template
    css_classes: Optional[str] = None  # Additional CSS classes
    inline_styles: Optional[str] = None  # Additional inline styles as JSON string
    hide_outputs: bool = False  # If True, hide output handles in the UI (for terminal nodes)


class BaseNode(ABC):
    """
    Base class for all nodes in the chatbot builder.
    Provides a standardized interface for input/output handling and execution.
    """
    
    def __init__(self):
        self.node_id = self.__class__.__name__.lower()
        self.inputs = self._define_inputs()
        self.outputs = self._define_outputs()
        self.parameters = self._define_parameters()
        self.styling = self._define_styling()
        self.ui_config = self._define_ui_config()
    
    @abstractmethod
    def _define_inputs(self) -> List[NodeInput]:
        """Define the input structure for this node"""
        pass
    
    @abstractmethod
    def _define_outputs(self) -> List[NodeOutput]:
        """Define the output structure for this node"""
        pass
    
    @abstractmethod
    def _define_parameters(self) -> List[NodeParameter]:
        """Define the parameters for this node"""
        pass
    
    def _define_styling(self) -> NodeStyling:
        """Define the styling for this node - override in subclasses for custom styling"""
        return NodeStyling()
    
    def _define_ui_config(self) -> Optional[NodeUIConfig]:
        """Define the UI configuration for this node - override in subclasses for custom UI"""
        return None
    
    def _define_category(self) -> str:
        """
        Define the category for this node - override in subclasses to specify category.
        
        Returns:
            Category name as string (e.g., "Input/Output", "AI & Language Models", etc.)
            Defaults to "Other" if not specified.
        """
        return "Other"
    
    @abstractmethod
    def execute(self, inputs: Dict[str, Any], parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the node logic
        
        Args:
            inputs: Dictionary of input values
            parameters: Dictionary of parameter values
            
        Returns:
            Dictionary of output values
        """
        pass
    
    def _define_required_credentials(self, parameters: Optional[Dict[str, Any]] = None) -> List[str]:
        """
        Define required credentials/API keys for this node.
        Override in subclasses to specify required environment variables.
        
        Args:
            parameters: Optional node parameters that may affect which credentials are needed
        
        Returns:
            List of required environment variable names (e.g., ["OPENAI_API_KEY"])
        """
        return []
    
    def validate_credentials(self, parameters: Optional[Dict[str, Any]] = None) -> Optional[str]:
        """
        Validate that all required credentials are present in environment.
        
        Args:
            parameters: Optional node parameters that may affect which credentials are needed
        
        Returns:
            Error message if credentials are missing, None if all present
        """
        required_creds = self._define_required_credentials(parameters)
        if not required_creds:
            return None
        
        missing_creds = []
        for cred_name in required_creds:
            cred_value = os.getenv(cred_name)
            if not cred_value or cred_value.strip() == "":
                missing_creds.append(cred_name)
        
        if missing_creds:
            creds_str = ", ".join(missing_creds)
            return f"Missing required credential(s): {creds_str}. Please set them in Settings > Credentials or environment variables."
        
        return None
    
    def validate_inputs(self, inputs: Dict[str, Any]) -> Optional[str]:
        """
        Validate that all required inputs are provided and non-empty.
        
        Returns:
            Error message if validation fails, None if passes
        """
        for input_def in self.inputs:
            if input_def.required:
                if input_def.name not in inputs:
                    return f"Required input '{input_def.name}' is missing. Please provide a value."
                
                value = inputs[input_def.name]
                # Check if value is empty
                if value is None or (isinstance(value, str) and value.strip() == "") or \
                   (isinstance(value, (list, dict)) and len(value) == 0):
                    return f"Required input '{input_def.name}' is empty. Please provide a value."
        
        return None
    
    def validate_parameters(self, parameters: Dict[str, Any]) -> Optional[str]:
        """
        Validate that all required parameters are provided and non-empty.
        
        Returns:
            Error message if validation fails, None if passes
        """
        for param_def in self.parameters:
            if param_def.required:
                if param_def.name not in parameters:
                    return f"Required parameter '{param_def.name}' is missing. Please provide a value."
                
                value = parameters[param_def.name]
                # Check if value is empty
                if value is None or (isinstance(value, str) and value.strip() == "") or \
                   (isinstance(value, (list, dict)) and len(value) == 0):
                    return f"Required parameter '{param_def.name}' is missing or empty. Please provide a value."
        
        return None
    
    def validate_before_execution(self, inputs: Dict[str, Any], parameters: Dict[str, Any]) -> Optional[str]:
        """
        Comprehensive validation before execution.
        Validates in order: credentials, inputs, parameters.
        
        Args:
            inputs: Dictionary of input values
            parameters: Dictionary of parameter values
            
        Returns:
            Error message if validation fails, None if all validations pass
        """
        # First check credentials (pass parameters for dynamic credential checking)
        cred_error = self.validate_credentials(parameters)
        if cred_error:
            return cred_error
        
        # Then check required inputs
        input_error = self.validate_inputs(inputs)
        if input_error:
            return input_error
        
        # Finally check required parameters
        param_error = self.validate_parameters(parameters)
        if param_error:
            return param_error
        
        return None
    
    def get_schema(self) -> Dict[str, Any]:
        """Get the complete schema for this node"""
        return {
            "node_id": self.node_id,
            "name": self.__class__.__name__,
            "description": self.__doc__ or "",
            "category": self._define_category(),
            "inputs": [
                {
                    "name": inp.name,
                    "type": inp.type,
                    "description": inp.description,
                    "required": inp.required,
                    "default_value": inp.default_value
                }
                for inp in self.inputs
            ],
            "outputs": [
                {
                    "name": out.name,
                    "type": out.type,
                    "description": out.description
                }
                for out in self.outputs
            ],
            "parameters": [
                {
                    "name": param.name,
                    "type": param.type,
                    "description": param.description,
                    "required": param.required,
                    "default_value": param.default_value,
                    "options": param.options
                }
                for param in self.parameters
            ],
            "styling": {
                "icon": self.styling.icon,
                "background_color": self.styling.background_color,
                "border_color": self.styling.border_color,
                "text_color": self.styling.text_color,
                "custom_css": self.styling.custom_css,
                "subtitle": self.styling.subtitle,
                "icon_position": self.styling.icon_position,
                "shape": self.styling.shape,
                "width": self.styling.width,
                "height": self.styling.height,
                "html_template": self.styling.html_template,
                "css_classes": self.styling.css_classes,
                "inline_styles": self.styling.inline_styles,
                "hide_outputs": self.styling.hide_outputs
            },
            "ui_config": {
                "node_id": self.ui_config.node_id,
                "node_name": self.ui_config.node_name,
                "groups": [
                    {
                        "name": group.name,
                        "label": group.label,
                        "description": group.description,
                        "components": [
                            {
                                "type": comp.type,
                                "name": comp.name,
                                "label": comp.label,
                                "description": comp.description,
                                "required": comp.required,
                                "default_value": comp.default_value,
                                "placeholder": comp.placeholder,
                                "disabled": comp.disabled,
                                "visible": comp.visible,
                                "validation": comp.validation,
                                "styling": comp.styling,
                                # Component-specific fields
                                **({"rows": comp.rows} if hasattr(comp, 'rows') else {}),
                                **({"options": comp.options} if hasattr(comp, 'options') else {}),
                                **({"multiple": comp.multiple} if hasattr(comp, 'multiple') else {}),
                                **({"text": comp.text} if hasattr(comp, 'text') else {}),
                                **({"html": comp.html} if hasattr(comp, 'html') else {}),
                                **({"button_text": comp.button_text} if hasattr(comp, 'button_text') else {}),
                                **({"variant": comp.variant} if hasattr(comp, 'variant') else {}),
                                **({"checked_value": comp.checked_value} if hasattr(comp, 'checked_value') else {}),
                                **({"unchecked_value": comp.unchecked_value} if hasattr(comp, 'unchecked_value') else {}),
                            }
                            for comp in group.components
                        ],
                        "collapsible": group.collapsible,
                        "collapsed": group.collapsed,
                        "styling": group.styling
                    }
                    for group in (self.ui_config.groups or [])
                ],
                "global_styling": self.ui_config.global_styling,
                "layout": self.ui_config.layout,
                "columns": self.ui_config.columns,
                "dialog_config": {
                    "title": self.ui_config.dialog_config.title if self.ui_config.dialog_config else None,
                    "description": self.ui_config.dialog_config.description if self.ui_config.dialog_config else None,
                    "width": self.ui_config.dialog_config.width if self.ui_config.dialog_config else None,
                    "height": self.ui_config.dialog_config.height if self.ui_config.dialog_config else None,
                    "background_color": self.ui_config.dialog_config.background_color if self.ui_config.dialog_config else None,
                    "border_color": self.ui_config.dialog_config.border_color if self.ui_config.dialog_config else None,
                    "text_color": self.ui_config.dialog_config.text_color if self.ui_config.dialog_config else None,
                    "icon": self.ui_config.dialog_config.icon if self.ui_config.dialog_config else None,
                    "icon_color": self.ui_config.dialog_config.icon_color if self.ui_config.dialog_config else None,
                    "header_background": self.ui_config.dialog_config.header_background if self.ui_config.dialog_config else None,
                    "footer_background": self.ui_config.dialog_config.footer_background if self.ui_config.dialog_config else None,
                    "button_primary_color": self.ui_config.dialog_config.button_primary_color if self.ui_config.dialog_config else None,
                    "button_secondary_color": self.ui_config.dialog_config.button_secondary_color if self.ui_config.dialog_config else None,
                } if self.ui_config.dialog_config else None
            } if self.ui_config else None
        }
    
    def run(self, inputs: Dict[str, Any], parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main entry point for node execution with validation.
        Note: Pre-execution validation should be done before calling run().
        """
        return self.execute(inputs, parameters)
