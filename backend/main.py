from fastapi import FastAPI
import httpx
import dotenv
import os
from fastapi.middleware.cors import CORSMiddleware
from operations.game_intersection import find_common_games
from operations.get_game_info import extract_top_tags, extract_genres, extract_price

dotenv.load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STEAM_API_KEY = os.getenv("STEAM_API_KEY")

async def get_steam_id(identifier: str):
    # Extract from URL format
    if identifier.startswith("https://steamcommunity.com/"):
        parts = identifier.rstrip("/").split("/")
        if len(parts) >= 5 and parts[3] in ["id", "profiles"]:
            extracted = parts[4]
            # /profiles/ URL
            if parts[3] == "profiles":
                print(f"{identifier} is a URL with direct Steam ID: {extracted}")
                return extracted
            # /id/ URL
            else:
                print(f"{identifier} is a vanity URL, resolving: {extracted}")
                return await resolve_vanity_url(extracted)

    # Already a 17-digit Steam ID
    if identifier.isdigit() and len(identifier) == 17:
        print(f"{identifier} is already a Steam ID.")
        return identifier
    
    # Try to resolve as vanity URL
    print(f"Attempting to resolve {identifier} as vanity URL")
    return await resolve_vanity_url(identifier)

async def resolve_vanity_url(vanity_name: str):
    url = "http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/"

    params = {
        "key": STEAM_API_KEY,
        "vanityurl": vanity_name,
        "format": "json"
    }   

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        data = response.json()

        if data.get("response", {}).get("success") == 1:
            return data["response"]["steamid"]
        
    return None

@app.get("/player-info")
async def get_player_info(identifier: str):
    steam_id = await get_steam_id(identifier)
    
    if not steam_id:
        return {"Error": "User not found"}

    api_url = "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/"
    params = {
        "key": STEAM_API_KEY,
        "steamids": steam_id,
        "format": "json"
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(api_url, params=params)
        data = response.json()
        players = data.get("response", {}).get("players", [])
        
        if not players:
            return {"Error": "No player data found"}
            
        player = players[0]
        return {
            "steamid": player["steamid"],
            "name": player["personaname"],
            "avatar": player["avatarfull"]
        }

@app.get("/common-games")
async def get_common_games(user_url: str):
    identifiers = user_url.split(",")
    print(f"Received identifiers: {identifiers}")
    id_array = []

    for identifier in identifiers:
        steam_id = await get_steam_id(identifier.strip())
        if not steam_id:
            return {"Error": f"Could not resolve vanity URL '{identifier.strip()}' to a Steam ID."}
        id_array.append(steam_id)

    try:
        common_games = await find_common_games(id_array, STEAM_API_KEY)

        for game in common_games:
            appid = game["appid"]
            game["tags"] = extract_top_tags(appid)
            game["genres"] = extract_genres(appid)
            game["price"] = extract_price(appid)        
        return common_games
    except Exception as e:
        return {"Error": str(e)}
