import json
import os
from typing import List, Dict

GAME_TAGS_FILE = "operations/data/steam_full_db.json"
_CACHE = None 

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
    
    sorted_tags = sorted(tags.items(), key=lambda x: x[1], reverse=True)
    return [tag[0] for tag in sorted_tags[:limit]]

def extract_genres(appid: str) -> List[str]:
    game_data = load_game_tags().get(str(appid), {})
    genre_str = game_data.get("genre", "")
    
    if genre_str and isinstance(genre_str, str):
        return [g.strip() for g in genre_str.split(",")]
    
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
