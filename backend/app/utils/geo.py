import httpx
from app.core.config import settings

async def geocode_address(address: str):
    """
    Converts a text address to Latitude/Longitude using Google Geocoding API.
    """
    if not settings.GOOGLE_GEOCODING_API_KEY:
        # Fallback for demo purposes if key is missing
        return 12.9716, 77.5946 # Bangalore default
    
    url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={settings.GOOGLE_GEOCODING_API_KEY}"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        data = response.json()
        if data["status"] == "OK":
            location = data["results"][0]["geometry"]["location"]
            return location["lat"], location["lng"]
        else:
            raise ValueError(f"Geocoding failed: {data['status']}")
