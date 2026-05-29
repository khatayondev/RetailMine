"""FastAPI app exposing the retail mining pipeline to the React dashboard."""
from __future__ import annotations
import io
import shutil
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.tree import DecisionTreeClassifier

from utils.preprocess import build_rfm, clean_data, get_cleaning_report
from utils.warehouse import build_warehouse, warehouse_exists

BASE = Path(__file__).resolve().parent
DATA_DIR = BASE / "data"
DATA_DIR.mkdir(exist_ok=True)
DATASET = DATA_DIR / "online_retail_II.xlsx"

app = FastAPI(title="RetailMine API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

STATE: dict = {"raw": None, "clean": None, "report": None}


def _require_clean() -> pd.DataFrame:
    if STATE["clean"] is None:
        raise HTTPException(status_code=409, detail="Run /api/preprocess first")
    return STATE["clean"]


def _load_raw() -> pd.DataFrame:
    if STATE["raw"] is not None:
        return STATE["raw"]
    if not DATASET.exists():
        raise HTTPException(status_code=404, detail="Dataset not found. Upload online_retail_II.xlsx")
    df = pd.read_excel(DATASET, sheet_name="Year 2009-2010")
    STATE["raw"] = df
    return df


@app.get("/api/health")
def health():
    return {
        "ok": True,
        "dataset_present": DATASET.exists(),
        "raw_loaded": STATE["raw"] is not None,
        "clean_loaded": STATE["clean"] is not None,
        "warehouse_built": warehouse_exists(),
    }


@app.post("/api/upload")
async def upload(file: UploadFile = File(...)):
    with DATASET.open("wb") as f:
        shutil.copyfileobj(file.file, f)
    STATE["raw"] = None
    STATE["clean"] = None
    return {"ok": True, "path": str(DATASET)}


@app.get("/api/dataset/preview")
def dataset_preview(rows: int = 20):
    raw = _load_raw()
    cols = []
    for c in raw.columns:
        s = raw[c]
        cols.append({
            "name": str(c),
            "dtype": str(s.dtype),
            "non_null": int(s.notna().sum()),
            "nulls": int(s.isna().sum()),
            "null_pct": round(s.isna().mean() * 100, 2),
            "unique": int(s.nunique(dropna=True)),
            "sample": (None if s.dropna().empty else str(s.dropna().iloc[0])),
        })
    preview = raw.head(rows).fillna("").astype(str).to_dict(orient="records")
    return {
        "rows": int(len(raw)),
        "columns": cols,
        "preview": preview,
        "memory_mb": round(raw.memory_usage(deep=True).sum() / 1024 / 1024, 2),
        "duplicates": int(raw.duplicated().sum()),
    }


@app.get("/api/dataset/stats")
def dataset_stats():
    df = STATE["clean"] if STATE["clean"] is not None else (_load_raw() if DATASET.exists() else None)
    if df is None:
        return []
    desc = df.describe().round(2)
    desc = desc.replace({np.nan: None})
    desc = desc.reset_index().rename(columns={"index": "metric"}).to_dict(orient="records")
    return desc


@app.get("/api/dataset/invoices")
def dataset_invoices(n: int = 50):
    df = STATE["clean"] if STATE["clean"] is not None else (_load_raw() if DATASET.exists() else None)
    if df is None:
        return []
    invoice_col = "Invoice"
    if "Invoice" not in df.columns and "invoice" in df.columns:
        invoice_col = "invoice"
    
    invoices = df[invoice_col].dropna().unique()[:n].tolist()
    return [str(inv) for inv in invoices]


@app.get("/api/dataset/invoice/{invoice_id}")
def dataset_invoice(invoice_id: str):
    df = STATE["clean"] if STATE["clean"] is not None else (_load_raw() if DATASET.exists() else None)
    if df is None:
        raise HTTPException(status_code=404, detail="Dataset not loaded")
    invoice_col = "Invoice"
    if "Invoice" not in df.columns and "invoice" in df.columns:
        invoice_col = "invoice"
    
    invoice_df = df[df[invoice_col].astype(str) == invoice_id]
    return invoice_df.fillna("").to_dict(orient="records")


@app.post("/api/preprocess")
def preprocess():
    raw = _load_raw()
    clean = clean_data(raw)
    STATE["clean"] = clean
    STATE["report"] = get_cleaning_report(raw, clean)
    return STATE["report"]


@app.post("/api/warehouse/build")
def warehouse_build():
    return build_warehouse(_require_clean())


@app.get("/api/kpis")
def kpis():
    if STATE["clean"] is None:
        raw = _load_raw() if DATASET.exists() else None
        if raw is None:
            return {"transactions": 0, "clean_rows": 0, "customers": 0, "products": 0, "retained_pct": 0}
        return {
            "transactions": int(len(raw)),
            "clean_rows": 0,
            "customers": 0,
            "products": 0,
            "retained_pct": 0,
        }
    df = STATE["clean"]
    raw_n = len(STATE["raw"]) if STATE["raw"] is not None else len(df)
    return {
        "transactions": int(raw_n),
        "clean_rows": int(len(df)),
        "customers": int(df["CustomerID"].nunique()),
        "products": int(df["StockCode"].nunique()),
        "countries": int(df["Country"].nunique()),
        "retained_pct": round(len(df) / max(raw_n, 1) * 100, 2),
    }


@app.get("/api/sales-trend")
def sales_trend():
    df = _require_clean()
    trend = df.groupby(["Year", "Month", "MonthName"], as_index=False)["Revenue"].sum()
    trend = trend.sort_values(["Year", "Month"])
    peak_idx = trend["Revenue"].idxmax()
    return {
        "points": [
            {
                "m": f"{row['MonthName']} '{str(int(row['Year']))[2:]}",
                "v": float(row["Revenue"]),
                "peak": idx == peak_idx,
            }
            for idx, row in trend.iterrows()
        ],
    }


@app.get("/api/etl-progress")
def etl_progress():
    if STATE["report"] is None:
        raise HTTPException(status_code=409, detail="Run /api/preprocess first")
    return STATE["report"]


@app.get("/api/explore/kpis")
def explore_kpis():
    df = _require_clean()
    return {
        "revenue": float(df["Revenue"].sum()),
        "orders": int(df["Invoice"].nunique()),
        "avg_order_value": float(df.groupby("Invoice")["Revenue"].sum().mean()),
        "customers": int(df["CustomerID"].nunique()),
        "products_sold": int(df["Quantity"].sum()),
    }


@app.get("/api/explore/bar")
def explore_bar(dimension: str = "country", n: int = 10):
    df = _require_clean()
    col = {"country": "Country", "product": "Description", "month": "MonthName", "weekday": "DayOfWeek"}.get(dimension, "Country")
    g = df.groupby(col)["Revenue"].sum().sort_values(ascending=False).head(n)
    return {"items": [{"label": str(k), "value": float(v)} for k, v in g.items()]}


@app.get("/api/explore/pie")
def explore_pie(dimension: str = "country"):
    df = _require_clean()
    col = {"country": "Country", "class": "RevenueClass", "quarter": "Quarter"}.get(dimension, "Country")
    g = df.groupby(col)["Revenue"].sum().sort_values(ascending=False).head(8)
    return {"items": [{"label": str(k), "value": float(v)} for k, v in g.items()]}


@app.get("/api/explore/line")
def explore_line(grain: str = "month"):
    df = _require_clean()
    if grain == "day":
        s = df.groupby(df["InvoiceDate"].dt.date).agg(revenue=("Revenue", "sum"), orders=("Invoice", "nunique"))
    else:
        s = df.groupby([df["Year"], df["Month"], df["MonthName"]]).agg(revenue=("Revenue", "sum"), orders=("Invoice", "nunique"))
        s.index = [f"{m} '{str(int(y))[2:]}" for y, _, m in s.index]
    return {"points": [{"label": str(idx), "revenue": float(r["revenue"]), "orders": int(r["orders"])} for idx, r in s.iterrows()]}


@app.get("/api/explore/histogram")
def explore_histogram(column: str = "Revenue", bins: int = 30, cap_percentile: float = 99.0):
    import numpy as np
    df = _require_clean()
    s = df[column].astype(float)
    cap = float(np.percentile(s, cap_percentile))
    s = s[s <= cap]
    counts, edges = np.histogram(s, bins=bins)
    return {
        "bins": [{"x": float((edges[i] + edges[i + 1]) / 2), "count": int(counts[i])} for i in range(len(counts))],
        "mean": float(s.mean()),
        "median": float(s.median()),
        "std": float(s.std()),
        "max": float(s.max()),
    }


@app.get("/api/explore/correlation")
def explore_correlation():
    df = _require_clean()
    num = df[["Quantity", "Price", "Revenue", "Month", "Quarter"]]
    corr = num.corr().round(3)
    return {"columns": list(corr.columns), "matrix": corr.values.tolist()}


@app.get("/api/explore/top-countries")
def explore_top_countries(n: int = 10):
    df = _require_clean()
    g = df.groupby("Country").agg(transactions=("Invoice", "count"), revenue=("Revenue", "sum"))
    g = g.sort_values("revenue", ascending=False).head(n).reset_index()
    return {"items": [{"country": r["Country"], "transactions": int(r["transactions"]), "revenue": float(r["revenue"])} for _, r in g.iterrows()]}


@app.get("/api/segments")
def segments():
    df = _require_clean()
    rfm = build_rfm(df)
    X = StandardScaler().fit_transform(rfm[["Recency", "Frequency", "Monetary"]])
    km = KMeans(n_clusters=4, n_init=10, random_state=42).fit(X)
    rfm["cluster"] = km.labels_

    profile = rfm.groupby("cluster").agg(
        recency=("Recency", "mean"),
        frequency=("Frequency", "mean"),
        monetary=("Monetary", "mean"),
        count=("CustomerID", "count"),
    ).reset_index()

    profile["share"] = (profile["count"] / profile["count"].sum() * 100).round(1)
    profile = profile.sort_values("monetary", ascending=False).reset_index(drop=True)
    labels = ["Champions", "New / Promising", "At-Risk", "Dormant"]
    profile["name"] = labels[: len(profile)]

    return {
        "segments": [
            {
                "name": row["name"],
                "size": float(row["share"]),
                "recency": float(row["recency"]),
                "frequency": float(row["frequency"]),
                "monetary": float(row["monetary"]),
            }
            for _, row in profile.iterrows()
        ]
    }


class ClassifyReq(BaseModel):
    test_size: float = 0.2
    features: list[str] = ["Quantity", "Price", "Month", "Quarter"]


@app.post("/api/classify")
def classify(req: ClassifyReq):
    from sklearn.metrics import confusion_matrix
    from sklearn.tree import export_text
    df = _require_clean()
    
    df_x = df.copy()
    if "CountryCode" in req.features:
        le_country = LabelEncoder()
        df_x["CountryCode"] = le_country.fit_transform(df_x["Country"])
        
    X = df_x[req.features].copy()
    le = LabelEncoder()
    y = le.fit_transform(df_x["RevenueClass"].astype(str))
    labels = list(le.classes_)
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=req.test_size, random_state=42, stratify=y)

    scaler = StandardScaler().fit(X_tr)
    X_tr_s, X_te_s = scaler.transform(X_tr), scaler.transform(X_te)

    models = {
        "Decision Tree": (DecisionTreeClassifier(max_depth=8, random_state=42), X_tr, X_te),
        "Random Forest": (RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1), X_tr, X_te),
        "Naive Bayes": (GaussianNB(), X_tr_s, X_te_s),
        "K-Nearest Neighbour": (KNeighborsClassifier(n_neighbors=7, n_jobs=-1), X_tr_s, X_te_s),
    }

    results = []
    for name, (model, xt, xe) in models.items():
        model.fit(xt, y_tr)
        preds = model.predict(xe)
        cm = confusion_matrix(y_te, preds).tolist()
        importance = None
        if hasattr(model, "feature_importances_"):
            importance = [{"feature": f, "value": float(v)} for f, v in zip(req.features, model.feature_importances_)]
            
        dt_rules = None
        if name == "Decision Tree":
            dt_rules = export_text(model, feature_names=req.features, max_depth=3)
            
        results.append({
            "name": name,
            "accuracy": round(accuracy_score(y_te, preds), 4),
            "precision": round(precision_score(y_te, preds, average="weighted", zero_division=0), 4),
            "recall": round(recall_score(y_te, preds, average="weighted", zero_division=0), 4),
            "f1": round(f1_score(y_te, preds, average="weighted", zero_division=0), 4),
            "confusion_matrix": cm,
            "feature_importance": importance,
            "dt_rules": dt_rules,
        })

    best = max(results, key=lambda r: r["accuracy"])
    return {"results": results, "best": best, "labels": labels, "train_size": int(len(X_tr)), "test_size_n": int(len(X_te))}


