from fastapi import FastAPI
import httpx
import dotenv
import os

dotenv.load_dotenv()
app = FastAPI()

STEAM_API_KEY = os.getenv("STEAM_API_KEY")


@app.get("/common-games")
async def get_common_games():
    url = f"http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/"

    params = {
        "key": STEAM_API_KEY,
        "steamid": "76561198286821354", # Matko223
        "format": "json",
        "include_appinfo": True
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        data = response.json()
    return data.get("response", {}).get("games", [])
