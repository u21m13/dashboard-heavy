from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import ewi, sentiment

app = FastAPI(
    title="EWI Dashboard API",
    description="FastAPI backend connecting to Databricks Delta tables for the EWI Dashboard.",
    version="1.0.0",
)

# Allow requests from the Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ewi.router)
app.include_router(sentiment.router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
