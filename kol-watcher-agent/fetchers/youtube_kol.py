import sys
import requests
from config import YOUTUBE_API_KEY, YOUTUBE_KOLS, YOUTUBE_DISCOVERY_QUERIES, MAX_ITEMS_PER_SOURCE, REQUEST_TIMEOUT, Platform

YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3"
SEARCH_URL = "https://www.bing.com/search"
BING_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}


def _fetch_via_api(kol: dict) -> list[dict]:
    """Fetch recent videos for a KOL using YouTube Data API v3 search."""
    if not YOUTUBE_API_KEY:
        return []

    items = []
    try:
        params = {
            "part": "snippet",
            "q": kol["query"],
            "type": "video",
            "maxResults": 5,
            "order": "date",
            "relevanceLanguage": "zh",
            "key": YOUTUBE_API_KEY,
        }
        resp = requests.get(f"{YOUTUBE_API_URL}/search", params=params, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()

        video_ids = []
        for item in data.get("items", []):
            vid = item["id"].get("videoId", "")
            if vid:
                video_ids.append(vid)

        if video_ids:
            stats_params = {
                "part": "statistics",
                "id": ",".join(video_ids),
                "key": YOUTUBE_API_KEY,
            }
            stats_resp = requests.get(f"{YOUTUBE_API_URL}/videos", params=stats_params, timeout=REQUEST_TIMEOUT)
            stats_resp.raise_for_status()
            stats_data = stats_resp.json()
            stats_map = {}
            for v in stats_data.get("items", []):
                stats_map[v["id"]] = v.get("statistics", {})

            for item in data.get("items", []):
                vid = item["id"].get("videoId", "")
                snippet = item["snippet"]
                stats = stats_map.get(vid, {})
                items.append({
                    "title": snippet.get("title", ""),
                    "url": f"https://www.youtube.com/watch?v={vid}",
                    "description": snippet.get("description", "")[:200],
                    "published_at": snippet.get("publishedAt", "")[:10],
                    "platform": Platform.YOUTUBE.value,
                    "author": snippet.get("channelTitle", kol["name"]),
                    "engagement": {
                        "views": int(stats.get("viewCount", 0)),
                        "likes": int(stats.get("likeCount", 0)),
                        "comments": int(stats.get("commentCount", 0)),
                    },
                })
    except requests.RequestException as e:
        print(f"[youtube] API error for '{kol['name']}': {e}", file=sys.stderr)
    except Exception as e:
        print(f"[youtube] error for '{kol['name']}': {e}", file=sys.stderr)

    return items


def _fetch_via_bing(kol: dict) -> list[dict]:
    """Fallback: Bing search for YouTube videos from a specific channel."""
    items = []
    try:
        params = {
            "q": f"youtube {kol['query']}",
            "count": 5,
        }
        resp = requests.get(SEARCH_URL, headers=BING_HEADERS, params=params, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(resp.text, "html.parser")

        for result in soup.select("li.b_algo")[:3]:
            a_el = result.select_one("h2 a")
            snippet_el = result.select_one(".b_caption p")
            title = a_el.get_text(strip=True) if a_el else ""
            link = a_el.get("href", "") if a_el else ""
            snippet = snippet_el.get_text(strip=True)[:150] if snippet_el else ""

            if title and link:
                items.append({
                    "title": title,
                    "url": link,
                    "description": snippet,
                    "published_at": "",
                    "platform": Platform.YOUTUBE.value,
                    "author": kol["name"],
                    "engagement": {},
                })
    except Exception as e:
        print(f"[youtube] Bing fallback error for '{kol['name']}': {e}", file=sys.stderr)

    return items


def fetch_youtube() -> list[dict]:
    items = []
    for kol in YOUTUBE_KOLS:
        try:
            kol_items = _fetch_via_api(kol)
            if not kol_items:
                print(f"[youtube] API returned 0 results for '{kol['name']}', trying Bing fallback", file=sys.stderr)
                kol_items = _fetch_via_bing(kol)
            items.extend(kol_items)
        except Exception as e:
            print(f"[youtube] unexpected error for '{kol['name']}': {e}", file=sys.stderr)
            continue

    # Discovery: search for new Zhongshan creators via broad queries
    for query in YOUTUBE_DISCOVERY_QUERIES:
        try:
            discovery_kol = {"name": f"[发现] {query}", "query": query}
            kol_items = _fetch_via_api(discovery_kol)
            if not kol_items:
                kol_items = _fetch_via_bing(discovery_kol)
            for item in kol_items:
                item["author"] = f"[发现·YouTube] {item.get('author', '')}"
            items.extend(kol_items)
        except Exception as e:
            print(f"[youtube] discovery error for '{query[:40]}': {e}", file=sys.stderr)
            continue

    seen = set()
    unique = []
    for item in items:
        if item["url"] not in seen:
            seen.add(item["url"])
            unique.append(item)
    return unique[:MAX_ITEMS_PER_SOURCE]
