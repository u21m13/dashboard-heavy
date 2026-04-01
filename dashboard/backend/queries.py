"""
All Databricks SQL queries used by the EWI Dashboard API.

Table name conventions (adjust to match your actual Delta tables):
  delta_db.entity_risk_summary   — one row per counterparty/entity, holds
                                   aggregated risk, exposure & review metadata.
  delta_db.news_sentiment_analysis — one row per news article, holding article
                                   text, sentiment label, score, entity ref,
                                   and publication date.

All queries accept parameterised date bounds (start_date, end_date) that are
injected safely via the DB-API %s placeholder mechanism.
"""

from config import settings

# Convenience alias so we can write {S} instead of settings.databricks_schema
S = settings.databricks_schema
C = settings.databricks_catalog


# ---------------------------------------------------------------------------
# EWI Dashboard — Summary Cards
# ---------------------------------------------------------------------------

EWI_SUMMARY_QUERY = f"""
SELECT
    e.entity_id,
    e.entity_name,
    e.industry,
    e.exposure_usd,
    e.risk_score,
    e.risk_tier,
    e.last_review_date,
    e.status,
    -- Average sentiment score over the date range (null-safe)
    COALESCE(ROUND(AVG(n.sentiment_score), 4), 0.0)  AS avg_sentiment_score,
    -- Dominant sentiment label by count
    FIRST_VALUE(n.sentiment_label)
        OVER (
            PARTITION BY e.entity_id
            ORDER BY COUNT(n.sentiment_label) DESC
        )                                             AS dominant_sentiment
FROM {C}.{S}.entity_risk_summary AS e
LEFT JOIN {C}.{S}.news_sentiment_analysis AS n
    ON  n.entity_id  = e.entity_id
    AND n.published_at BETWEEN %s AND %s
GROUP BY
    e.entity_id, e.entity_name, e.industry, e.exposure_usd,
    e.risk_score, e.risk_tier, e.last_review_date, e.status
ORDER BY e.risk_score DESC
"""


# ---------------------------------------------------------------------------
# Sentiment Detail — Time Series (one data-point per day)
# ---------------------------------------------------------------------------

SENTIMENT_TIMESERIES_QUERY = f"""
SELECT
    CAST(n.published_at AS DATE)       AS date,
    ROUND(AVG(n.sentiment_score), 4)   AS avg_sentiment_score,
    COUNT(*)                           AS article_count
FROM {C}.{S}.news_sentiment_analysis AS n
WHERE n.entity_id    = %s
  AND n.published_at BETWEEN %s AND %s
GROUP BY CAST(n.published_at AS DATE)
ORDER BY date ASC
"""


# ---------------------------------------------------------------------------
# Sentiment Detail — Weekly Distribution
# (Positive / Neutral / Negative counts grouped by ISO week)
# ---------------------------------------------------------------------------

SENTIMENT_WEEKLY_DISTRIBUTION_QUERY = f"""
SELECT
    DATE_TRUNC('week', n.published_at)         AS week_start,
    COUNT(CASE WHEN n.sentiment_label = 'Positive' THEN 1 END) AS positive,
    COUNT(CASE WHEN n.sentiment_label = 'Neutral'  THEN 1 END) AS neutral,
    COUNT(CASE WHEN n.sentiment_label = 'Negative' THEN 1 END) AS negative
FROM {C}.{S}.news_sentiment_analysis AS n
WHERE n.entity_id    = %s
  AND n.published_at BETWEEN %s AND %s
GROUP BY DATE_TRUNC('week', n.published_at)
ORDER BY week_start ASC
"""


# ---------------------------------------------------------------------------
# Sentiment Detail — Recent News Articles
# ---------------------------------------------------------------------------

RECENT_NEWS_QUERY = f"""
SELECT
    n.article_id,
    n.headline,
    n.source,
    n.published_at,
    n.sentiment_label,
    ROUND(n.sentiment_score, 4) AS sentiment_score,
    n.url
FROM {C}.{S}.news_sentiment_analysis AS n
WHERE n.entity_id    = %s
  AND n.published_at BETWEEN %s AND %s
ORDER BY n.published_at DESC
LIMIT 50
"""
