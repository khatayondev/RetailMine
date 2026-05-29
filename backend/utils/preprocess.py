"""Cleaning pipeline + feature engineering + RFM builder."""
from __future__ import annotations
import pandas as pd
import numpy as np


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = [c.strip().replace(" ", "") for c in df.columns]
    if "CustomerID" not in df.columns and "Customer ID" in df.columns:
        df = df.rename(columns={"Customer ID": "CustomerID"})

    df = df.dropna(subset=["CustomerID"])
    df = df.dropna(subset=["Description"])
    df = df[~df["Invoice"].astype(str).str.startswith("C")]
    df = df[(df["Quantity"] > 0) & (df["Price"] > 0)]
    df = df.drop_duplicates()

    df["InvoiceDate"] = pd.to_datetime(df["InvoiceDate"])
    df["Revenue"] = df["Quantity"] * df["Price"]
    df["Year"] = df["InvoiceDate"].dt.year
    df["Month"] = df["InvoiceDate"].dt.month
    df["MonthName"] = df["InvoiceDate"].dt.strftime("%b")
    df["Quarter"] = df["InvoiceDate"].dt.quarter
    df["DayOfWeek"] = df["InvoiceDate"].dt.day_name()

    low, high = df["Revenue"].quantile([0.33, 0.66])
    df["RevenueClass"] = pd.cut(
        df["Revenue"],
        bins=[-np.inf, low, high, np.inf],
        labels=["Low", "Medium", "High"],
    ).astype(str)
    return df.reset_index(drop=True)


def get_cleaning_report(raw: pd.DataFrame, clean: pd.DataFrame) -> dict:
    return {
        "raw_rows": int(len(raw)),
        "clean_rows": int(len(clean)),
        "retained_pct": round(len(clean) / max(len(raw), 1) * 100, 2),
        "steps": [
            {"step": "Standardise column names", "removed": 0},
            {"step": "Drop missing Customer ID", "removed": int(raw["Customer ID"].isna().sum() if "Customer ID" in raw.columns else 0)},
            {"step": "Drop missing Description", "removed": int(raw["Description"].isna().sum())},
            {"step": "Remove cancelled invoices", "removed": int(raw["Invoice"].astype(str).str.startswith("C").sum())},
            {"step": "Remove non-positive Quantity/Price", "removed": int(((raw["Quantity"] <= 0) | (raw["Price"] <= 0)).sum())},
            {"step": "Remove duplicate rows", "removed": int(raw.duplicated().sum())},
            {"step": "Feature engineering", "added_columns": 7},
        ],
    }


def build_rfm(df: pd.DataFrame) -> pd.DataFrame:
    snapshot = df["InvoiceDate"].max() + pd.Timedelta(days=1)
    rfm = df.groupby("CustomerID").agg(
        Recency=("InvoiceDate", lambda x: (snapshot - x.max()).days),
        Frequency=("Invoice", "nunique"),
        Monetary=("Revenue", "sum"),
    ).reset_index()
    return rfm
