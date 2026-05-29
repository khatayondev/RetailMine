const BASE = (import.meta as any).env?.VITE_API_URL || "http://localhost:8000";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

export const api = {
  health: () => req<{ ok: boolean; dataset_present: boolean; clean_loaded: boolean; warehouse_built: boolean }>(`/api/health`),
  upload: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return fetch(`${BASE}/api/upload`, { method: "POST", body: fd }).then((r) => r.json());
  },
  datasetPreview: (rows = 20) => req<{ rows: number; columns: any[]; preview: any[]; memory_mb: number; duplicates: number }>(`/api/dataset/preview?rows=${rows}`),
  preprocess: () => req<any>(`/api/preprocess`, { method: "POST" }),
  buildWarehouse: () => req<any>(`/api/warehouse/build`, { method: "POST" }),
  datasetStats: () => req<any[]>(`/api/dataset/stats`),
  datasetInvoices: (n = 50) => req<string[]>(`/api/dataset/invoices?n=${n}`),
  datasetInvoiceDetails: (id: string) => req<any[]>(`/api/dataset/invoice/${id}`),
  kpis: () => req<{ transactions: number; clean_rows: number; customers: number; products: number; countries?: number; retained_pct: number }>(`/api/kpis`),
  salesTrend: () => req<{ points: { m: string; v: number; peak?: boolean }[] }>(`/api/sales-trend`),
  etlProgress: () => req<any>(`/api/etl-progress`),
  segments: () => req<{ segments: { name: string; size: number; recency: number; frequency: number; monetary: number }[] }>(`/api/segments`),
  exploreKpis: () => req<any>(`/api/explore/kpis`),
  exploreBar: (dimension: string, n = 10) => req<{ items: { label: string; value: number }[] }>(`/api/explore/bar?dimension=${dimension}&n=${n}`),
  explorePie: (dimension: string) => req<{ items: { label: string; value: number }[] }>(`/api/explore/pie?dimension=${dimension}`),
  exploreLine: (grain: string = "month") => req<{ points: { label: string; revenue: number; orders: number }[] }>(`/api/explore/line?grain=${grain}`),
  exploreHistogram: (column: string, bins = 30) => req<{ bins: { x: number; count: number }[]; mean: number; median: number; std: number; max: number }>(`/api/explore/histogram?column=${column}&bins=${bins}`),
  exploreCorrelation: () => req<{ columns: string[]; matrix: number[][] }>(`/api/explore/correlation`),
  exploreTopCountries: (n = 10) => req<{ items: { country: string; transactions: number; revenue: number }[] }>(`/api/explore/top-countries?n=${n}`),
  bestModel: () => req<{ results: any[]; best: { name: string; accuracy: number } }>(`/api/best-model`),
  classify: (body: any) => req<any>(`/api/classify`, { method: "POST", body: JSON.stringify(body) }),
  cluster: (body: any) => req<any>(`/api/cluster`, { method: "POST", body: JSON.stringify(body) }),
  clusterElbow: () => req<{ points: { k: number; inertia: number; silhouette: number }[]; recommended_k: number }>(`/api/cluster/elbow`),
  associate: (body: any) => req<any>(`/api/associate`, { method: "POST", body: JSON.stringify(body) }),
};
