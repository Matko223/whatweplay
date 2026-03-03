import asyncio
import httpx
from typing import List, Dict, Set

async def get_user_games(steam_id: str, api_key: str) -> List[Dict]:
    api_url = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/"
    
    params = {
        "key": api_key,
        "steamid": steam_id,
        "format": "json",
        "include_appinfo": True
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(api_url, params=params)

        if response.status_code != 200:
            raise Exception(f"Failed to fetch data from Steam API with status code: {response.status_code}")
        
        data = response.json()
        return data.get("response", {}).get("games", [])


async def find_common_games(steam_ids: List[str], api_key: str) -> List[Dict]:
    tasks = [get_user_games(sid, api_key) for sid in steam_ids]
    all_users_libraries = await asyncio.gather(*tasks)

    if all_users_libraries == 0:
        return []
    
    common_games = {game['appid'] for game in all_users_libraries[0]}

    for library in all_users_libraries[1:]:
        common_games.intersection_update({game['appid'] for game in library})

    # Retrieve detailed information for the common games
    common_games_info = [
        next((game for game in all_users_libraries[0] if game['appid'] == appid), None)
        for appid in common_games
    ]

    return [game for game in common_games_info if game is not None]



    



