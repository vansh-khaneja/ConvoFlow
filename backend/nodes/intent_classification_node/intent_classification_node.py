"""
Intent Classification Node - Classifies user queries into predefined intent categories using AI. Supports up to 5 intent classes with configurable labels and instructions. Returns the predicted intent, confidence score, and reasoning.
"""

from typing import Dict, Any, List, Optional
import sys
import os
import json

# Add the parent directory to the path to import base_node and ui_components
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Add the tools directory to the path
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'tools', 'language_model_tool'))

from base_node import BaseNode, NodeInput, NodeOutput, NodeParameter, NodeStyling
from ui_components import (
    NodeUIConfig, UIGroup, DialogConfig,
    create_select, create_textarea, create_slider, create_number_input,
    UIOption
)

try:
    from language_model_tool import LanguageModelTool
except ImportError:
    LanguageModelTool = None


class IntentClassificationNode(BaseNode):
    """
    Intent Classification Node - Classifies user queries into predefined intent categories using AI. Supports up to 5 intent classes with configurable labels and instructions. Returns the predicted intent, confidence score, and reasoning.
    """
    
    def _define_required_credentials(self, parameters: Optional[Dict[str, Any]] = None) -> List[str]:
        """
        Define required credentials for IntentClassificationNode based on selected service.
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
        """Define category for IntentClassificationNode"""
        return "Logic"

    def _define_inputs(self) -> List[NodeInput]:
        return [
            NodeInput(
                name="query",
                type="string",
                description="User query to classify",
                required=True,
            ),
        ]

    def _define_outputs(self) -> List[NodeOutput]:
        return [
            NodeOutput(name="intent", type="string", description="Predicted intent label"),
            NodeOutput(name="confidence", type="number", description="Confidence score [0,1]"),
            NodeOutput(name="reason", type="string", description="Brief rationale for the decision"),
        ]

    def _define_parameters(self) -> List[NodeParameter]:
        return [
            # Class slots (up to 5)
            NodeParameter(name="class_1_label", type="string", description="Class 1 label", required=False, default_value=""),
            NodeParameter(name="class_1_instruction", type="string", description="Class 1 description", required=False, default_value=""),
            NodeParameter(name="class_2_label", type="string", description="Class 2 label", required=False, default_value=""),
            NodeParameter(name="class_2_instruction", type="string", description="Class 2 description", required=False, default_value=""),
            NodeParameter(name="class_3_label", type="string", description="Class 3 label", required=False, default_value=""),
            NodeParameter(name="class_3_instruction", type="string", description="Class 3 description", required=False, default_value=""),
            NodeParameter(name="class_4_label", type="string", description="Class 4 label", required=False, default_value=""),
            NodeParameter(name="class_4_instruction", type="string", description="Class 4 description", required=False, default_value=""),
            NodeParameter(name="class_5_label", type="string", description="Class 5 label", required=False, default_value=""),
            NodeParameter(name="class_5_instruction", type="string", description="Class 5 description", required=False, default_value=""),
            # Model config (de-emphasized; bottom)
            NodeParameter(name="service", type="string", description="Language model service", required=False, default_value="openai", options=["openai", "groq", "ollama"]),
            NodeParameter(name="model", type="string", description="Model name (optional)", required=False, default_value=""),
        ]

    def _define_styling(self) -> NodeStyling:
        return NodeStyling(
            html_template="""
            <div class="intent-node">
                <div class="intent-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-tags"><path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4l-6.8 6.8a2.4 2.4 0 0 1-3.4 0L2.7 12a2.41 2.41 0 0 1 0-3.4l6.8-6.8a2.4 2.4 0 0 1 3.4 0Z"/><circle cx="8.5" cy="8.5" r=".5" fill="currentColor"/></svg>
                </div>
                <div class="intent-content">
                    <div class="intent-title">Classify Intent</div>
                    <div class="intent-sub">CATEGORIZE</div>
                </div>
            </div>
            """,
            custom_css="""
            .intent-node { display: flex; align-items: center; padding: 16px 20px; background:#1f1f1f; border:1.5px solid #f59e0b; border-radius:12px; width:220px; height:100px; }
            .intent-icon { margin-right: 12px; flex-shrink: 0; color: #f59e0b; display: flex; align-items: center; }
            .intent-icon svg { width: 20px; height: 20px; }
            .intent-content { flex: 1; display: flex; flex-direction: column; justify-content: center; }
            .intent-title { color:#fff; font-size:13px; font-weight:600; margin-bottom:2px; line-height:1.2; }
            .intent-sub { color:#f59e0b; font-size:11px; opacity:0.9; line-height:1.2; font-weight:700; letter-spacing:0.5px; text-transform:uppercase; }
            """,
            icon="<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-tags\"><path d=\"m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4l-6.8 6.8a2.4 2.4 0 0 1-3.4 0L2.7 12a2.41 2.41 0 0 1 0-3.4l6.8-6.8a2.4 2.4 0 0 1 3.4 0Z\"/><circle cx=\"8.5\" cy=\"8.5\" r=\".5\" fill=\"currentColor\"/></svg>",
            subtitle="CATEGORIZE",
            background_color="#1f1f1f",
            border_color="#f59e0b",
            text_color="#ffffff",
            shape="rounded",
            width=220,
            height=100,
            css_classes="",
            inline_styles='{}',
            icon_position="",
        )

    def _define_ui_config(self) -> NodeUIConfig:
        try:
            # Build fixed five class components; user may fill any subset
            class_components: List[Any] = []
            for i in range(1, 6):
                class_components.append(
                    create_textarea(
                        name=f"class_{i}_label",
                        label=f"Class {i} Label",
                        required=False,
                        default_value="",
                        rows=1,
                    )
                )
                class_components.append(
                    create_textarea(
                        name=f"class_{i}_instruction",
                        label=f"Class {i} Description",
                        required=False,
                        default_value="",
                        rows=2,
                    )
                )

            return NodeUIConfig(
                node_id=self.node_id,
                node_name="IntentClassificationNode",
                groups=[
                    UIGroup(
                        name="classes_config",
                        label="Classes",
                        components=class_components,
                        styling={"background": "#2a2a2a", "border_radius": "12px"},
                    ),
                    UIGroup(
                        name="model_config",
                        label="AI Model (Optional)",
                        description="Optionally use an AI model for more accurate classification. Leave empty to use rule-based classification.",
                        components=[
                            create_select(
                                name="service",
                                label="AI Service",
                                description="Select an AI service provider (optional)",
                                required=False,
                                default_value="openai",
                                options=[
                                    UIOption(value="openai", label="OpenAI"),
                                    UIOption(value="groq", label="Groq"),
                                    UIOption(value="ollama", label="Ollama"),
                                ],
                                searchable=True,
                            ),
                            create_select(
                                name="model",
                                label="Model",
                                description="Choose a specific model from the selected service (optional)",
                                required=False,
                                default_value="",
                                options=[UIOption(value="", label="Optional: select a service first")],
                                searchable=True,
                            ),
                        ],
                        styling={"background": "#2a2a2a", "border_radius": "12px"},
                    ),
                ],
                layout="vertical",
                global_styling={"font_family": "Inter, sans-serif", "color_scheme": "light"},
                dialog_config=DialogConfig(
                    title="Configure IntentClassificationNode",
                    description="Provide class labels/instructions and choose an LLM (optional).",
                    background_color="#1f1f1f",
                    border_color="#f59e0b",
                    text_color="#ffffff",
                    icon="""<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-waypoints-icon lucide-waypoints"><circle cx="12" cy="4.5" r="2.5"/><path d="m10.2 6.3-3.9 3.9"/><circle cx="4.5" cy="12" r="2.5"/><path d="M7 12h10"/><circle cx="19.5" cy="12" r="2.5"/><path d="m13.8 17.7 3.9-3.9"/><circle cx="12" cy="19.5" r="2.5"/></svg>""",
                    icon_color="#f59e0b",
                    header_background="#1f1f1f",
                    footer_background="#1f1f1f",
                    button_primary_color="#f59e0b",
                    button_secondary_color="#374151",
                ),
            )
        except Exception as e:
            # Fail-safe minimal UI if any rendering error occurs
            print(f"[WARN] IntentClassificationNode UI build failed: {e}")
            return NodeUIConfig(
                node_id=self.node_id,
                node_name="IntentClassificationNode",
                groups=[
                    UIGroup(
                        name="fallback",
                        label="Intent Classifier",
                        components=[
                            create_textarea(name="class_1_label", label="Class 1 Label", required=False, default_value="", rows=1),
                            create_textarea(name="class_1_instruction", label="Class 1 Description", required=False, default_value="", rows=2),
                        ],
                    )
                ],
            )

    def execute(self, inputs: Dict[str, Any], parameters: Dict[str, Any]) -> Dict[str, Any]:
        # Tool availability
        if LanguageModelTool is None:
            return {
                "intent": "",
                "confidence": 0.0,
                "reason": "LanguageModelTool not available",
                "success": False,
                "metadata": {
                    "error": "LanguageModelTool not available"
                }
            }

        query = str(inputs.get("query", "")).strip()

        # Collect class definitions from parameter slots (1..5)
        classes: List[Dict[str, str]] = []
        for i in range(1, 6):
            label_key = f"class_{i}_label"
            instr_key = f"class_{i}_instruction"
            label = str(parameters.get(label_key, "")).strip()
            instruction = str(parameters.get(instr_key, "")).strip()
            if label:
                classes.append({"label": label, "instruction": instruction})
        if not classes:
            classes = [{"label": "other", "instruction": "General / fallback"}]

        # Build instruction list
        class_lines = []
        labels = []
        for item in classes:
            label = str(item.get("label", "")).strip() or "other"
            instruction = str(item.get("instruction", "")).strip() or ""
            labels.append(label)
            class_lines.append(f"- {label}: {instruction}")

        labels_csv = ", ".join(labels)
        guide = "\n".join(class_lines)

        system_prompt = (
            "You are an intent classifier. Choose exactly one label from the allowed list. "
            "Respond ONLY as compact JSON with keys: intent (string, one of allowed labels), "
            "confidence (float 0..1), reason (string)."
        )

        user_prompt = f"""
Allowed labels: {labels_csv}

Guidelines:
{guide}

Query:
{query}

Return JSON only, e.g. {{"intent":"food","confidence":0.92,"reason":"mentions dishes"}}
"""

        service = parameters.get("service", "openai")
        model = parameters.get("model", "")
        temperature = 0.0  # Fixed for classification
        max_tokens = 256  # Fixed for classification

        tool = LanguageModelTool()
        result = tool.generate_response(
            query=user_prompt,
            service=service,
            model=model if model else None,
            system_prompt=system_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
        )

        # Check if LLM call failed
        if not result or not result.get("success"):
            error_msg = result.get("error", "Unknown error") if result else "Language model call failed"
            return {
                "intent": "",
                "confidence": 0.0,
                "reason": error_msg,
                "success": False,
                "metadata": {
                    "error": error_msg
                }
            }

        intent = ""
        confidence = 0.0
        reason = ""

        if isinstance(result.get("response"), str):
            text = result["response"].strip()
            # Try to extract JSON
            try:
                start = text.find("{")
                end = text.rfind("}")
                if start != -1 and end != -1 and end > start:
                    payload = json.loads(text[start : end + 1])
                else:
                    payload = json.loads(text)
            except Exception:
                payload = {"intent": text[:64]}

            intent = str(payload.get("intent", "")).strip() or ""
            try:
                confidence = float(payload.get("confidence", 0.0))
            except Exception:
                confidence = 0.0
            reason = str(payload.get("reason", "")).strip()

            # Clamp and validate
            if intent not in labels and labels:
                intent = labels[0]
            confidence = max(0.0, min(1.0, confidence))

        return {"intent": intent, "confidence": confidence, "reason": reason}


