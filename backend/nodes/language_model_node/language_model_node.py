"""
Language Model Node - Uses the language model tool to generate responses.
This node takes a query and generates AI responses using various language models.
"""

from typing import Dict, Any, List, Optional
import sys
import os

# Add the parent directory to the path to import base_node and ui_components
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Add the tools directory to the path
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'tools', 'language_model_tool'))

from base_node import BaseNode, NodeInput, NodeOutput, NodeParameter, NodeStyling
from ui_components import (
    NodeUIConfig, UIGroup, DialogConfig,
    create_select, create_textarea, create_number_input, create_slider,
    create_toggle, create_label, create_divider, UIOption
)

try:
    from language_model_tool import LanguageModelTool
except ImportError:
    LanguageModelTool = None


class LanguageModelNode(BaseNode):
    """
    Language Model Node - Generates AI responses using language models.
    
    This node takes a query and optional context, then uses a configured
    language model service to generate a response.
    """
    
    def _define_category(self) -> str:
        """Define category for LanguageModelNode"""
        return "AI/LLM"
    
    def _define_required_credentials(self, parameters: Optional[Dict[str, Any]] = None) -> List[str]:
        """
        Define required credentials for LanguageModelNode based on selected service.
        Returns the credentials needed for the selected service.
        
        Args:
            parameters: Node parameters containing 'service' selection
        """
        # If parameters provided, check which service is selected
        if parameters and "service" in parameters:
            service = parameters.get("service", "openai").lower()
            if service == "groq":
                return ["GROQ_API_KEY"]
            elif service == "ollama":
                return []  # Ollama doesn't require API key (local)
            else:
                return ["OPENAI_API_KEY"]  # Default to OpenAI
        
        # If no parameters, return default (OpenAI) for backward compatibility
        return ["OPENAI_API_KEY"]
    
    def _define_inputs(self) -> List[NodeInput]:
        """Define the input structure for LanguageModelNode"""
        return [
            NodeInput(
                name="query",
                type="string",
                description="The main text query to send to the language model",
                required=True
            ),
            NodeInput(
                name="context",
                type="string",
                description="Additional context from knowledge base or other sources",
                required=False
            )
        ]
    
    def _define_outputs(self) -> List[NodeOutput]:
        """Define the output structure for LanguageModelNode"""
        return [
            NodeOutput(
                name="response",
                type="string",
                description="The generated response from the language model"
            ),
           
        ]
    
    def _define_parameters(self) -> List[NodeParameter]:
        """Define the parameters for LanguageModelNode"""
        return [
            NodeParameter(
                name="service",
                type="string",
                description="Language model service to use",
                required=True,
                default_value="openai",
                options=["openai", "groq", "ollama"]
            ),
            NodeParameter(
                name="model",
                type="string",
                description="Specific model to use (leave empty for default)",
                required=False,
                default_value=""
            ),
            NodeParameter(
                name="system_prompt",
                type="string",
                description="System/base prompt to set AI behavior",
                required=False,
                default_value="You are a helpful AI assistant."
            ),
            NodeParameter(
                name="temperature",
                type="float",
                description="Creativity/randomness level (0.0 to 1.0)",
                required=False,
                default_value=0.7
            ),
            NodeParameter(
                name="max_tokens",
                type="integer",
                description="Maximum number of tokens in response",
                required=False,
                default_value=500
            ),
        ]
    
    def _define_styling(self) -> NodeStyling:
        """Define custom styling for LanguageModelNode"""
        return NodeStyling(
            html_template="""
            <div class="lm-node-container">
                <div class="lm-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
                </div>
                <div class="lm-content">
                    <div class="lm-title">AI Assistant</div>
                    <div class="lm-subtitle">GENERATES TEXT</div>
                </div>
            </div>
            """,
            custom_css="""
            .lm-node-container {
                display: flex;
                align-items: center;
                padding: 18px 22px;
                background: #1f1f1f;
                border: 1.5px solid #a78bfa;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                transition: all 0.2s ease;
                transform-origin: center center;
                width: 240px;
                height: 120px;
                position: relative;
            }
            .lm-node-container:hover {
                border-color: #c4b5fd;
                box-shadow: 0 4px 12px rgba(167, 139, 250, 0.2);
            }
            .lm-icon { margin-right: 12px; flex-shrink: 0; color: #a78bfa; display: flex; align-items: center; }
            .lm-icon svg { width: 20px; height: 20px; }
            .lm-content { flex: 1; display: flex; flex-direction: column; justify-content: center; }
            .lm-title { font-size: 13px; font-weight: 600; color: #ffffff; margin-bottom: 2px; line-height: 1.2; }
            .lm-subtitle { font-size: 11px; color: #a78bfa; opacity: 0.9; line-height: 1.2; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
            """,
            icon="<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-sparkles\"><path d=\"m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z\"/><path d=\"M5 3v4\"/><path d=\"M19 17v4\"/><path d=\"M3 5h4\"/><path d=\"M17 19h4\"/></svg>", subtitle="GENERATES TEXT", background_color="#1f1f1f", border_color="#a78bfa", text_color="#ffffff",
            shape="rounded", width=240, height=120, css_classes="", inline_styles='{}', icon_position=""
        )
    
    def _define_ui_config(self) -> NodeUIConfig:
        """Define the UI configuration for LanguageModelNode"""
        return NodeUIConfig(
            node_id=self.node_id,
            node_name="LanguageModelNode",
            groups=[
                UIGroup(
                    name="model_config",
                    label="AI Model Selection",
                    description="Choose which AI service and model to use for generating responses",
                    components=[
                        create_select(
                            name="service",
                            label="AI Service",
                            description="Select the AI service provider (OpenAI, Groq, or Ollama)",
                            required=True,
                            default_value="openai",
                            options=[
                                UIOption(value="openai", label="OpenAI"),
                                UIOption(value="groq", label="Groq"),
                                UIOption(value="ollama", label="Ollama")
                            ],
                            searchable=True
                        ),
                        create_select(
                            name="model",
                            label="Model",
                            description="Choose a specific model from the selected service. Models will load after you select a service.",
                            required=True,
                            default_value="",
                            options=[
                                UIOption(value="", label="Select a service first")
                            ],
                            searchable=True
                        )
                    ],
                    styling={
                        "background": "#2a2a2a",
                        "border_radius": "12px",
                    }
                ),
                UIGroup(
                    name="advanced_config",
                    label="AI Behavior",
                    description="Customize how the AI responds with custom instructions",
                    components=[
                        create_textarea(
                            name="system_prompt",
                            label="System Prompt",
                            description="Instructions for how the AI should behave (e.g., 'You are a helpful assistant' or 'Respond in a professional tone')",
                            required=False,
                            default_value="",
                            placeholder="Example: You are a helpful AI assistant that provides clear and concise answers.",
                            rows=3
                        )
                    ],
                    styling={
                        "background": "#2a2a2a",
                        "border_radius": "12px",
                    }
                ),
                UIGroup(
                    name="generation_config",
                    label="Response Settings",
                    description="Control how creative and long the AI responses will be",
                    components=[
                        create_slider(
                            name="temperature",
                            label="Creativity Level",
                            description="Controls randomness in responses. Lower values (0.0-0.5) = more focused and consistent. Higher values (0.6-1.0) = more creative and varied.",
                            required=False,
                            default_value=0.7,
                            min_value=0.0,
                            max_value=1.0,
                            step=0.1,
                            show_value=True
                        ),
                        create_number_input(
                            name="max_tokens",
                            label="Maximum Response Length",
                            description="Maximum number of tokens (words/characters) in the response (1-4000)",
                            required=False,
                            default_value=500,
                            min_value=1,
                            max_value=4000,
                            step=1,
                            placeholder="Enter max length (1-4000)"
                        )
                    ],
                    styling={
                        "background": "#2a2a2a",
                        "border_radius": "12px",
                    }
                )
            ],
            layout="vertical",
            global_styling={
                "font_family": "Inter, sans-serif",
                "color_scheme": "light"
            },
            dialog_config=DialogConfig(
                title="Configure LanguageModelNode",
                description="Language Model Node - Generates AI responses using language models. This node takes a query and optional context, then uses a configured language model service to generate a response.",
                background_color="#1f1f1f",
                border_color="#a78bfa",
                text_color="#ffffff",
                icon="""<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-brain-icon lucide-brain"><path d="M12 18V5"/><path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4"/><path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5"/><path d="M17.997 5.125a4 4 0 0 1 2.526 5.77"/><path d="M18 18a4 4 0 0 0 2-7.464"/><path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517"/><path d="M6 18a4 4 0 0 1-2-7.464"/><path d="M6.003 5.125a4 4 0 0 0-2.526 5.77"/></svg>""",
                icon_color="#a78bfa",
                header_background="#1f1f1f",
                footer_background="#1f1f1f",
                button_primary_color="#a78bfa",
                button_secondary_color="#374151"
            )
        )
    
    def execute(self, inputs: Dict[str, Any], parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the LanguageModelNode logic
        
        Args:
            inputs: Dictionary containing 'query'
            parameters: Dictionary containing service settings and system_prompt
            
        Returns:
            Dictionary containing 'response', 'metadata', and 'success'
        """
        # Check if language model tool is available
        if LanguageModelTool is None:
            return {
                "response": "",
                "metadata": {"error": "Language model tool not available"},
                "success": False
            }
        
        try:
            # Extract inputs
            query = inputs.get("query", "").strip()
            context = inputs.get("context", "").strip()
            
            # Combine query and context intelligently
            if context and query:
                # If both are provided, create a comprehensive prompt
                combined_query = f"""Based on the following context, please answer the user's question:

Context:
{context}

User Question: {query}

Please provide a helpful and accurate response based on the context provided."""
            elif context:
                # If only context is provided, use it as the query
                combined_query = context
            else:
                # If only query is provided, use it as is
                combined_query = query
            
            # Extract parameters
            service = parameters.get("service", "openai")
            model = parameters.get("model", "")
            system_prompt = parameters.get("system_prompt", "You are a helpful AI assistant.")
            temperature = parameters.get("temperature", 0.7)
            max_tokens = parameters.get("max_tokens", 500)
            
            # Initialize the language model tool
            lm_tool = LanguageModelTool()
            
            # Generate response
            result = lm_tool.generate_response(
                query=combined_query,
                service=service,
                model=model if model else None,
                system_prompt=system_prompt if system_prompt else None,
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            # Return results
            if result["success"]:
                return {
                    "response": result["response"],
                    "metadata": {
                        "success": True,
                        "service": result["metadata"]["service"],
                        "model": result["metadata"]["model"],
                        "query_length": len(query),
                        "context_length": len(context),
                        "combined_length": len(combined_query),
                        "input_combination": "query_and_context" if context and query else ("context_only" if context else "query_only"),
                        "response_length": result["metadata"]["response_length"]
                    },
                    "success": True
                }
            else:
                return {
                    "response": "",
                    "metadata": {"error": result.get("error", "Unknown error")},
                    "success": False
                }
                
        except Exception as e:
            return {
                "response": "",
                "metadata": {"error": str(e)},
                "success": False
            }