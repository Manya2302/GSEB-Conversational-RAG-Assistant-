from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import logger
from app.api.upload import router as upload_router
from app.api.retrieval import router as retrieval_router

app = FastAPI(
    title="Conversational RAG API",
    description="API for the Conversational RAG Application",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(retrieval_router)


@app.get("/")
def read_root():
    logger.info("Health check endpoint called")
    return {"status": "ok", "message": "Welcome to the Conversational RAG API"}
