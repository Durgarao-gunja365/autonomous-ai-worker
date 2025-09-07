# backend/app/models/entities.py
from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from datetime import datetime
from app.core.db import Base

class NewsRecord(Base):
    __tablename__ = "news_records"

    id = Column(Integer, primary_key=True, index=True)
    query = Column(String(200), index=True)
    title = Column(String(500))
    description = Column(Text, nullable=True)
    url = Column(String(1000), nullable=True)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class StockRecord(Base):
    __tablename__ = "stock_records"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(50), index=True)
    price = Column(Float)
    previous_close = Column(Float, nullable=True)
    change = Column(Float, nullable=True)
    mode = Column(String(20), default="live")  # live or demo
    timestamp = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

