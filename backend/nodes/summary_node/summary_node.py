"""
Summary Node - Summarizes large content using chunking and tree-like combination. Handles content of any size by splitting it into manageable chunks, summarizing each chunk, and combining summaries hierarchically.
"""

from typing import Dict, Any, List, Optional
import sys
import os
import re
import math

# Add the parent directory to the path to import base_node
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from base_node import BaseNode, NodeInput, NodeOutput, NodeParameter, NodeStyling
from ui_components import (
    NodeUIConfig, UIGroup, DialogConfig,
    create_label, create_divider, create_select, create_slider,
    UIOption
)

# Add backend root to path to import language model services
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.append(BACKEND_DIR)

try:
    from language_model_services.openai_service.openai_service import OpenAIService
    from language_model_services.groq_service.groq_service import GroqService
    from language_model_services.ollama_service.ollama_service import OllamaService
except Exception:
    OpenAIService = None
    GroqService = None
    OllamaService = None


class SummaryNode(BaseNode):
    """
    Summary Node - Summarizes large content using chunking and tree-like combination. Handles content of any size by splitting it into manageable chunks, summarizing each chunk, and combining summaries hierarchically.
    """
    
    def _define_required_credentials(self, parameters: Optional[Dict[str, Any]] = None) -> List[str]:
        """
        Define required credentials for SummaryNode based on selected service.
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
    
    def _define_category(self) -> str:
        """Define category for SummaryNode"""
        return "Process"

    def _define_inputs(self) -> List[NodeInput]:
        return [
            NodeInput(
                name="content",
                type="string",
                description="The content to be summarized",
                required=True,
            )
        ]

    def _define_outputs(self) -> List[NodeOutput]:
        return [
            NodeOutput(
                name="summary",
                type="string",
                description="The final summarized content",
            ),
            NodeOutput(
                name="metadata",
                type="dict",
                description="Metadata about the summarization process including chunk count, levels, etc.",
            ),
        ]

    def _define_parameters(self) -> List[NodeParameter]:
        return [
            NodeParameter(
                name="service",
                type="string",
                description="AI service to use for summarization",
                required=True,
                default_value="openai",
            ),
            NodeParameter(
                name="model",
                type="string",
                description="Language model to use",
                required=True,
                default_value="gpt-3.5-turbo",
            ),
            NodeParameter(
                name="chunk_size",
                type="int",
                description="Maximum size of each chunk in characters",
                required=False,
                default_value=2000,
            ),
            NodeParameter(
                name="summarization_level",
                type="string",
                description="Level of summarization (small, medium, large)",
                required=False,
                default_value="medium",
            ),
            NodeParameter(
                name="max_chunks_per_level",
                type="int",
                description="Maximum number of chunks to combine at each level",
                required=False,
                default_value=5,
            ),
        ]

    def _define_styling(self) -> NodeStyling:
        """Define custom styling for SummaryNode"""
        return NodeStyling(
            html_template="""
            <div class="summary-node-container">
                <div class="summary-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
                </div>
                <div class="summary-content">
                    <div class="summary-title">Summarize</div>
                    <div class="summary-subtitle">SHORTEN TEXT</div>
                </div>
            </div>
            """,
            custom_css="""
            .summary-node-container {
                display: flex;
                align-items: center;
                padding: 16px 20px;
                background: #1f1f1f;
                border: 1.5px solid #6366f1;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                transition: all 0.2s ease;
                width: 220px;
                height: 100px;
                position: relative;
            }
            .summary-node-container:hover {
                border-color: #818cf8;
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
            }
            .summary-icon { margin-right: 12px; flex-shrink: 0; color: #6366f1; display: flex; align-items: center; }
            .summary-icon svg { width: 20px; height: 20px; }
            .summary-content { flex: 1; display: flex; flex-direction: column; justify-content: center; }
            .summary-title { font-size: 13px; font-weight: 600; color: #ffffff; margin-bottom: 2px; line-height: 1.2; }
            .summary-subtitle { font-size: 11px; color: #6366f1; opacity: 0.9; line-height: 1.2; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
            """,
            icon="<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-file-text\"><path d=\"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z\"/><path d=\"M14 2v4a2 2 0 0 0 2 2h4\"/><path d=\"M10 9H8\"/><path d=\"M16 13H8\"/><path d=\"M16 17H8\"/></svg>", subtitle="SHORTEN TEXT", background_color="#1f1f1f", border_color="#6366f1", text_color="#ffffff",
            shape="rounded", width=220, height=100, css_classes="", inline_styles='{}', icon_position=""
        )

    def _define_ui_config(self) -> NodeUIConfig:
        """Define the UI configuration for SummaryNode"""
        return NodeUIConfig(
            node_id=self.node_id,
            node_name="SummaryNode",
            groups=[
                UIGroup(
                    name="model_settings",
                    label="AI Model Selection",
                    description="Choose which AI service and model to use for generating summaries",
                    components=[
                        create_select(
                            name="service",
                            label="AI Service",
                            description="Select the AI service provider (OpenAI, Groq, or Ollama)",
                            options=[
                                UIOption(value="openai", label="OpenAI"),
                                UIOption(value="groq", label="Groq"),
                                UIOption(value="ollama", label="Ollama"),
                            ],
                            required=True,
                            default_value="openai"
                        ),
                        create_select(
                            name="model",
                            label="Model",
                            description="Choose a specific AI model. More powerful models produce better summaries but may be slower.",
                            options=[
                                UIOption(value="gpt-3.5-turbo", label="GPT-3.5 Turbo"),
                                UIOption(value="gpt-4o", label="GPT-4o"),
                                UIOption(value="gpt-4o-mini", label="GPT-4o Mini"),
                            ],
                            required=True,
                            default_value="gpt-3.5-turbo"
                        ),
                    ],
                    styling={
                        "background": "#2a2a2a",
                        "border_radius": "12px",
                    }
                ),
                UIGroup(
                    name="summarization_settings",
                    label="Summary Settings",
                    description="Configure how the text is processed and summarized",
                    components=[
                        create_select(
                            name="summarization_level",
                            label="Summary Detail Level",
                            description="Choose how much detail you want in the summary",
                            options=[
                                UIOption(value="small", label="Most Compressed"),
                                UIOption(value="medium", label="Balanced"),
                                UIOption(value="large", label="Most Detailed"),
                            ],
                            required=True,
                            default_value="medium"
                        ),
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
                title="Configure SummaryNode",
                description="Summary Node - Summarizes large content using chunking and tree-like combination.",
                background_color="#1f1f1f",
                border_color="#6366f1",
                text_color="#ffffff",
                icon="""<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layers2-icon lucide-layers-2"><path d="M13 13.74a2 2 0 0 1-2 0L2.5 8.87a1 1 0 0 1 0-1.74L11 2.26a2 2 0 0 1 2 0l8.5 4.87a1 1 0 0 1 0 1.74z"/><path d="m20 14.285 1.5.845a1 1 0 0 1 0 1.74L13 21.74a2 2 0 0 1-2 0l-8.5-4.87a1 1 0 0 1 0-1.74l1.5-.845"/></svg>""",
                icon_color="#6366f1",
                header_background="#1f1f1f",
                footer_background="#1f1f1f",
                button_primary_color="#6366f1",
                button_secondary_color="#374151"
            )
        )

    def _get_language_model_service(self, service: str):
        """Get the appropriate language model service"""
        if service == "openai" and OpenAIService:
            return OpenAIService()
        elif service == "groq" and GroqService:
            return GroqService()
        elif service == "ollama" and OllamaService:
            return OllamaService()
        else:
            raise ValueError(f"Unsupported service: {service}")

    def _get_summarization_prompt(self, level: str) -> str:
        """Get the appropriate prompt based on summarization level"""
        prompts = {
            "small": "Provide a brief summary of the following content. Focus on the main points only. Keep it concise and to the point.",
            "medium": "Provide a balanced summary of the following content. Include key points and important details while maintaining clarity.",
            "large": "Provide a detailed summary of the following content. Include comprehensive information while maintaining organization and readability."
        }
        return prompts.get(level, prompts["medium"])

    def _split_content_into_chunks(self, content: str, chunk_size: int) -> List[str]:
        """Split content into chunks of specified size"""
        if len(content) <= chunk_size:
            return [content]
        
        chunks = []
        # Try to split at sentence boundaries first
        sentences = re.split(r'(?<=[.!?])\s+', content)
        current_chunk = ""
        
        for sentence in sentences:
            if len(current_chunk) + len(sentence) <= chunk_size:
                current_chunk += sentence + " "
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = sentence + " "
        
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        return chunks

    def _summarize_chunk(self, chunk: str, service: str, model: str, level: str) -> str:
        """Summarize a single chunk using the language model"""
        try:
            lm_service = self._get_language_model_service(service)
            prompt = self._get_summarization_prompt(level)
            
            full_prompt = f"{prompt}\n\nContent:\n{chunk}"
            
            response = lm_service.generate(
                model_name=model,
                query=full_prompt,
                temperature=0.3,  # Lower temperature for more consistent summaries
                max_tokens=1000
            )
            
            return response.strip()
        except Exception as e:
            # Return error string that will be detected by error handling
            return f"ERROR: Error summarizing chunk: {str(e)}"

    def _combine_summaries(self, summaries: List[str], service: str, model: str, level: str) -> str:
        """Combine multiple summaries into a single summary"""
        if len(summaries) == 1:
            return summaries[0]
        
        combined_content = "\n\n".join([f"Summary {i+1}:\n{summary}" for i, summary in enumerate(summaries)])
        
        prompt = f"""Combine the following summaries into a single, coherent summary. 
        Maintain the key information from all summaries while creating a unified narrative.
        
        Summaries to combine:
        {combined_content}
        
        Provide a single, well-structured summary that captures the essence of all the individual summaries."""
        
        try:
            lm_service = self._get_language_model_service(service)
            response = lm_service.generate(
                model_name=model,
                query=prompt,
                temperature=0.3,
                max_tokens=1500
            )
            return response.strip()
        except Exception as e:
            # Return error string that will be detected by error handling
            return f"ERROR: Error combining summaries: {str(e)}"

    def _summarize_tree_structure(self, chunks: List[str], service: str, model: str, level: str, max_chunks_per_level: int) -> Dict[str, Any]:
        """Create a tree-like summarization structure"""
        if not chunks:
            return {
                "summary": "",
                "success": False,
                "metadata": {"error": "No content to summarize"}
            }
        
        if len(chunks) == 1:
            summary = self._summarize_chunk(chunks[0], service, model, level)
            # Check if summary contains an error
            if isinstance(summary, str) and summary.strip().startswith("ERROR:"):
                return {
                    "summary": "",
                    "success": False,
                    "metadata": {"error": summary.replace("ERROR:", "").strip()}
                }
            return {
                "summary": summary,
                "metadata": {
                    "chunk_count": 1,
                    "levels": 1,
                    "total_chunks_processed": 1
                }
            }
        
        current_level = chunks
        level_summaries = []
        total_chunks_processed = len(chunks)
        levels = 0
        
        while len(current_level) > 1:
            levels += 1
            level_summaries = []
            
            # Process chunks in groups
            for i in range(0, len(current_level), max_chunks_per_level):
                group = current_level[i:i + max_chunks_per_level]
                
                if len(group) == 1:
                    summary = self._summarize_chunk(group[0], service, model, level)
                else:
                    # First summarize each chunk in the group
                    chunk_summaries = [self._summarize_chunk(chunk, service, model, level) for chunk in group]
                    # Check for errors in chunk summaries
                    error_summaries = [s for s in chunk_summaries if isinstance(s, str) and s.strip().startswith("ERROR:")]
                    if error_summaries:
                        return {
                            "summary": "",
                            "success": False,
                            "metadata": {"error": error_summaries[0].replace("ERROR:", "").strip()}
                        }
                    # Then combine the summaries
                    summary = self._combine_summaries(chunk_summaries, service, model, level)
                
                # Check if summary contains an error
                if isinstance(summary, str) and summary.strip().startswith("ERROR:"):
                    return {
                        "summary": "",
                        "success": False,
                        "metadata": {"error": summary.replace("ERROR:", "").strip()}
                    }
                
                level_summaries.append(summary)
            
            current_level = level_summaries
        
        final_summary = current_level[0] if current_level else ""
        
        return {
            "summary": final_summary,
            "metadata": {
                "chunk_count": len(chunks),
                "levels": levels,
                "total_chunks_processed": total_chunks_processed,
                "final_summary_length": len(final_summary)
            }
        }

    def execute(self, inputs: Dict[str, Any], parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the SummaryNode logic
        """
        content = inputs.get("content", "").strip()
        
        if not content:
            return {
                "summary": "",
                "success": False,
                "metadata": {
                    "error": "No content provided for summarization",
                    "chunk_count": 0,
                    "levels": 0
                }
            }
        
        # Get parameters
        service = parameters.get("service", "openai")
        model = parameters.get("model", "gpt-3.5-turbo")
        chunk_size = parameters.get("chunk_size", 2000)
        level = parameters.get("summarization_level", "medium")
        max_chunks_per_level = parameters.get("max_chunks_per_level", 5)
        
        try:
            # Split content into chunks
            chunks = self._split_content_into_chunks(content, chunk_size)
            
            # Perform tree-like summarization
            result = self._summarize_tree_structure(chunks, service, model, level, max_chunks_per_level)
            
            return result
            
        except Exception as e:
            return {
                "summary": "",
                "success": False,
                "metadata": {
                    "error": f"Error during summarization: {str(e)}",
                    "chunk_count": 0,
                    "levels": 0
                }
            }
