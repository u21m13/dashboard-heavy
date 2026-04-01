# EWI Dashboard

A production-ready, dark-themed **Early Warning Indicator (EWI)** dashboard that connects directly to **Databricks** via Delta tables. All data aggregations (averages, grouping, sentiment counts) are handled entirely by **Databricks SQL** — the frontend is a pure display layer.

## Architecture

```
dashboard/
├── backend/                 # FastAPI + Databricks SQL connector
│   ├── main.py              # FastAPI app (CORS, router registration)
│   ├── config.py            # Pydantic settings from .env
│   ├── db.py                # Databricks connection + parameterised query helper
│   ├── queries.py           # All SQL queries (EWI summary, timeseries, distribution, news)
│   ├── routers/
│   │   ├── ewi.py           # GET /api/ewi/summary
│   │   └── sentiment.py     # GET /api/sentiment/{timeseries,distribution,news}/{entity_id}
│   └── requirements.txt
└── frontend/                # Next.js 14 + Tailwind CSS + Recharts
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx          # View 1 — EWI Dashboard (counterparty cards grid)
    │   └── sentiment/[id]/
    │       └── page.tsx      # View 2 — Sentiment drill-down
    ├── components/
    │   ├── Sidebar.tsx           # Date filter sidebar
    │   ├── CounterpartyCard.tsx  # EWI card
    │   ├── SentimentTimeline.tsx # Line chart (Recharts)
    │   ├── SentimentDistribution.tsx # Bar chart (Recharts)
    │   └── NewsArticleList.tsx   # Recent articles list
    └── lib/
        └── api.ts               # Typed API client functions
```

## Delta Table Schema

Update `queries.py` with your actual table names. The queries expect the following *logical* schema:

### `delta_db.entity_risk_summary`
| Column | Type | Description |
|---|---|---|
| `entity_id` | STRING | Unique counterparty identifier |
| `entity_name` | STRING | Display name |
| `industry` | STRING | Industry sector |
| `exposure_usd` | DOUBLE | Notional exposure in USD |
| `risk_score` | DOUBLE | Composite risk score (0–10) |
| `risk_tier` | STRING | `'High'`, `'Medium'`, or `'Low'` |
| `last_review_date` | DATE | Date of last credit review |
| `status` | STRING | e.g. `'Active'`, `'Watch'`, `'Review'` |

### `delta_db.news_sentiment_analysis`
| Column | Type | Description |
|---|---|---|
| `article_id` | STRING | Unique article ID |
| `entity_id` | STRING | Foreign key to `entity_risk_summary` |
| `headline` | STRING | Article headline |
| `source` | STRING | Publication name |
| `published_at` | TIMESTAMP | Publication timestamp |
| `sentiment_label` | STRING | `'Positive'`, `'Neutral'`, or `'Negative'` |
| `sentiment_score` | DOUBLE | Model confidence score (e.g. –1 to 1) |
| `url` | STRING | Original article URL |

---

## Setup & Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- A running Databricks SQL Warehouse with Delta tables matching the schema above

---

### 1. Backend Setup

```bash
cd dashboard/backend

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and fill in your Databricks credentials
cp .env.example .env
```

Edit `backend/.env`:
```env
DATABRICKS_SERVER_HOSTNAME=your-workspace.azuredatabricks.net
DATABRICKS_HTTP_PATH=/sql/1.0/warehouses/your-warehouse-id
DATABRICKS_TOKEN=dapi...your-token...
DATABRICKS_CATALOG=hive_metastore    # or your Unity Catalog name
DATABRICKS_SCHEMA=delta_db           # schema containing your Delta tables
```

Start the API server:
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.  
Interactive docs: `http://localhost:8000/docs`

---

### 2. Frontend Setup

```bash
cd dashboard/frontend

# Install dependencies
npm install

# (Optional) Edit .env.local if your backend runs on a different port
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Start the dev server
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/api/ewi/summary` | EWI dashboard cards (requires `start_date`, `end_date`) |
| `GET` | `/api/sentiment/timeseries/{entity_id}` | Daily sentiment timeseries |
| `GET` | `/api/sentiment/distribution/{entity_id}` | Weekly Positive/Neutral/Negative counts |
| `GET` | `/api/sentiment/news/{entity_id}` | Recent news articles |

All endpoints require `?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` query parameters.

---

## Customising the SQL Queries

All queries live in `backend/queries.py`. The `%s` placeholders are substituted safely by the Databricks SQL connector (DB-API 2.0 parameterisation — **SQL-injection safe**).

To point to different table names, update `DATABRICKS_CATALOG` and `DATABRICKS_SCHEMA` in `.env`, or edit the f-string interpolation at the top of `queries.py`.

---

## Key Design Decisions

- **Zero frontend aggregation**: The frontend only passes `start_date`/`end_date` to the backend. Databricks SQL computes all `AVG`, `COUNT`, `GROUP BY WEEK`, and `ORDER BY` operations.
- **400ms debounce**: Date filter changes are debounced so that every keypress doesn't fire a warehouse query.
- **Skeleton loading**: The EWI dashboard shows animated skeleton cards while waiting for the Databricks response.
- **Type safety**: All API responses are typed end-to-end in `lib/api.ts`.
