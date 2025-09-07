import os
import httpx
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("ALPHAVANTAGE_API_KEY")
BASE_URL = "https://www.alphavantage.co/query"

async def fetch_stock_quote(symbol: str):
    """Fetch real-time stock quote from Alpha Vantage or fallback demo data."""
    if not API_KEY:
        # Demo mode if API key is missing
        return {
            "price": 150.25,
            "open": 149.00,
            "high": 152.30,
            "low": 148.75,
            "previous_close": 148.50,
            "volume": 1200000,
            "timestamp": "2025-09-06",
            "mode": "demo"
        }

    params = {
        "function": "GLOBAL_QUOTE",
        "symbol": symbol,
        "apikey": API_KEY
    }

    async with httpx.AsyncClient() as client:
        r = await client.get(BASE_URL, params=params)
        if r.status_code != 200:
            return None

        data = r.json()
        quote = data.get("Global Quote", {})

        # If no data returned (API limit hit or bad symbol), fallback to demo
        if not quote:
            return {
                "price": 100.50,
                "open": 99.75,
                "high": 101.20,
                "low": 98.90,
                "previous_close": 99.00,
                "volume": 800000,
                "timestamp": "2025-09-06",
                "mode": "demo"
            }

        return {
            "price": float(quote.get("05. price", 0)),
            "open": float(quote.get("02. open", 0)),
            "high": float(quote.get("03. high", 0)),
            "low": float(quote.get("04. low", 0)),
            "previous_close": float(quote.get("08. previous close", 0)),
            "volume": int(quote.get("06. volume", 0)),
            "timestamp": quote.get("07. latest trading day"),
            "mode": "live"
        }
