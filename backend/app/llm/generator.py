import os
from app.prompts.templates import RAG_SYSTEM_PROMPT
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class AnswerGenerator:
    def __init__(self):
        # Determine which LLM to use based on env vars
        if settings.GEMINI_API_KEY:
            from langchain_google_genai import ChatGoogleGenerativeAI
            logger.info("Initializing Gemini model")
            self.llm = ChatGoogleGenerativeAI(
                model="gemini-1.5-pro", 
                google_api_key=settings.GEMINI_API_KEY,
                temperature=0.1
            )
        elif settings.OPENAI_API_KEY:
            from langchain_openai import ChatOpenAI
            logger.info("Initializing OpenAI model")
            self.llm = ChatOpenAI(
                model="gpt-4o-mini", 
                openai_api_key=settings.OPENAI_API_KEY,
                temperature=0.1
            )
        else:
            logger.warning("No LLM API keys found, generation will fail.")
            self.llm = None

    def generate_answer(self, query: str, retrieved_chunks: list[dict]) -> dict:
        if not self.llm:
            raise ValueError("No LLM configured. Please set GEMINI_API_KEY or OPENAI_API_KEY.")
            
        # Format the context
        context_parts = []
        for i, chunk in enumerate(retrieved_chunks):
            # Include metadata heavily in context so the LLM can cite it
            context_part = (
                f"[Source {i+1} | Book: {chunk['book_name']} | Page: {chunk['page_number']}]\n"
                f"{chunk['text']}\n"
            )
            context_parts.append(context_part)
            
        formatted_context = "\n".join(context_parts)
        
        # Build prompt
        system_prompt = RAG_SYSTEM_PROMPT.format(context=formatted_context)
        
        from langchain_core.messages import SystemMessage, HumanMessage
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=query)
        ]
        
        logger.info(f"Calling LLM with {len(retrieved_chunks)} context chunks.")
        response = self.llm.invoke(messages)
        raw_content = response.content
        
        # Parse suggested questions if present
        answer_text = raw_content
        suggested_questions = []
        if "SUGGESTED_QUESTIONS:" in raw_content:
            parts = raw_content.split("SUGGESTED_QUESTIONS:")
            answer_text = parts[0].strip()
            suggestions_raw = parts[1].strip()
            suggested_questions = [q.strip() for q in suggestions_raw.split("|") if q.strip()]
        
        # Prepare the structured response
        citations = []
        for chunk in retrieved_chunks:
            citations.append({
                "book_name": chunk["book_name"],
                "page_number": chunk["page_number"],
                "snippet": chunk["text"][:150] + "..."  # Brief snippet for UI
            })
            
        return {
            "answer": answer_text,
            "citations": citations,
            "suggested_questions": suggested_questions
        }
