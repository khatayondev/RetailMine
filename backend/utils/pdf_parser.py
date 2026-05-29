"""PDF Parser utility for extracting transactional retail data from PDF tables."""
from __future__ import annotations
import re
from pathlib import Path
import pandas as pd
import numpy as np
import pdfplumber

def map_column_name(col_name: str) -> str | None:
    """Semantically map PDF headers to standard Online Retail II headers."""
    c = str(col_name).strip().lower().replace(" ", "").replace("_", "").replace("-", "")
    
    if any(x in c for x in ("invoice", "invno", "invnum", "invcode")):
        return "Invoice"
    if any(x in c for x in ("stock", "prodcode", "productcode", "itemcode", "sku")):
        return "StockCode"
    if any(x in c for x in ("description", "desc", "item", "productname", "product")):
        return "Description"
    if any(x in c for x in ("qty", "quantity", "volume", "units", "amount")):
        return "Quantity"
    if any(x in c for x in ("date", "time", "invoicedate")):
        return "InvoiceDate"
    if any(x in c for x in ("price", "rate", "unitprice", "cost")):
        return "Price"
    if any(x in c for x in ("customer", "custid", "customerid", "client")):
        return "Customer ID"
    if any(x in c for x in ("country", "location", "nation", "region")):
        return "Country"
    return None

def parse_pdf_to_df(pdf_path: Path | str) -> pd.DataFrame:
    """Opens a PDF, extracts visual tables, maps columns, and returns a standard DataFrame."""
    print(f"Parsing PDF dataset: {pdf_path}")
    raw_rows = []
    
    with pdfplumber.open(pdf_path) as pdf:
        for page_idx, page in enumerate(pdf.pages):
            tables = page.extract_tables()
            if not tables:
                # Text-based line parsing fallback if no visual grid borders exist
                text = page.extract_text()
                if text:
                    for line in text.split("\n"):
                        # Check for CSV or Tab aligned text lines
                        parts = [p.strip() for p in re.split(r",|\t| {2,}", line)]
                        if len(parts) >= 6:
                            raw_rows.append(parts)
                continue
                
            for table in tables:
                for row in table:
                    # Clean None values in rows
                    cleaned_row = [str(cell).strip() if cell is not None else "" for cell in row]
                    if any(cleaned_row): # Skip entirely empty rows
                        raw_rows.append(cleaned_row)

    if not raw_rows:
        raise ValueError("Could not extract any tabular data or structured text lines from the PDF file.")

    # Find the header row in our raw rows
    header_idx = 0
    max_matches = 0
    standard_headers = ["Invoice", "StockCode", "Description", "Quantity", "InvoiceDate", "Price", "Customer ID", "Country"]
    
    # Check the first 20 rows to find which one looks most like a header
    for i, row in enumerate(raw_rows[:20]):
        matches = 0
        for cell in row:
            mapped = map_column_name(cell)
            if mapped in standard_headers:
                matches += 1
        if matches > max_matches:
            max_matches = matches
            header_idx = i

    # If we found a header, use it to name the columns; otherwise, assume the first row
    header_row = raw_rows[header_idx]
    data_rows = raw_rows[header_idx + 1:]
    
    # Map the headers semantically
    mapped_headers = []
    for cell in header_row:
        mapped = map_column_name(cell)
        mapped_headers.append(mapped if mapped else cell)
        
    df = pd.DataFrame(data_rows, columns=mapped_headers)
    
    # Remove any columns that mapped to None and drop empty headers
    df = df.loc[:, df.columns.notna()]
    
    # Rename columns to standard ones if there's minor mismatch
    rename_map = {}
    for col in df.columns:
        mapped = map_column_name(str(col))
        if mapped:
            rename_map[col] = mapped
    df = df.rename(columns=rename_map)
    
    # Add any missing standard columns with NaNs to ensure pipeline works
    for col in standard_headers:
        if col not in df.columns:
            df[col] = np.nan
            
    # Clean data types
    # Quantities should be integers
    if "Quantity" in df.columns:
        df["Quantity"] = pd.to_numeric(df["Quantity"].astype(str).str.replace(",", ""), errors="coerce").fillna(0).astype(int)
    # Price should be float
    if "Price" in df.columns:
        df["Price"] = pd.to_numeric(df["Price"].astype(str).str.replace(",", "").str.replace("£", "").str.replace("$", ""), errors="coerce").fillna(0.0).astype(float)
    # Customer ID should be float/integer
    if "Customer ID" in df.columns:
        df["Customer ID"] = pd.to_numeric(df["Customer ID"].astype(str).str.replace(".0", "", regex=False), errors="coerce")
        
    print(f"Successfully extracted {len(df)} rows from PDF. Columns: {df.columns.tolist()}")
    return df
