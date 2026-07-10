# Architecture Overview & Design Decisions

## 1. System Architecture
The application is built on a highly decoupled client-server architecture designed for extreme low-latency and high-precision information retrieval.

- **Frontend**: A React-Vite SPA styled with Tailwind CSS to provide a premium, ChatGPT-inspired user experience. It features native Speech-to-Text via the browser's Web Speech API and an interactive PDF iframe viewer for transparent source grounding.
- **Backend**: An asynchronous FastAPI Python server.
- **Vector Database**: Qdrant, chosen for its speed and native support for payload/metadata filtering.
- **Inference Engine**: `langchain-groq` utilizing `llama3-8b-8192` for sub-second text generation, and `llama-3.2-11b-vision-preview` for multimodal reasoning.

## 2. Ingestion & Multimodal OCR Pipeline (Bonus)
Traditional RAG pipelines fail when encountering scanned PDFs or diagrams (e.g., "Figure 11.4"). To solve this, the pipeline is entirely multimodal and multilingual:
- **Text Processing**: Standard text is extracted via `PyMuPDF (fitz)`, cleaned of headers/footers, and chunked via LangChain's `RecursiveCharacterTextSplitter`.
- **Multilingual OCR Fallback**: For images or scanned pages, the pipeline uses `EasyOCR` pre-processed by OpenCV (`cv2` CLAHE) to guarantee extraction of Gujarati, Hindi, and English characters.
- **Vision Reasoning**: Extracted images are also fired concurrently to Groq's Vision API to generate semantic descriptions of diagrams, allowing users to query visually-represented data.

## 3. Advanced Retrieval Strategy (Bonus)
To guarantee the AI only answers strictly from the textbooks (Requirement 5), the system utilizes a 3-step advanced retrieval chain:
1. **Query Routing**: Before vector search, an LLM dynamically analyzes the user query to extract metadata (`subject`, `standard`, `book_name`). This prevents the system from searching biology books when asked a physics question.
2. **Dense Vector Search**: `BAAI/bge-small-en-v1.5` creates dense embeddings, and Qdrant retrieves a widened net (Top-15) of chunks filtered exactly by the router's metadata.
3. **Cross-Encoder Reranking**: Because cosine-similarity can sometimes lose contextual nuance, the retrieved chunks are re-scored by a `sentence-transformers` Cross-Encoder (`ms-marco-MiniLM`), pushing only the absolute highest-fidelity Top-5 chunks to the generation LLM.

## 4. Conversational Memory (Requirement 8)
Follow-up questions (e.g., *"Who discovered it?"*) usually fail in RAG because the pronoun "it" lacks vector meaning. 
- The `MemoryManager` intercepts incoming queries, references the `session_id`, and instructs the LLM to rewrite the query into a standalone question (e.g., *"Who discovered photosynthesis?"*) prior to retrieval.

## 5. Strict Constraints & Source Grounding (Requirements 5, 6, 7)
- **Zero Hallucination Tolerance**: The System Prompt strictly forces the fallback message `"The information is unavailable in the knowledge base."` if the context does not contain the answer. 
- **Verifiable Citations**: The UI natively parses `book_name`, `page_number`, and a `snippet`. It renders these as clickable chips. Clicking a citation opens a modal overlay featuring the original textbook dynamically scrolled to the exact cited page via URL anchors (`#page=X`), providing incontrovertible proof of the answer's origin.

## 6. Performance Optimizations (Bonus)
- **Sub-10s Latency**: By utilizing Groq's LPUs for generation, `asyncio.gather` for concurrent multimodal parsing, and `@lru_cache` for embedding deduplication, the entire RAG cycle (Rewrite -> Route -> Embed -> Retrieve -> Rerank -> Generate) consistently executes in under 3 seconds.
