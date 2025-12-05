"""
Knowledge Base Retrieval Node

This node retrieves relevant documents from a knowledge base using semantic search.
It takes a query as input and returns the best matched results with context.
"""

import sys
import os
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the parent directory to the path to import services
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from nodes.base_node import BaseNode, NodeStyling, NodeInput, NodeOutput, NodeParameter
from tools.knowledge_base_retriever_tool.knowledge_base_retriever_tool import KnowledgeBaseRetrieverTool
from ui_components import (
    NodeUIConfig, UIGroup, DialogConfig,
    create_select, create_number_input, create_slider, UIOption
)


class KnowledgeBaseRetrievalNode(BaseNode):
    """
    Node for retrieving relevant documents from a knowledge base.
    
    This node uses semantic search to find the most relevant documents
    based on the input query and returns them with context.
    """
    
    def _define_category(self) -> str:
        """Define category for KnowledgeBaseRetrievalNode"""
        return "Search"
    
    def _define_required_credentials(self, parameters: Optional[Dict[str, Any]] = None) -> List[str]:
        """
        Define required credentials for KnowledgeBaseRetrievalNode.
        Requires OpenAI API key for embeddings, Qdrant URL and API key for vector storage.
        """
        return ["OPENAI_API_KEY", "QDRANT_URL", "QDRANT_API_KEY"]  # Required: OpenAI for embeddings, Qdrant URL and API key for vector storage
    
    def __init__(self):
        super().__init__()
        self.retriever = None
        # Don't initialize retriever here - do it lazily in execute() after credentials are validated
    
    def _define_inputs(self) -> List[NodeInput]:
        """Define the input schema for this node"""
        return [
            NodeInput(
                name="query",
                type="string",
                description="The search query to find relevant documents",
                required=True
            )
        ]
    
    def _define_outputs(self) -> List[NodeOutput]:
        """Define the output schema for this node"""
        return [
            NodeOutput(
                name="response",
                type="string",
                description="The best matching document content"
            ),
            NodeOutput(
                name="metadata",
                type="object",
                description="Metadata about the search results and best match"
            )
        ]
    
    def _define_parameters(self) -> List[NodeParameter]:
        """Define the parameters for this node"""
        return [
            NodeParameter(
                name="collection_name",
                type="string",
                description="Name of the knowledge base collection to search",
                required=False,
                default_value="medusa-docs"
            ),
            NodeParameter(
                name="limit",
                type="integer",
                description="Maximum number of results to return",
                required=False,
                default_value=5
            ),
            NodeParameter(
                name="score_threshold",
                type="float",
                description="Minimum similarity score threshold (0.0 to 1.0)",
                required=False,
                default_value=0.3
            )
        ]
    
    def _define_styling(self) -> NodeStyling:
        """Define the visual styling for this node"""
        return NodeStyling(
            html_template="""
            <div class="kb-node-container">
                <div class="kb-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-database"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg>
                </div>
                <div class="kb-content">
                    <div class="kb-title">Knowledge Base</div>
                    <div class="kb-subtitle">FIND DOCUMENTS</div>
                </div>
            </div>
            """,
            custom_css="""
            .kb-node-container {
                display: flex;
                align-items: center;
                padding: 16px 20px;
                background: #1f1f1f;
                border: 1.5px solid #3b82f6;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                transition: all 0.2s ease;
                width: 220px;
                height: 100px;
                position: relative;
            }
            .kb-node-container:hover {
                border-color: #60a5fa;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
            }
            .kb-icon { margin-right: 12px; flex-shrink: 0; color: #3b82f6; display: flex; align-items: center; }
            .kb-icon svg { width: 20px; height: 20px; }
            .kb-content { flex: 1; display: flex; flex-direction: column; justify-content: center; }
            .kb-title { font-size: 13px; font-weight: 600; color: #ffffff; margin-bottom: 2px; line-height: 1.2; }
            .kb-subtitle { font-size: 11px; color: #3b82f6; opacity: 0.9; line-height: 1.2; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
            """,
            icon="<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-database\"><ellipse cx=\"12\" cy=\"5\" rx=\"9\" ry=\"3\"/><path d=\"M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5\"/><path d=\"M3 12c0 1.66 4 3 9 3s9-1.34 9-3\"/></svg>", subtitle="FIND DOCUMENTS", background_color="#1f1f1f", border_color="#3b82f6", text_color="#ffffff",
            shape="rounded", width=220, height=100, css_classes="", inline_styles='{}', icon_position=""
        )

    def _define_ui_config(self) -> NodeUIConfig:
        """Define the UI configuration for KnowledgeBaseRetrievalNode"""
        return NodeUIConfig(
            node_id=self.node_id,
            node_name="KnowledgeBaseRetrievalNode",
            groups=[
                UIGroup(
                    name="collection_config",
                    label="Knowledge Base Collection",
                    description="Select which knowledge base collection to search for relevant documents",
                    components=[
                        create_select(
                            name="collection_name",
                            label="Collection",
                            description="Choose the knowledge base collection containing your documents",
                            required=False,
                            default_value="medusa-docs",
                            options=[
                                UIOption(value="medusa-docs", label="Loading collections...")
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
                    name="search_config",
                    label="Search Settings",
                    description="Configure how many results to return and the minimum similarity score",
                    components=[
                        create_number_input(
                            name="limit",
                            label="Number of Results",
                            description="Maximum number of documents to retrieve (1-50)",
                            required=False,
                            default_value=5,
                            min_value=1,
                            max_value=50,
                            step=1,
                            placeholder="Enter number of results (1-50)"
                        ),
                        create_slider(
                            name="score_threshold",
                            label="Similarity Threshold",
                            description="Minimum similarity score for results (0.0 = less strict, 1.0 = very strict). Lower values return more results but may be less relevant.",
                            required=False,
                            default_value=0.3,
                            min_value=0.0,
                            max_value=1.0,
                            step=0.1,
                            show_value=True
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
                "color_scheme": "dark"
            },
            dialog_config=DialogConfig(
                title="Configure Knowledge Base",
                description="Knowledge Base Retrieval Node - Retrieves relevant documents from a knowledge base using semantic search. Configure which collection to search and the search parameters.",
                background_color="#1f1f1f",
                border_color="#3b82f6",
                text_color="#ffffff",
                icon="""<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <ellipse cx="12" cy="5" rx="9" ry="3" stroke="#3b82f6" stroke-width="2" fill="none"/>
                    <path d="M3 5V19A9 3 0 0 0 21 19V5" stroke="#3b82f6" stroke-width="2" fill="none"/>
                    <path d="M3 12A9 3 0 0 0 21 12" stroke="#3b82f6" stroke-width="2" fill="none"/>
                </svg>""",
                icon_color="#3b82f6",
                header_background="#1f1f1f",
                footer_background="#1f1f1f",
                button_primary_color="#3b82f6",
                button_secondary_color="#374151"
            )
        )
    
    def execute(self, inputs: Dict[str, Any], parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the knowledge base retrieval.
        
        Args:
            inputs: Dictionary containing 'query'
            parameters: Dictionary containing collection_name, limit, score_threshold
            
        Returns:
            Dictionary containing 'response' and 'metadata'
        """
        try:
            # Extract inputs and parameters
            query = inputs.get("query", "").strip()
            collection_name = parameters.get("collection_name", "medusa-docs")
            limit = parameters.get("limit", 5)
            score_threshold = parameters.get("score_threshold", 0.5)
            
            # Validate query
            if not query:
                return {
                    "response": "",
                    "metadata": {
                        "success": False,
                        "error": "Query cannot be empty",
                        "best_match": None,
                        "total_results": 0
                    }
                }
            
            # Validate parameters
            if not isinstance(limit, int) or limit < 1 or limit > 50:
                limit = 5
            
            if not isinstance(score_threshold, (int, float)) or score_threshold < 0.0 or score_threshold > 1.0:
                score_threshold = 0.3
            
            # Initialize retriever lazily (only when execute is called, after credentials are validated)
            try:
                if collection_name == "medusa-docs" and self.retriever:
                    # Use cached retriever for default collection
                    retriever = self.retriever
                else:
                    # Initialize retriever if not already done, or create new one for specific collection
                    if not self.retriever and collection_name == "medusa-docs":
                        # Lazy initialization for default collection
                        self.retriever = KnowledgeBaseRetrieverTool("medusa-docs")
                        retriever = self.retriever
                    else:
                        # Create new retriever for specific collection
                        retriever = KnowledgeBaseRetrieverTool(collection_name)
            except Exception as e:
                return {
                    "response": "",
                    "metadata": {
                        "success": False,
                        "error": f"Failed to initialize retriever for collection '{collection_name}': {str(e)}",
                        "best_match": None,
                        "total_results": 0
                    }
                }
            
            # Perform search
            search_result = retriever.search_documents(
                query=query,
                limit=limit,
                score_threshold=score_threshold
            )
            
            if not search_result["success"]:
                return {
                    "response": "",
                    "metadata": {
                        "success": False,
                        "error": f"Search failed: {search_result['error']}",
                        "best_match": None,
                        "total_results": 0
                    }
                }
            
            # Get the best match (first result)
            best_match = None
            response = ""
            
            if search_result["results"]:
                best_match = search_result["results"][0]
                # Use content if available, otherwise use title or a summary
                response = best_match.get("content") or best_match.get("title") or f"Document ID: {best_match.get('document_id', 'Unknown')}"
            
            # Prepare metadata
            metadata = {
                "success": True,
                "error": "",
                "query": query,
                "collection_name": collection_name,
                "total_results": search_result["results_count"],
                "best_match": {
                    "title": best_match["title"] if best_match else None,
                    "source": best_match["source"] if best_match else None,
                    "score": best_match["score"] if best_match else None,
                    "document_id": best_match["document_id"] if best_match else None
                } if best_match else None,
                "all_results": [
                    {
                        "title": doc["title"],
                        "source": doc["source"],
                        "score": doc["score"],
                        "document_id": doc["document_id"]
                    } for doc in search_result["results"]
                ],
                "search_parameters": {
                    "limit": limit,
                    "score_threshold": score_threshold
                }
            }
            
            return {
                "response": response,
                "metadata": metadata
            }
            
        except Exception as e:
            return {
                "response": "",
                "metadata": {
                    "success": False,
                    "error": f"Unexpected error during knowledge retrieval: {str(e)}",
                    "best_match": None,
                    "total_results": 0
                }
            }
    
