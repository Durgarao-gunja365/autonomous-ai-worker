# backend/app/tasks/scheduled_tasks.py
import feedparser
from app.services.summarizer import summarize_text
from app.core.db import SessionLocal
from app.core import crud

def fetch_and_store_news():
    db = SessionLocal()
    try:
        query = "AI"
        rss_url = f"https://news.google.com/rss/search?q={query}&hl=en"
        feed = feedparser.parse(rss_url)

        items = []
        for entry in feed.entries[:5]:
            items.append({"title": entry.title, "description": entry.get("summary"), "url": entry.link})

        full_text = "\n".join([f"{i['title']}\n{i['description'] or ''}" for i in items])
        summary = summarize_text(full_text)

        crud.save_news_records(db=db, query=query, items=items, summary=summary)
        print("✅ Scheduled task saved news for:", query)
    finally:
        db.close()

async def fetch_and_store_stock():
    from app.services.alpha_vantage import fetch_stock_quote
    db = SessionLocal()
    try:
        symbol = "AAPL"
        data = await fetch_stock_quote(symbol)
        if not data:
            print("⚠️ Stock fetch failed")
            return

        prev = data.get("previous_close") or data.get("open") or 0
        change = round((data.get("price", 0) - prev), 2)

        crud.save_stock_record(db=db, symbol=symbol, quote=data, change=change, mode=data.get("mode", "live"))
        print("✅ Scheduled task saved stock for:", symbol)
    finally:
        db.close()
