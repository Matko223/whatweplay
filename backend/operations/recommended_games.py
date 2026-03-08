from .get_game_info import extract_top_tags, extract_genres, load_game_tags, extract_price
from typing import List, Dict
import asyncio
import httpx

def get_recommended_games(game_id, limit=5):
    game_id_str = str(game_id)
    
    target_tags = set(extract_top_tags(game_id_str))
    target_genres = set(extract_genres(game_id_str))
    target_price = extract_price(game_id_str)

    all_games = load_game_tags()
    recommendations = []

    for appid, game_data in all_games.items():
        if appid == game_id_str:
            continue

        current_tags = set(extract_top_tags(appid))
        current_genres = set(extract_genres(appid))
        current_price = extract_price(appid)

        tag_score = len(target_tags & current_tags) * 2
        genre_score = len(target_genres & current_genres) * 3
        
        price_score = 1 if current_price == target_price or target_price == "Free to Play" else 0

        total_score = tag_score + genre_score + price_score

        recommendations.append({
                "appid": appid,
                "name": game_data.get("name", "Unknown"),
                "score": total_score,
                "genres": list(current_genres),
                "price": current_price
        })

    recommendations.sort(key=lambda x: x["score"], reverse=True)
    
    return recommendations[:limit]