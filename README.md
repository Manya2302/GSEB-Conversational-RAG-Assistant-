# Conversational RAG Application 📚

An enterprise-grade, Multi-Agent Conversational Retrieval-Augmented Generation (RAG) system built to parse textbooks, securely index them, and generate highly accurate, cited answers to user questions.

## 🌟 Key Features
- **Intelligent Multimodal Processing**: Automatically cleans and splits PDFs into chunks. Uses PyMuPDF for text, and a dual-pipeline of **EasyOCR (Gujarati/Hindi/English)** + **Groq Vision** for diagram understanding.
- **Advanced Hybrid Retrieval**: Utilizes Qdrant dense vector search, LLM-based query routing for metadata filtering, and Cross-Encoder Re-ranking to guarantee high-precision context retrieval.
- **Conversational Memory**: Remembers past user queries and rewrites follow-up questions for contextual accuracy.
- **Premium UI/UX**: Built with React and Tailwind CSS, featuring native Speech-to-Text Voice Input, Chat Exports, real-time latency tracking, and inline interactive citations.
- **Interactive Source Verification**: Clicking a citation opens a modal highlighting the exact context snippet alongside an interactive PDF Viewer snapped to the exact source page.
- **Extreme Performance**: Features sub-10s latency via Groq LPUs, async multimodal processing, and embedding LRU caching.

## 🛠 Tech Stack
- **Backend:** FastAPI, Python 3.12, EasyOCR, OpenCV
- **Frontend:** React, Vite, Tailwind CSS (v4)
- **Vector Database:** Qdrant (Local Docker or Memory)
- **Embeddings:** `BAAI/bge-small-en-v1.5` via HuggingFace
- **Reranker:** `cross-encoder/ms-marco-MiniLM-L-6-v2`
- **LLMs:** Groq (`llama3-8b-8192` & `llama-3.2-11b-vision-preview`), Gemini 1.5 Pro, OpenAI (GPT-4o)

## 📁 Folder Structure
```text
conversational-rag/
│
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI Routes (upload, retrieval, chat)
│   │   ├── embeddings/   # Embedder & Qdrant VectorStore
│   │   ├── ingestion/    # PyMuPDF Processor, Cleaner, and LangChain Chunker
│   │   ├── llm/          # LangChain LLM Generator
│   │   ├── memory/       # Conversational Session Manager
│   │   ├── models/       # Pydantic Schemas
│   │   ├── prompts/      # System Prompts & Strict Constraints
│   │   ├── retrieval/    # Semantic Retriever, Query Router, Reranker
│   │   ├── config.py     # Environment configs
│   │   └── main.py       # FastAPI Entrypoint
│   ├── data/             # Uploaded PDFs storage
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/   # Sidebar, ChatMessage, UploadModal
│   │   ├── services/     # API Fetch integration
│   │   ├── App.tsx       # Main Chat Interface
│   │   └── index.css     # Global CSS and Tailwind Imports
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

## 🚀 Setup & Installation

### Option 1: Docker (Recommended)
Make sure you have Docker and Docker Compose installed.
1. Create a `.env` file based on `.env.example` in the root folder. Add your `GEMINI_API_KEY` or `OPENAI_API_KEY`.
2. Run:
   ```bash
   docker-compose up --build
   ```
3. Access the frontend at `http://localhost:5173` and the backend API at `http://localhost:8000`.

### Option 2: Manual Local Setup

**Backend:**
1. Navigate to the `backend` directory.
2. Create a virtual environment: `python -m venv venv`
3. Activate the environment (`venv\Scripts\activate` on Windows or `source venv/bin/activate` on Mac/Linux).
4. Install dependencies: `pip install -r requirements.txt`
5. Run the server: `uvicorn app.main:app --reload --port 8000`

**Frontend:**
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`

## 📖 API Endpoints
- `POST /api/v1/upload/`: Uploads a PDF with metadata and processes it asynchronously.
- `POST /api/v1/chat/`: Core RAG endpoint. Accepts `{ session_id, query, top_k }`. Returns LLM answer with strict book citations.
- `POST /api/v1/retrieval/`: Raw semantic search endpoint (helpful for debugging retrieval accuracy without LLM generation).