@app.get("/api/best-model")
def best_model():
    return classify(ClassifyReq())


class ClusterReq(BaseModel):
    k: int = 4
    algorithm: str = "kmeans"
    linkage: str = "ward"


@app.post("/api/cluster")
def cluster(req: ClusterReq):
    from sklearn.metrics import silhouette_score
    from sklearn.cluster import AgglomerativeClustering
    import io
    import base64
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    from scipy.cluster.hierarchy import dendrogram, linkage as hc_linkage
    
    df = _require_clean()
    rfm = build_rfm(df)
    X = StandardScaler().fit_transform(rfm[["Recency", "Frequency", "Monetary"]])
    
    dendrogram_img = None
    if req.algorithm == "hierarchical":
        model = AgglomerativeClustering(n_clusters=req.k, linkage=req.linkage)
        labels = model.fit_predict(X)
        inertia = 0.0
        
        # Generate dendrogram
        try:
            sample_idx = np.random.RandomState(42).choice(len(X), min(300, len(X)), replace=False)
            sample_scaled = X[sample_idx]
            plt.figure(figsize=(10, 4))
            Z = hc_linkage(sample_scaled, method=req.linkage)
            dendrogram(Z, truncate_mode="level", p=5, color_threshold=0)
            plt.title(f"Hierarchical Clustering Dendrogram ({req.linkage} linkage)")
            plt.xlabel("Sampled Customer Index")
            plt.ylabel("Distance")
            plt.tight_layout()
            
            buf = io.BytesIO()
            plt.savefig(buf, format="png", dpi=120)
            buf.seek(0)
            dendrogram_img = base64.b64encode(buf.read()).decode("utf-8")
            plt.close()
        except Exception as e:
            print(f"Error generating dendrogram: {e}")
    else:
        model = KMeans(n_clusters=req.k, n_init=10, random_state=42)
        labels = model.fit_predict(X)
        inertia = float(model.inertia_)
        
    rfm["cluster"] = labels
    sil = float(silhouette_score(X, labels)) if req.k > 1 else 0.0

    profile = rfm.groupby("cluster").agg(
        recency=("Recency", "mean"),
        frequency=("Frequency", "mean"),
        monetary=("Monetary", "mean"),
        count=("CustomerID", "count"),
    ).reset_index()

    sample = rfm.sample(min(400, len(rfm)), random_state=42)
    points = [
        {"r": float(row["Recency"]), "f": float(row["Frequency"]), "m": float(row["Monetary"]), "c": int(row["cluster"])}
        for _, row in sample.iterrows()
    ]
    return {
        "k": req.k,
        "silhouette": round(sil, 4),
        "inertia": inertia,
        "profile": [
            {"cluster": int(r["cluster"]), "recency": float(r["recency"]), "frequency": float(r["frequency"]), "monetary": float(r["monetary"]), "count": int(r["count"])}
            for _, r in profile.iterrows()
        ],
        "points": points,
        "dendrogram": dendrogram_img
    }


