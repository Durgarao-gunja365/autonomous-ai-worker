# backend/app/core/crud.py
from typing import List
from sqlalchemy.orm import Session
from app.models.entities import NewsRecord, StockRecord
from datetime import datetime

def save_news_records(db: Session, query: str, items: List[dict], summary: str):
    objs = []
    for it in items:
        obj = NewsRecord(
            query=query,
            title=it.get("title"),
            description=it.get("description"),
            url=it.get("url"),
            summary=summary,
            created_at=datetime.utcnow()
        )
        db.add(obj)
        objs.append(obj)
    db.commit()
    # refresh to get ids
    for o in objs:
        db.refresh(o)
    return objs

def save_stock_record(db: Session, symbol: str, quote: dict, change: float, mode: str):
    obj = StockRecord(
        symbol=symbol.upper(),
        price=quote.get("price"),
        previous_close=quote.get("previous_close"),
        change=change,
        mode=mode,
        timestamp=quote.get("timestamp"),
        created_at=datetime.utcnow()
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def get_recent_news(db: Session, limit: int = 20):
    return db.query(NewsRecord).order_by(NewsRecord.created_at.desc()).limit(limit).all()

def get_recent_stocks(db: Session, limit: int = 50):
    return db.query(StockRecord).order_by(StockRecord.created_at.desc()).limit(limit).all()
