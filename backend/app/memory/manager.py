from typing import Dict, List
import logging
from app.llm.generator import AnswerGenerator

logger = logging.getLogger(__name__)

class MemoryManager:
    def __init__(self):
        # Simple in-memory dict for session storage
        # Key: session_id, Value: List of dicts (role, content)
        self.sessions: Dict[str, List[dict]] = {}
        self.generator = AnswerGenerator() # Reuse the LLM instance
        
    def add_message(self, session_id: str, role: str, content: str):
        if session_id not in self.sessions:
            self.sessions[session_id] = []
        self.sessions[session_id].append({"role": role, "content": content})
        
    def get_history(self, session_id: str) -> List[dict]:
        return self.sessions.get(session_id, [])
        
    def clear_session(self, session_id: str):
        if session_id in self.sessions:
            del self.sessions[session_id]

    def rewrite_query(self, session_id: str, new_query: str) -> str:
        history = self.get_history(session_id)
        if not history:
            return new_query
            
        # Get last few turns to provide context
        recent_history = history[-4:]
        history_text = "\n".join([f"{msg['role'].capitalize()}: {msg['content']}" for msg in recent_history])
        
        rewrite_prompt = f"""Given the following conversation history and a new user question, 
rewrite the user question to be a standalone question that can be understood without the history.
If the question is already standalone or completely unrelated to the history, return it as is.
Do not answer the question, ONLY return the rewritten question.

Conversation History:
{history_text}

New Question: {new_query}
Standalone Question:"""

        if not self.generator.llm:
            return new_query
            
        try:
            from langchain_core.messages import HumanMessage
            response = self.generator.llm.invoke([HumanMessage(content=rewrite_prompt)])
            rewritten = response.content.strip()
            logger.info(f"Rewrote query '{new_query}' to '{rewritten}'")
            return rewritten
        except Exception as e:
            logger.error(f"Failed to rewrite query: {e}")
            return new_query
