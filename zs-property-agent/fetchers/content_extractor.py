"""Extract full article text from news URLs."""
import requests
from bs4 import BeautifulSoup
from config import REQUEST_TIMEOUT

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
}


def extract_article(url: str) -> str:
    """Fetch a news article URL and return cleaned body text (max 2000 chars)."""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        resp.encoding = "utf-8"
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        # Remove noise
        for tag in soup.select("script, style, nav, footer, .footer, .nav, .sidebar, .comment, .ad"):
            tag.decompose()

        # Try common article body selectors
        body = (
            soup.select_one("article")
            or soup.select_one(".article-content")
            or soup.select_one(".article-body")
            or soup.select_one(".content")
            or soup.select_one(".news-content")
            or soup.select_one("#Content")
            or soup.select_one(".main-content")
            or soup.select_one(".post-content")
            or soup.select_one("main")
        )

        text = body.get_text(separator="\n", strip=True) if body else soup.body.get_text(separator="\n", strip=True) if soup.body else ""

        # Clean up whitespace and truncate
        lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
        return "\n".join(lines)[:2000]

    except Exception:
        return ""
