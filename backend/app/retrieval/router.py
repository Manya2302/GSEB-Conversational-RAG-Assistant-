from app.llm.generator import AnswerGenerator
import json
import logging

logger = logging.getLogger(__name__)

class QueryRouter:
    def __init__(self):
        self.generator = AnswerGenerator()

    def route_query(self, query: str) -> dict:
        """
        Uses LLM to extract metadata filters from the user query to route to specific books.
        """
        prompt = f"""Given the following user query, extract any specific subjects, standards (grades), or book names mentioned.
Return the result strictly as a JSON object with the following keys:
- "subject": (string or null)
- "standard": (string or null)
- "book_name": (string or null)
- "chapter": (string or null)

Example 1:
Query: "Explain Cell Division from Science class 10"
Output: {{"subject": "Science", "standard": "10", "book_name": null, "chapter": null}}

Example 2:
Query: "What is velocity?"
Output: {{"subject": null, "standard": null, "book_name": null, "chapter": null}}

User Query: {query}
Output:"""

        if not self.generator.llm:
            return {}

        try:
            from langchain_core.messages import HumanMessage
            response = self.generator.llm.invoke([HumanMessage(content=prompt)])
            
            content = response.content.strip()
            # Clean markdown JSON block if present
            if content.startswith("```json"):
                content = content[7:-3]
            elif content.startswith("```"):
                content = content[3:-3]
                
            filters = json.loads(content.strip())
            
            # Remove null or empty string values
            active_filters = {k: v for k, v in filters.items() if v}
            
            if active_filters:
                logger.info(f"Query '{query}' routed with filters: {active_filters}")
            
            return active_filters
        except Exception as e:
            logger.error(f"Failed to route query: {e}")
            return {}
