import yfinance as yf

async def fetch_stock_quote(symbol: str):
    ticker = yf.Ticker(symbol)
    data = ticker.history(period="2d")

    if data.empty or len(data) < 2:
        return None

    current_price = data.iloc[-1]["Close"]
    previous_close = data.iloc[-2]["Close"]

    return {
        "price": round(current_price, 2),
        "previous_close": round(previous_close, 2)
    }
