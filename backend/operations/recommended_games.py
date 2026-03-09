from .get_game_info import (extract_top_tags, extract_genres, 
                            load_game_tags, extract_price, 
                            extract_player_count, extract_positivity_ratio,
                            fetch_missing_game_info_async)
from typing import List, Dict
import asyncio
import httpx

async def get_recommended_games(game_id, limit=10):
    game_id_str = str(game_id)

    if not game_id_str.isnumeric():
        converted_id = convert_to_appid(game_id_str)
        if converted_id == -1:
            raise ValueError(f"Game '{game_id}' not found on Steam")
        game_id_str = str(converted_id)
    
    target_tags = set(extract_top_tags(game_id_str))
    target_genres = set(extract_genres(game_id_str))
    target_price = extract_price(game_id_str)
    target_ccu = extract_player_count(game_id_str)
    target_positivity = extract_positivity_ratio(game_id_str)
    
    all_games = load_game_tags()
    recommendations = []

    for appid, game_data in all_games.items():
        if appid == game_id_str:
            continue

        current_tags = set(extract_top_tags(appid))
        current_genres = set(extract_genres(appid))
        current_price = extract_price(appid)
        
        if current_price == "Delisted":
            continue
        
        current_ccu = extract_player_count(appid)
        current_positivity = extract_positivity_ratio(appid)

        tag_score = (len(target_tags & current_tags) / max(len(target_tags), 1)) * 20

        genre_score = (len(target_genres & current_genres) / max(len(target_genres), 1)) * 25

        price_score = 10 if current_price == target_price or target_price == "Free to Play" else 0

        if target_ccu > 0:
            if current_ccu == 0:
                ccu_score = 0
            elif target_ccu > 50000:
                ccu_score = 10 if current_ccu > 100 else 0
            else:
                ccu_score = (
                    10 if current_ccu >= target_ccu * 0.5 else
                    8 if current_ccu >= target_ccu * 0.2 else
                    5 if current_ccu > 100 else
                    0
                )
        else:
            ccu_score = 0

        if target_positivity > 0:
            positivity_diff = abs(current_positivity - target_positivity)
            positivity_score = max(0, 25 * (1 - positivity_diff))
        else:
            positivity_score = 12.5

        total_score = tag_score + genre_score + ccu_score + positivity_score + price_score

        recommendations.append({
                "appid": appid,
                "name": game_data.get("name", "Unknown"),
                "score": total_score,
                "tags": list(current_tags),
                "genres": list(current_genres),
                "price": current_price,
                "ccu": current_ccu
        })

    recommendations.sort(key=lambda x: x["score"], reverse=True)
    
    final_recommendations = []
    for game in recommendations:
        if len(final_recommendations) >= limit:
            break
            
        steam_data = await fetch_missing_game_info_async(game["appid"])
        
        if steam_data.get("actual_delisted"):
            continue
            
        final_recommendations.append(game)
    
    return final_recommendations

def convert_to_appid(game_name: str) -> int:
    search_url = f"https://store.steampowered.com/api/storesearch/?term={game_name}&l=english&cc=US"
    try:
        response = httpx.get(search_url, timeout=10)
        response.raise_for_status()
        data = response.json()
        if "items" in data and len(data["items"]) > 0:
            return data["items"][0]["id"]
    except Exception as e:
        print(f"Error converting '{game_name}' to appid: {e}")
    return -1