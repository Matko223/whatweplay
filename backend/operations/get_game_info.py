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

def get_tags_for_game(appid: str) -> Dict:
    data = load_game_tags()
    game_data = data.get(str(appid), {})
    
    return {
        "tags": game_data.get("tags", {}),
        "genres": game_data.get("genres", {}),
        "prices": game_data.get("prices", {}),
        "name": game_data.get("name", "Unknown")
    }

def extract_top_tags(appid: str, limit: int = 5) -> List[str]:
    game_data = load_game_tags().get(str(appid), {})
    tags = game_data.get("tags", {})
    
    if tags:
        sorted_tags = sorted(tags.items(), key=lambda x: x[1], reverse=True)
        return [tag[0] for tag in sorted_tags[:limit]]
    
    api_data = fetch_missing_game_info(appid)
    if api_data and str(appid) in api_data:
        game_info = api_data[str(appid)]
        tags_list = game_info.get("tags", [])
        if isinstance(tags_list, list):
            return [tag.get("description", "") for tag in tags_list[:limit] if tag]
    
    return []

def extract_genres(appid: str) -> List[str]:
    game_data = load_game_tags().get(str(appid), {})
    genre_str = game_data.get("genre", "")
    
    if genre_str and isinstance(genre_str, str):
        return [g.strip() for g in genre_str.split(",")]
    
    api_data = fetch_missing_game_info(appid)
    if api_data and str(appid) in api_data:
        game_info = api_data[str(appid)]
        genres_list = game_info.get("genres", [])
        if isinstance(genres_list, list):
            return [g.get("description", "") for g in genres_list if g]
    
    return []

def extract_price(appid: str) -> str:
    game_data = load_game_tags().get(str(appid), {})
    price = game_data.get("price", "Unknown")
    if price == "Unknown":
        return price
    elif price == "0":
        return "Free to Play"
    elif len(price) <= 2:
        price = "0." + price + " €"
    else:
        price = price[:-2] + "." + price[-2:] + " €"
    return price

def extract_price_from_api(game_info: Dict) -> str:
    if game_info.get("is_free"):
        return "Free to Play"
    
    price_overview = game_info.get("price_overview", {})
    if price_overview:
        formatted = price_overview.get("final_formatted", "")
        if formatted:
            return formatted
    
    return "Unknown"

def fetch_missing_game_info(appid: str) -> Dict:
    if str(appid) in _API_CACHE:
        return _API_CACHE[str(appid)]
    
    try:
        response = httpx.get(f"https://store.steampowered.com/api/appdetails?appids={appid}&cc=eur", timeout=5.0)
        if response.status_code == 200:
            data = response.json()
            if data and str(appid) in data:
                app_data = data[str(appid)]
                if app_data.get("success", False):
                    game_info = app_data.get("data", {})
                    has_packages = bool(game_info.get("package_groups", []))

                    if "price_overview" not in game_info and not has_packages:
                        if game_info.get("is_free", False):
                            result = {str(appid): game_info}
                        else:
                            result = {str(appid): {"actual_delisted": True}}
                    else:
                        result = {str(appid): game_info}
                else:
                    result = {str(appid): {"actual_delisted": True}}
                _API_CACHE[str(appid)] = result
                return result
    except Exception as e:
        print(f"Error fetching {appid}: {e}")
    
    return {}

async def fetch_missing_game_info_async(appid: str) -> Dict:
    if str(appid) in _API_CACHE:
        return _API_CACHE[str(appid)]
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"https://store.steampowered.com/api/appdetails?appids={appid}&cc=eur", timeout=5.0)
            if response.status_code == 200:
                data = response.json()
                if data and str(appid) in data:
                    app_data = data[str(appid)]
                    if app_data.get("success", False):
                        game_info = app_data.get("data", {})
                        has_packages = bool(game_info.get("package_groups", []))

                        if "price_overview" not in game_info and not has_packages:
                            if game_info.get("is_free", False):
                                result = {str(appid): game_info}
                            else:
                                result = {str(appid): {"actual_delisted": True}}
                        else:
                            result = {str(appid): game_info}
                    else:
                        result = {str(appid): {"actual_delisted": True}}
                    _API_CACHE[str(appid)] = result
                    return result
    except Exception as e:
        print(f"Error fetching {appid}: {e}")
    
    return {}

async def fetch_multiple_games_async(appids: List[str]) -> None:
    tasks = [fetch_missing_game_info_async(appid) for appid in appids]
    await asyncio.gather(*tasks)