@app.get("/api/cluster/elbow")
def cluster_elbow():
    from sklearn.metrics import silhouette_score
    df = _require_clean()
    rfm = build_rfm(df)
    X = StandardScaler().fit_transform(rfm[["Recency", "Frequency", "Monetary"]])
    results = []
    for k in range(2, 11):
        km = KMeans(n_clusters=k, n_init=10, random_state=42).fit(X)
        results.append({
            "k": k,
            "inertia": float(km.inertia_),
            "silhouette": round(float(silhouette_score(X, km.labels_)), 4),
        })
    best = max(results, key=lambda r: r["silhouette"])
    return {"points": results, "recommended_k": best["k"]}


class AssocReq(BaseModel):
    country: str = "United Kingdom"
    max_invoices: int = 1000
    min_support: float = 0.02
    min_confidence: float = 0.3
    algorithm: str = "fpgrowth"  # apriori | fpgrowth


@app.post("/api/associate")
def associate(req: AssocReq):
    from mlxtend.frequent_patterns import apriori, association_rules, fpgrowth
    df = _require_clean()
    df = df[df["Country"] == req.country]
    invoices = df["Invoice"].drop_duplicates().head(req.max_invoices)
    df = df[df["Invoice"].isin(invoices)]

    basket = (
        df.groupby(["Invoice", "Description"])["Quantity"].sum().unstack(fill_value=0) > 0
    ).astype(bool)

    func = fpgrowth if req.algorithm == "fpgrowth" else apriori
    itemsets = func(basket, min_support=req.min_support, use_colnames=True)
    if itemsets.empty:
        return {"itemsets": 0, "rules": []}
    rules = association_rules(itemsets, metric="confidence", min_threshold=req.min_confidence)
    rules = rules.sort_values("lift", ascending=False).head(20)
    return {
        "itemsets": int(len(itemsets)),
        "rules": [
            {
                "antecedents": list(r["antecedents"]),
                "consequents": list(r["consequents"]),
                "support": round(r["support"], 4),
                "confidence": round(r["confidence"], 4),
                "lift": round(r["lift"], 4),
            }
            for _, r in rules.iterrows()
        ],
    }
