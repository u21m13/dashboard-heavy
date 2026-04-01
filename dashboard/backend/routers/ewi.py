from datetime import date
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from db import execute_query
from queries import EWI_SUMMARY_QUERY

router = APIRouter(prefix="/api/ewi", tags=["EWI Dashboard"])


@router.get("/summary")
def get_ewi_summary(
    start_date: date = Query(..., description="Filter start date (YYYY-MM-DD)"),
    end_date: date = Query(..., description="Filter end date (YYYY-MM-DD)"),
):
    """
    Returns one record per counterparty/entity for the EWI dashboard grid.
    Databricks SQL performs all aggregations (avg sentiment, dominant label).
    """
    if start_date > end_date:
        raise HTTPException(
            status_code=400,
            detail="start_date must be before or equal to end_date.",
        )
    try:
        rows = execute_query(
            EWI_SUMMARY_QUERY,
            {"start_date": str(start_date), "end_date": str(end_date)},
        )
        return {"data": rows}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
