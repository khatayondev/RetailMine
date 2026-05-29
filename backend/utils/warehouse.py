"""SQLite star-schema ETL helpers."""
from __future__ import annotations
import sqlite3
from pathlib import Path
import pandas as pd

DB_PATH = Path(__file__).resolve().parent.parent / "warehouse.db"


def _connect() -> sqlite3.Connection:
    return sqlite3.connect(DB_PATH)


def build_warehouse(df: pd.DataFrame) -> dict:
    with _connect() as conn:
        for t in ("fact_sales", "dim_date", "dim_customer", "dim_product", "dim_country"):
            conn.execute(f"DROP TABLE IF EXISTS {t}")

        dim_date = df[["InvoiceDate", "Year", "Month", "MonthName", "Quarter", "DayOfWeek"]].drop_duplicates()
        dim_date = dim_date.rename(columns={"InvoiceDate": "date"})
        dim_date["date"] = pd.to_datetime(dim_date["date"]).dt.strftime("%Y-%m-%d")
        dim_date = dim_date.drop_duplicates(subset=["date"]).reset_index(drop=True)
        dim_date.insert(0, "date_id", range(1, len(dim_date) + 1))
        dim_date.to_sql("dim_date", conn, index=False)

        dim_customer = df[["CustomerID", "Country"]].drop_duplicates(subset=["CustomerID"])
        dim_customer.columns = ["customer_id", "country"]
        dim_customer.to_sql("dim_customer", conn, index=False)

        dim_product = df[["StockCode", "Description"]].drop_duplicates(subset=["StockCode"]).reset_index(drop=True)
        dim_product.insert(0, "product_id", range(1, len(dim_product) + 1))
        dim_product.columns = ["product_id", "stock_code", "description"]
        dim_product.to_sql("dim_product", conn, index=False)

        dim_country = pd.DataFrame({"country_name": df["Country"].drop_duplicates().tolist()})
        dim_country.insert(0, "country_id", range(1, len(dim_country) + 1))
        dim_country.to_sql("dim_country", conn, index=False)

        fact = df[["Invoice", "CustomerID", "StockCode", "InvoiceDate", "Quantity", "Price", "Revenue", "RevenueClass", "Country"]].copy()
        fact["date"] = pd.to_datetime(fact["InvoiceDate"]).dt.strftime("%Y-%m-%d")
        fact = fact.drop(columns=["InvoiceDate"])
        fact.columns = ["invoice", "customer_id", "stock_code", "quantity", "unit_price", "revenue", "revenue_class", "country", "date"]
        fact.to_sql("fact_sales", conn, index=False)

        return {
            "tables": ["dim_date", "dim_customer", "dim_product", "dim_country", "fact_sales"],
            "fact_rows": int(len(fact)),
        }


def warehouse_exists() -> bool:
    if not DB_PATH.exists():
        return False
    with _connect() as conn:
        cur = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='fact_sales'")
        return cur.fetchone() is not None


def query_warehouse(sql: str) -> pd.DataFrame:
    with _connect() as conn:
        return pd.read_sql(sql, conn)
