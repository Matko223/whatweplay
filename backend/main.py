from fastapi import FastAPI
import httpx
import dotenv
import os

dotenv.load_dotenv()
app = FastAPI()

STEAM_API_KEY = os.getenv("STEAM_API_KEY")

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


@app.get("/common-games")
async def get_common_games(user_url: str):
    # Steamd ID 17 digits, vanity URL custom
    if user_url.isdigit() and len(user_url) == 17:
        steam_id = user_url
    else:
        steam_id = await resolve_vanity_url(user_url)

    api_url = f"http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/"

    if not steam_id:
        return {"Error": "Could not resolve vanity URL to a Steam ID."}

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
