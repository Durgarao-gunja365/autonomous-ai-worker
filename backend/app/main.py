from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import routes
from apscheduler.schedulers.background import BackgroundScheduler
from app.tasks import scheduled_tasks
app = FastAPI(title="Autonomous AI Knowledge Worker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

# mount API routes
app.include_router(routes.router, prefix="/api")


# backend/app/main.py (add near imports end of file)
from .core.db import engine, Base
# import models so Base.metadata picks them up
from .models import entities  # ensure this import exists and path correct

# create tables
Base.metadata.create_all(bind=engine)



# Scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(scheduled_tasks.fetch_and_store_news, "interval", hours=6)
scheduler.add_job(scheduled_tasks.fetch_and_store_stock, "cron", hour=16, minute=0)  # every day at 4pm
scheduler.start()

@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()