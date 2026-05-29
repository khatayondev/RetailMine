# RetailMine Backend (FastAPI)

Python backend powering the React dashboard. Implements the full ETL pipeline,
SQLite star-schema warehouse, and all data-mining algorithms described in the
project doc.

## Run

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# put your dataset at: backend/data/online_retail_II.xlsx
uvicorn app:app --reload --port 8000
```

Frontend reads `VITE_API_URL` (defaults to `http://localhost:8000`).

## Endpoints

| Method | Path                  | Purpose                                     |
|--------|-----------------------|---------------------------------------------|
| GET    | /api/health           | liveness + dataset/warehouse status         |
| POST   | /api/upload           | upload `online_retail_II.xlsx`              |
| POST   | /api/preprocess       | run 7-step cleaning pipeline                |
| POST   | /api/warehouse/build  | build SQLite star schema                    |
| GET    | /api/kpis             | header KPIs (rows, customers, products...)  |
| GET    | /api/sales-trend      | monthly revenue                             |
| GET    | /api/etl-progress     | cleaning report                             |
| GET    | /api/segments         | RFM K-Means cluster summary                 |
| GET    | /api/best-model       | best classifier + accuracy                  |
| POST   | /api/classify         | train 4 classifiers, return metrics         |
| POST   | /api/cluster          | run K-Means on RFM                          |
| POST   | /api/associate        | Apriori / FP-Growth rules                   |
