import sys
from config import YOUTUBE_API_KEY, YOUTUBE_SEARCH_QUERIES, MAX_ITEMS_PER_SOURCE, REQUEST_TIMEOUT
import requests


def fetch_youtube() -> list[dict]:
    if not YOUTUBE_API_KEY:
        print("[youtube] no API key configured, skipping", file=sys.stderr)
        return []

    items = []
    for query in YOUTUBE_SEARCH_QUERIES[:2]:
        try:
            params = {
                "part": "snippet",
                "q": query,
                "type": "video",
                "maxResults": 3,
                "order": "date",
                "relevanceLanguage": "zh",
                "key": YOUTUBE_API_KEY,
            }
            resp = requests.get(
                "https://www.googleapis.com/youtube/v3/search",
                params=params,
                timeout=REQUEST_TIMEOUT,
            )
            resp.raise_for_status()
            data = resp.json()

            for item in data.get("items", []):
                video_id = item["id"]["videoId"]
                snippet = item["snippet"]
                items.append({
                    "title": snippet["title"],
                    "channel": snippet["channelTitle"],
                    "link": f"https://www.youtube.com/watch?v={video_id}",
                    "published": snippet["publishedAt"][:10],
                })
        except requests.RequestException as e:
            print(f"[youtube] request error for '{query}': {e}", file=sys.stderr)
            continue
        except Exception as e:
            print(f"[youtube] error for '{query}': {e}", file=sys.stderr)
            continue

    seen = set()
    unique = []
    for item in items:
        if item["link"] not in seen:
            seen.add(item["link"])
            unique.append(item)
    return unique[:MAX_ITEMS_PER_SOURCE]
