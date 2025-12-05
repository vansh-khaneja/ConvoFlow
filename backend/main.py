
import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Ensure backend package is registered for relative imports when running as script
if __package__ is None:  # Direct execution (e.g., uvicorn main:app)
    import os
    import sys

    sys.path.append(os.path.dirname(__file__))

from api.v1.nodes import router as nodes_router
from api.v1.credentials import router as credentials_router
from api.v1.workflows import router as workflows_router, init_db as init_workflows_db
from api.v1.vector_store import router as vector_store_router
from api.v1.deployments import router as deployments_router, init_db as init_deployments_db
from api.v1.templates import router as templates_router
from api.v1.files import router as files_router

# Load environment variables
load_dotenv()

# Register all nodes on startup
try:
    from register_nodes import register_all_nodes
    register_all_nodes()
except ImportError as e:
    print(f"Warning: Could not register nodes: {e}")

# Create performance indexes on startup
try:
    from db_migrations import create_performance_indexes
    create_performance_indexes()
except Exception as e:
    print(f"Warning: Could not create indexes: {e}")

# Create FastAPI app for development
app = FastAPI(
    title="BotCanvas API - Development",
    description="Development server for no-code chatbot builder API",
    version="dev",
    docs_url="/docs",
    redoc_url="/redoc"
)

@app.on_event("startup")
async def startup_event():
    """Initialize database tables on application startup."""
    print("[DB] Initializing database tables...")
    try:
        init_workflows_db()
        init_deployments_db()
        print("[DB] Database initialization complete.")
    except Exception as e:
        print(f"[DB] Warning: Database initialization failed: {e}")
        print("[DB] The application will continue, but database operations may fail.")

    # Run file cleanup on startup
    print("[FILES] Running file cleanup...")
    try:
        from api.v1.files import cleanup_old_files
        result = cleanup_old_files()
        if result.get("success"):
            print(f"[FILES] {result.get('message')}")
        else:
            print(f"[FILES] Cleanup warning: {result.get('error')}")
    except Exception as e:
        print(f"[FILES] Warning: File cleanup failed: {e}")

# Add CORS middleware - configurable via environment variable
# Default to allow all origins for development, restrict in production
cors_origins = os.getenv("CORS_ORIGINS", "*").split(",") if os.getenv("CORS_ORIGINS") != "*" else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(nodes_router, prefix="/api/v1")
app.include_router(credentials_router, prefix="/api/v1")
app.include_router(workflows_router, prefix="/api/v1")
app.include_router(vector_store_router)
app.include_router(deployments_router, prefix="/api/v1")
app.include_router(templates_router, prefix="/api/v1")
app.include_router(files_router, prefix="/api/v1")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Convoflow API - Development Server",
        "version": "dev",
        "docs": "/docs",
        "endpoints": {
            "nodes": "/api/v1/nodes",
            "credentials": "/api/v1/credentials",
            "workflows": "/api/v1/workflows",
            "vector-store": "/api/v1/vector-store",
            "deployments": "/api/v1/deployments",
            "templates": "/api/v1/templates",
            "files": "/api/v1/files"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "BotCanvas API - Development"}

if __name__ == "__main__":
    print("[START] Starting BotCanvas Development Server...")
    print("[DOCS] API Documentation: http://localhost:8000/docs")
    print("[WEB] API Base URL: http://localhost:8000")
    print("=" * 50)
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload on code changes
        log_level="info"
    )
