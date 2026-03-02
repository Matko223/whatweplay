from fastapi import FastAPI
import httpx
import dotenv
import os
from fastapi.middleware.cors import CORSMiddleware

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
    steam_id = await get_steam_id(user_url)
    
    if not steam_id:
        return {"Error": "Could not resolve vanity URL to a Steam ID."}

    api_url = f"http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/"

    params = {
        "key": STEAM_API_KEY,
        "steamid": steam_id,
        "format": "json",
        "include_appinfo": True
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(api_url, params=params)

        if response.status_code != 200:
            return {"Error": f"Failed to fetch data from Steam API with status code: {response.status_code}"}
        
        data = response.json()

    return data.get("response", {}).get("games", [])
