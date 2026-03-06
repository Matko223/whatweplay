from .get_game_info import extract_top_tags, extract_genres, load_game_tags, extract_price
from typing import List, Dict
import asyncio
import httpx

GAME_TAGS_FILE = "operations/data/steam_full_db.json"

def get_recommended_games(game_id, limit=5):
    top_tags = extract_top_tags(game_id)
    genres = extract_genres(game_id)
    price = extract_price(game_id)

    recommended_games = {game_id: {"top_tags": top_tags, "genres": genres, "price": price}}

    games = load_game_tags()

    for appid in games:
        if str(appid) == str(game_id):
            continue

        game_tags = extract_top_tags(appid)
        game_genres = extract_genres(appid)
        game_price = extract_price(appid)

        tag_score = sum(1 for tag in top_tags if tag in game_tags)
        genre_score = sum(1 for genre in genres if genre in game_genres)
        price_score = 1 if game_price == price or price == "Free to play" else 0

        total_score = tag_score + genre_score + price_score

        recommended_games[appid] = {
            "name": games[str(appid)].get("name", "Unknown"),
            "score": total_score,
            "genres": [g.strip() for g in game_genres.split(",")] if isinstance(game_genres, str) else [],
            "price": extract_price(appid)
        }

    sorted_games = sorted(recommended_games.items(), key=lambda x: x[1].get("score", 0), reverse=True)
    return dict(sorted_games[:limit])

# CS2
print(get_recommended_games(730, limit=5))

async def get_game_rating(appid: str) -> Dict[str, str]:
    api_url = f"https://store.steampowered.com/appreviews/{appid}?json=1&language=all"
    pass