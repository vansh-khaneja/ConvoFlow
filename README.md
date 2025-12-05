# Convo Flow

<div align="center">
  <img src="frontend/public/brand/logo_with_boundary.png" alt="Convo Flow Logo" width="200" height="200">
</div>

<div align="center">
  <h3>Build Custom Chatbots with Visual Workflows</h3>
</div>

<div align="center">
  <a href="#features">Features</a> • <a href="#quick-start">Quick Start</a> • <a href="#contributing">Contributing</a> • <a href="#support">Support</a>
</div>

---

## Overview

Convo Flow is a powerful, no-code platform that enables you to create sophisticated chatbots by visually designing workflows. Connect nodes, configure AI models, and deploy intelligent conversational agents without writing a single line of code.

Convo Flow provides an intuitive visual interface where you can drag and drop nodes to build complex chatbot workflows. Whether you need a simple Q&A bot, a document-based assistant, or a multi-step conversational agent, Convo Flow makes it easy to design, test, and deploy your chatbot.

## Features

### Visual Workflow Builder
- Drag-and-drop interface for building chatbot workflows
- Real-time workflow execution and testing
- Interactive chat preview to test your chatbot
- Visual node connections with execution flow visualization

### AI & Language Models
- Support for multiple LLM providers:
  - OpenAI (GPT models)
  - Groq (fast inference)
  - Ollama (local models)
- Configurable model parameters (temperature, max tokens, system prompts)
- Custom API node for integrating any language model

### Knowledge Base Integration
- Document loader nodes for PDF, DOCX, and text files
- Vector store integration with Qdrant
- Semantic search and retrieval
- RAG (Retrieval-Augmented Generation) support

### Powerful Node Types
- **Input/Output Nodes**: Query, Text Input, Response
- **AI Nodes**: Language Model, Intent Classification, Summary
- **Processing Nodes**: Text Transform, Regex Extractor, Conditional Logic
- **Integration Nodes**: Web Search, Email, Custom API, Notifications
- **Utility Nodes**: Merge, Debug, Document Loader

### Deployment & Management
- Save and manage multiple workflows
- Workflow templates for quick starts
- Deployment tracking and logs
- Export/import workflows

### Additional Capabilities
- Web search integration (Tavily)
- Email notifications (Resend)
- Multi-step conversation flows
- Conditional branching logic
- Document processing and analysis

## Tech Stack

### Frontend
- **Next.js 16** - React framework
- **React Flow** - Visual workflow builder
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **TanStack Query** - Data fetching

### Backend
- **FastAPI** - Python web framework
- **PostgreSQL** - Database
- **Qdrant** - Vector database
- **Python** - Backend language

## Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.9+
- PostgreSQL (or use Docker)
- Docker and Docker Compose (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd convoflow
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Configuration**
   
   Create a `.env` file in the `backend` directory:
   ```env
   # Database
   POSTGRES_DB_URL=postgresql://user:password@localhost:5432/convoflow
   
   # API Keys (add your keys)
   OPENAI_API_KEY=your_openai_key
   GROQ_API_KEY=your_groq_key
   TAVILY_API_KEY=your_tavily_key
   QDRANT_API_KEY=your_qdrant_key
   QDRANT_URL=your_qdrant_url
   RESEND_API_KEY=your_resend_key
   
   # CORS
   CORS_ORIGINS=http://localhost:3000
   ```

   Create a `.env.local` file in the `frontend` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

5. **Run with Docker (Recommended)**
   ```bash
   docker-compose up
   ```

   Or run separately:

   **Backend:**
   ```bash
   cd backend
   uvicorn main:app --reload --port 8000
   ```

   **Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## Project Structure

```
convoflow/
├── backend/              # FastAPI backend
│   ├── api/             # API endpoints
│   ├── nodes/           # Node implementations
│   ├── templates/       # Workflow templates
│   ├── tools/           # Tool implementations
│   └── main.py          # FastAPI application
├── frontend/            # Next.js frontend
│   ├── app/             # Next.js app router
│   ├── components/      # React components
│   ├── hooks/           # Custom React hooks
│   └── api/             # API client
└── docker-compose.yml   # Docker configuration
```

## Usage

1. **Create a New Workflow**
   - Click "New Workflow" from the home page
   - Start with a template or build from scratch

2. **Add Nodes**
   - Click the "+" button to open the node selection sidebar
   - Choose from available node types
   - Drag nodes onto the canvas

3. **Configure Nodes**
   - Click on a node to open its configuration panel
   - Set parameters, API keys, and node-specific settings
   - Connect nodes by dragging from output to input handles

4. **Test Your Workflow**
   - Click the "Run" button to execute the workflow
   - Use the chat preview to interact with your chatbot
   - View execution logs and debug issues

5. **Save and Deploy**
   - Save your workflow with a name
   - Deploy to make it accessible via API
   - Monitor deployments and logs

## Contributing

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

For questions, issues, or feature requests:
- Open an issue on GitHub
- Check the documentation
- Review existing workflows and templates

## License

[Add your license here]
