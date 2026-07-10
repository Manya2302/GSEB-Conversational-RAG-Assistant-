# Conversational RAG Application

## Overview
This is a Conversational Retrieval-Augmented Generation (RAG) application. It allows users to upload textbooks, process them, and ask questions through a chat interface. The system retrieves relevant chunks of context from the books and generates accurate answers citing sources.

## Tech Stack
- **Backend:** FastAPI, Python 3.12
- **Frontend:** React, Vite, Tailwind CSS
- **Vector Database:** Qdrant
- **LLM:** Gemini / OpenAI
- **Embeddings:** bge-small-en-v1.5 / nomic-embed-text

## Architecture
- Phase 1: Project Initialization & Architecture
- Phase 2: PDF Processing Pipeline
- Phase 3: Embedding & Vector Database
- Phase 4: Retrieval Pipeline
- Phase 5: Answer Generation
- Phase 6: Conversational Memory
- Phase 7: Chat UI
- Phase 8: Advanced Retrieval
- Phase 9: Performance & Deployment
- Phase 10: Testing & Documentation

## Setup Instructions

### Backend
1. Go to `backend` folder
2. Create virtual environment: `python -m venv venv`
3. Activate venv
4. Install requirements: `pip install -r requirements.txt`
5. Run server: `uvicorn app.main:app --reload`

### Frontend
1. Go to `frontend` folder
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev`
