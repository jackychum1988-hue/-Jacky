"""China & international financial news via Sina Finance + Eastmoney + Bing."""
import sys
import requests
from bs4 import BeautifulSoup
from config import REQUEST_TIMEOUT, MAX_ITEMS_PER_SOURCE

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
}

# Direct scraping sources
SINA_FINANCE_URL = "https://finance.sina.com.cn/"
EASTMONEY_URL = "https://www.eastmoney.com/"

# Bing fallback queries for finance topics
FINANCE_QUERIES = [
    "中国 央行 房贷 LPR",
    "人民币 汇率 美联储 利率",
]


def _scrape_sina() -> list[dict]:
    items = []
    try:
        resp = requests.get(SINA_FINANCE_URL, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        resp.encoding = "utf-8"
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        for a_el in soup.select("a[href]")[:30]:
            title = a_el.get_text(strip=True)
            link = a_el.get("href", "")
            if not title or not link or len(title) < 8:
                continue
            if "sina.com.cn" not in link and "sina.cn" not in link:
                continue
            items.append({"title": title, "link": link, "snippet": ""})
    except Exception as e:
        print(f"[finance] sina error: {e}", file=sys.stderr)
    return items[:MAX_ITEMS_PER_SOURCE]


def _scrape_eastmoney() -> list[dict]:
    items = []
    try:
        resp = requests.get(EASTMONEY_URL, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        resp.encoding = "utf-8"
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        for a_el in soup.select("a[href]")[:30]:
            title = a_el.get_text(strip=True)
            link = a_el.get("href", "")
            if not title or not link or len(title) < 8:
                continue
            if "eastmoney.com" not in link:
                continue
            items.append({"title": title, "link": link, "snippet": ""})
    except Exception as e:
        print(f"[finance] eastmoney error: {e}", file=sys.stderr)
    return items[:MAX_ITEMS_PER_SOURCE]


def _bing_search(query: str) -> list[dict]:
    items = []
    try:
        params = {"q": query, "count": 5, "tbs": "qdr:d"}
        resp = requests.get(
            "https://www.bing.com/search",
            headers=HEADERS,
            params=params,
            timeout=REQUEST_TIMEOUT,
        )
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        for result in soup.select("li.b_algo")[:2]:
            a_el = result.select_one("h2 a")
            snippet_el = result.select_one(".b_caption p")

            link = a_el.get("href", "") if a_el else ""
            title = a_el.get_text(strip=True) if a_el else ""
            snippet = snippet_el.get_text(strip=True)[:150] if snippet_el else ""

            if link and title:
                items.append({"title": title, "link": link, "snippet": snippet})
    except Exception as e:
        print(f"[finance] bing error '{query}': {e}", file=sys.stderr)
    return items


def fetch_finance_news() -> list[dict]:
    items = []

    # Direct sources first (faster, fresher)
    items.extend(_scrape_sina())
    items.extend(_scrape_eastmoney())

    # Bing fallback for specific topics
    for query in FINANCE_QUERIES:
        items.extend(_bing_search(query))

    seen = set()
    unique = []
    for item in items:
        if item["link"] not in seen:
            seen.add(item["link"])
            unique.append(item)
    return unique[:MAX_ITEMS_PER_SOURCE]
