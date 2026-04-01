from datetime import date

from fastapi import APIRouter, HTTPException, Query

from db import execute_query
from queries import (
    RECENT_NEWS_QUERY,
    SENTIMENT_TIMESERIES_QUERY,
    SENTIMENT_WEEKLY_DISTRIBUTION_QUERY,
)

router = APIRouter(prefix="/api/sentiment", tags=["Sentiment Analysis"])


def _check_dates(start_date: date, end_date: date) -> None:
    if start_date > end_date:
        raise HTTPException(
            status_code=400,
            detail="start_date must be before or equal to end_date.",
        )


@router.get("/timeseries/{entity_id}")
def get_sentiment_timeseries(
    entity_id: str,
    start_date: date = Query(...),
    end_date: date = Query(...),
):
    """
    Daily average sentiment score for a single entity.
    All date filtering and averaging is performed by Databricks SQL.
    """
    _check_dates(start_date, end_date)
    try:
        rows = execute_query(
            SENTIMENT_TIMESERIES_QUERY,
            {
                "entity_id": entity_id,
                "start_date": str(start_date),
                "end_date": str(end_date),
            },
        )
        # Convert date objects to ISO strings for JSON serialisation
        for row in rows:
            if hasattr(row.get("date"), "isoformat"):
                row["date"] = row["date"].isoformat()
        return {"data": rows}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/distribution/{entity_id}")
def get_sentiment_distribution(
    entity_id: str,
    start_date: date = Query(...),
    end_date: date = Query(...),
):
    """
    Weekly Positive / Neutral / Negative counts for a single entity.
    Grouped entirely in Databricks SQL using DATE_TRUNC('week', ...).
    """
    _check_dates(start_date, end_date)
    try:
        rows = execute_query(
            SENTIMENT_WEEKLY_DISTRIBUTION_QUERY,
            {
                "entity_id": entity_id,
                "start_date": str(start_date),
                "end_date": str(end_date),
            },
        )
        for row in rows:
            if hasattr(row.get("week_start"), "isoformat"):
                row["week_start"] = row["week_start"].isoformat()
        return {"data": rows}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/news/{entity_id}")
def get_recent_news(
    entity_id: str,
    start_date: date = Query(...),
    end_date: date = Query(...),
):
    """
    Returns up to 50 most recent news articles for a given entity,
    ordered and filtered entirely in Databricks SQL.
    """
    _check_dates(start_date, end_date)
    try:
        rows = execute_query(
            RECENT_NEWS_QUERY,
            {
                "entity_id": entity_id,
                "start_date": str(start_date),
                "end_date": str(end_date),
            },
        )
        for row in rows:
            if hasattr(row.get("published_at"), "isoformat"):
                row["published_at"] = row["published_at"].isoformat()
        return {"data": rows}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
