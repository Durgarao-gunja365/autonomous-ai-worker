from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
import feedparser

from app.core.db import SessionLocal
from app.core import crud
from .services.alpha_vantage import fetch_stock_quote
from .services.summarizer import summarize_text

router = APIRouter()

# ----------------- DB Dependency -----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ----------------- Models -----------------
class StockRequest(BaseModel):
    symbol: str

class NewsRequest(BaseModel):
    query: str = "technology"
    language: str = "en"
    page_size: int = 5

class NewsItem(BaseModel):
    title: str
    description: Optional[str] = None
    url: Optional[str] = None

class NewsResponse(BaseModel):
    items: List[NewsItem]
    summary: Optional[str] = None

# ----------------- Endpoints -----------------
@router.post("/news", response_model=NewsResponse)
async def get_news(req: NewsRequest, db: Session = Depends(get_db)):
    query = req.query.replace(" ", "+")
    rss_url = f"https://news.google.com/rss/search?q={query}&hl={req.language}"
    feed = feedparser.parse(rss_url)

    items = []
    for entry in feed.entries[:req.page_size]:
        items.append({
            "title": entry.title,
            "description": entry.get("summary"),
            "url": entry.link
        })

    full_text = "\n".join([f"{i['title']}\n{i['description'] or ''}" for i in items])
    summary = summarize_text(full_text)

    saved = crud.save_news_records(db=db, query=req.query, items=items, summary=summary)
    response_items = [NewsItem(title=r.title, description=r.description, url=r.url) for r in saved]

    return NewsResponse(items=response_items, summary=summary)


@router.post("/stock")
async def get_stock(req: StockRequest, db: Session = Depends(get_db)):
    data = await fetch_stock_quote(req.symbol)
    if not data:
        raise HTTPException(status_code=404, detail="Stock not found or API error")

    prev = data.get("previous_close") or data.get("open") or 0
    change = round((data.get("price", 0) - prev), 2)

    saved = crud.save_stock_record(db=db, symbol=req.symbol, quote=data, change=change, mode=data.get("mode", "live"))

    return {
        "symbol": req.symbol.upper(),
        "quote": data,
        "insight": {
            "change": change,
            "trend": "up" if change > 0 else "down" if change < 0 else "neutral",
            "saved_id": saved.id
        }
    }

@router.get("/history/news")
def history_news(limit: int = 20, db: Session = Depends(get_db)):
    rows = crud.get_recent_news(db=db, limit=limit)
    return [
        {
            "id": r.id,
            "query": r.query,
            "title": r.title,
            "description": r.description,
            "url": r.url,
            "summary": r.summary,
            "created_at": r.created_at.isoformat()
        } for r in rows
    ]


@router.get("/history/stocks")
def history_stocks(limit: int = 50, db: Session = Depends(get_db)):
    rows = crud.get_recent_stocks(db=db, limit=limit)
    return [
        {
            "id": r.id,
            "symbol": r.symbol,
            "price": r.price,
            "previous_close": r.previous_close,
            "change": r.change,
            "mode": r.mode,
            "timestamp": r.timestamp,
            "created_at": r.created_at.isoformat()
        } for r in rows
    ]

from app.tasks import scheduled_tasks

@router.post("/tasks/run-news")
def run_news_task():
    """Manually trigger scheduled news task"""
    scheduled_tasks.fetch_and_store_news()
    return {"status": "ok", "message": "News task executed manually"}

@router.post("/tasks/run-stock")
async def run_stock_task():
    """Manually trigger scheduled stock task"""
    await scheduled_tasks.fetch_and_store_stock()
    return {"status": "ok", "message": "Stock task executed manually"}


from fastapi import UploadFile, File
from pathlib import Path
import PyPDF2
import docx

from .services.summarizer import summarize_text


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Accepts a PDF or DOCX file, extracts text, and summarizes using Hugging Face.
    """

    # Validate file type
    ext = Path(file.filename).suffix.lower()
    if ext not in [".pdf", ".docx"]:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX supported")

    # Read file content
    content = await file.read()

    text = ""
    try:
        if ext == ".pdf":
            from io import BytesIO
            pdf_reader = PyPDF2.PdfReader(BytesIO(content))
            for page in pdf_reader.pages[:5]:  # limit to first 5 pages for performance
                text += page.extract_text() or ""
        elif ext == ".docx":
            doc = docx.Document(BytesIO(content))
            for para in doc.paragraphs:
                text += para.text + "\n"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading file: {e}")

    if not text.strip():
        raise HTTPException(status_code=400, detail="No text found in file")

    # Summarize
    summary = summarize_text(text)

    return {
        "filename": file.filename,
        "summary": summary[:10000]  # avoid huge response
    }


