import json
import os
from typing import List, Dict
import httpx
import asyncio

GAME_TAGS_FILE = "operations/data/steam_full_db.json"
_CACHE = None
_API_CACHE = {}

def load_game_tags() -> Dict[str, Dict]:
    global _CACHE
    if _CACHE is not None:
        return _CACHE
    
    if os.path.exists(GAME_TAGS_FILE):
        with open(GAME_TAGS_FILE, "r", encoding="utf-8") as f:
            _CACHE = json.load(f)
            return _CACHE
    _CACHE = {}
    return _CACHE

def extract_top_tags(appid: str, limit: int = 5) -> List[str]:
    game_data = load_game_tags().get(str(appid), {})
    tags = game_data.get("tags", {})
    
    if tags:
        sorted_tags = sorted(tags.items(), key=lambda x: x[1], reverse=True)
        return [tag[0] for tag in sorted_tags[:limit]]
    
    api_data = _API_CACHE.get(str(appid), {})
    if api_data:
        tags_list = api_data.get("tags", [])
        if isinstance(tags_list, list):
            return [tag.get("description", "") for tag in tags_list[:limit] if tag]
    
    return []

def extract_genres(appid: str) -> List[str]:
    game_data = load_game_tags().get(str(appid), {})
    genre_str = game_data.get("genre", "")
    
    if genre_str and isinstance(genre_str, str):
        return [g.strip() for g in genre_str.split(",")]
    
    api_data = _API_CACHE.get(str(appid), {})
    if api_data:
        genres_list = api_data.get("genres", [])
        if isinstance(genres_list, list):
            return [g.get("description", "") for g in genres_list if g]
    
    return []

def extract_price(appid: str) -> str:
    api_data = _API_CACHE.get(str(appid))
    if api_data:
        if api_data.get("actual_delisted"):
            return "Delisted"
        if api_data.get("is_free"):
            return "Free to Play"
        if api_data.get("price_overview"):
            return "Not free"
    
    game_data = load_game_tags().get(str(appid), {})
    price = game_data.get("price", "Unknown")
    
    if price == "Unknown":
        return "Unknown"
    elif price == "0":
        return "Free to Play"
    else:
        return "Not free"



async def fetch_missing_game_info_async(appid: str, retries: int = 2) -> Dict:
    if str(appid) in _API_CACHE:
        return _API_CACHE[str(appid)]
    
    for attempt in range(retries):
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"https://store.steampowered.com/api/appdetails?appids={appid}&cc=eur"
                )
                if response.status_code == 200:
                    data = response.json()
                    if data and str(appid) in data:
                        app_data = data[str(appid)]
                        if app_data.get("success", False):
                            game_info = app_data.get("data", {})
                            has_packages = bool(game_info.get("package_groups", []))

                            if "price_overview" not in game_info and not has_packages:
                                if game_info.get("is_free", False):
                                    result = game_info
                                else:
                                    result = {"actual_delisted": True}
                            else:
                                result = game_info
                        else:
                            result = {"actual_delisted": True}
                        _API_CACHE[str(appid)] = result
                        return result
                elif response.status_code == 429:
                    wait = 2 ** attempt
                    await asyncio.sleep(wait)
                    continue
                break
        except Exception as e:
            if attempt < retries - 1:
                await asyncio.sleep(1)
    
    return {}

async def fetch_multiple_games_async(appids: List[str]) -> None:
    if not appids:
        return
    tasks = [fetch_missing_game_info_async(appid) for appid in appids]
    await asyncio.gather(*tasks, return_exceptions=True)

def extract_game_filters(games: List[Dict]) -> Dict:
    tags_count = {}
    genres_count = {}
    price_categories = {}

    for game in games:
        for tag in game.get("tags", []):
            tags_count[tag] = tags_count.get(tag, 0) + 1
            
        for genre in game.get("genres", []):
            genres_count[genre] = genres_count.get(genre, 0) + 1
            
        price = game.get("price", "Unknown")
        price_categories[price] = price_categories.get(price, 0) + 1

    return {
        "tags": dict(sorted(tags_count.items(), key=lambda x: x[1], reverse=True)),
        "genres": dict(sorted(genres_count.items(), key=lambda x: x[1], reverse=True)),
        "priceCategories": price_categories
    }