import re
from urllib.parse import urlparse
from typing import Optional, List, Dict
from ddgs import DDGS

SEARCH_TRIGGER_PATTERNS = [
    r"\b(latest|current|today|now|recent|recent news|update|updates|news)\b",
    r"\b(who is the (current|new|latest))\b",
    r"\b(weather|temperature|forecast)\b",
    r"\b(stock price|crypto price|share price)\b",
    r"\b(search (the )?web|browse|look up|google|find online)\b",
    r"\b(release date|when is|when will|version [0-9]+)\b",
    r"\b(2025|2026)\b",
    r"\b(score|match|game results|olympics|championship)\b"
]

def should_search_web(query: str, explicit_flag: Optional[bool] = None) -> bool:
    if explicit_flag is not None:
        return explicit_flag
    
    q_lower = query.lower()
    for pattern in SEARCH_TRIGGER_PATTERNS:
        if re.search(pattern, q_lower):
            return True
    return False

def extract_source_name(url: str) -> str:
    try:
        domain = urlparse(url).netloc.lower()
        if domain.startswith("www."):
            domain = domain[4:]
        parts = domain.split(".")
        if len(parts) >= 2:
            return parts[0].capitalize()
        return domain
    except Exception:
        return "Web Source"

def perform_web_search(query: str, max_results: int = 5) -> List[Dict[str, str]]:
    cleaned_query = query.strip()
    # Strip explicit trigger phrases like "search the web for"
    cleaned_query = re.sub(r"^(search the web for|search for|look up|browse for)\s+", "", cleaned_query, flags=re.IGNORECASE)
    
    results = []
    try:
        with DDGS() as ddgs:
            raw_results = list(ddgs.text(cleaned_query, max_results=max_results))
            for item in raw_results:
                url = item.get("href") or item.get("url") or ""
                title = item.get("title") or "Untitled Source"
                snippet = item.get("body") or item.get("snippet") or ""
                source_name = extract_source_name(url)
                if url:
                    results.append({
                        "title": title,
                        "url": url,
                        "source_name": source_name,
                        "snippet": snippet
                    })
    except Exception as e:
        print(f"[WebSearch] Error fetching web search results: {e}")
        # Return empty list gracefully
        return []
    
    return results
