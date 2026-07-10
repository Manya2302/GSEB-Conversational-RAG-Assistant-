import re

def clean_text(text: str) -> str:
    """Removes unnecessary whitespace and cleans text."""
    # Replace multiple newlines with a single newline
    text = re.sub(r'\n+', '\n', text)
    # Replace multiple spaces with a single space
    text = re.sub(r' +', ' ', text)
    # Strip leading and trailing whitespace
    return text.strip()

def is_empty_page(text: str) -> bool:
    """Detects if a page is empty or contains only whitespace."""
    return len(clean_text(text)) < 10  # Arbitrary threshold for empty pages
