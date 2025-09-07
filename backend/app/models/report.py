from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    title = Column(String(255))
    summary = Column(Text)
    insights = Column(Text)  # JSON string of key insights
    raw_data = Column(Text)  # Original data source
    source_type = Column(String(50))  # 'news', 'stock', 'document'
    source_metadata = Column(Text)  # JSON string of source info
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    task = relationship("Task", backref="reports")