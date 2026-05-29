import { useState, useEffect } from "react";
import { FileSpreadsheet, Database, AlertTriangle, Hash, Layers, TrendingUp, Receipt } from "lucide-react";
import { api } from "../lib/api";
import { useApi } from "../lib/useApi";

const FALLBACK = {
  rows: 525461,
  duplicates: 6865,
  memory_mb: 290,
  columns: [
    { name: "Invoice", dtype: "object", non_null: 525461, nulls: 0, null_pct: 0, unique: 28816, sample: "489434" },
    { name: "StockCode", dtype: "object", non_null: 525461, nulls: 0, null_pct: 0, unique: 4681, sample: "85048" },
    { name: "Description", dtype: "object", non_null: 522533, nulls: 2928, null_pct: 0.56, unique: 4681, sample: "15CM CHRISTMAS GLASS BALL 20 LIGHTS" },
    { name: "Quantity", dtype: "int64", non_null: 525461, nulls: 0, null_pct: 0, unique: 825, sample: "12" },
    { name: "InvoiceDate", dtype: "datetime64[ns]", non_null: 525461, nulls: 0, null_pct: 0, unique: 25296, sample: "2009-12-01 07:45:00" },
    { name: "Price", dtype: "float64", non_null: 525461, nulls: 0, null_pct: 0, unique: 1606, sample: "6.95" },
    { name: "Customer ID", dtype: "float64", non_null: 417534, nulls: 107927, null_pct: 20.54, unique: 4383, sample: "13085.0" },
    { name: "Country", dtype: "object", non_null: 525461, nulls: 0, null_pct: 0, unique: 40, sample: "United Kingdom" },
  ],
  preview: Array.from({ length: 8 }).map((_, i) => ({
    Invoice: 489434 + i,
    StockCode: ["85048", "79323P", "79323W", "22041", "21232", "22064", "21871", "21523"][i],
    Description: ["15CM CHRISTMAS GLASS BALL", "PINK CHERRY LIGHTS", "WHITE CHERRY LIGHTS", "RECORD FRAME 7\" SINGLE", "STRAWBERRY CERAMIC TRINKET BOX", "PINK DOUGHNUT TRINKET POT", "SAVE THE PLANET MUG", "DOORMAT FANCY FONT HOME SWEET HOME"][i],
    Quantity: [12, 12, 12, 48, 24, 24, 6, 10][i],
    InvoiceDate: "2009-12-01 07:45:00",
    Price: [6.95, 6.75, 6.75, 2.1, 1.25, 1.65, 2.5, 7.95][i],
    "Customer ID": "13085.0",
    Country: "United Kingdom",
  })),
};

const STATS_FALLBACK = [
  { metric: "count", Quantity: 1520, Price: 1520 },
  { metric: "mean", Quantity: 17.52, Price: 3.42 },
  { metric: "std", Quantity: 24.11, Price: 2.89 },
  { metric: "min", Quantity: -10, Price: 0 },
  { metric: "25%", Quantity: 4, Price: 1.65 },
  { metric: "50%", Quantity: 12, Price: 2.50 },
  { metric: "75%", Quantity: 24, Price: 4.95 },
  { metric: "max", Quantity: 96, Price: 12.75 }
];

const INVOICES_FALLBACK = ["489434", "489435", "489436", "489437", "489438"];

export function DatasetPage() {
  const [rows, setRows] = useState(20);
  const { data, loading, error } = useApi(() => api.datasetPreview(rows), FALLBACK as any, [rows]);
  const d = data?.columns?.length ? data : FALLBACK;

  const { data: statsData, loading: statsLoading } = useApi(() => api.datasetStats(), STATS_FALLBACK as any, []);
  const { data: invoices } = useApi(() => api.datasetInvoices(), INVOICES_FALLBACK as any, []);

  const [selectedInvoice, setSelectedInvoice] = useState("");
  const [invoiceDetails, setInvoiceDetails] = useState<any[]>([]);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  useEffect(() => {
    if (!selectedInvoice) {
      setInvoiceDetails([]);
      return;
    }
    setInvoiceLoading(true);
    api.datasetInvoiceDetails(selectedInvoice)
      .then((res) => setInvoiceDetails(res))
      .catch((err) => console.error(err))
      .finally(() => setInvoiceLoading(false));
  }, [selectedInvoice]);

  const kpis = [
    { icon: Hash, label: "Total Rows", value: d.rows.toLocaleString() },
    { icon: Layers, label: "Columns", value: String(d.columns.length) },
    { icon: AlertTriangle, label: "Duplicates", value: d.duplicates.toLocaleString() },
    { icon: Database, label: "Memory", value: `${d.memory_mb} MB` },
    { icon: FileSpreadsheet, label: "Missing", value: d.columns.reduce((s: number, c: any) => s + c.nulls, 0).toLocaleString() },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#dff2c8] flex items-center justify-center text-[#1f4d2b]">
                <k.icon size={16} />
              </div>
              <span className="text-xs text-slate-500">{k.label}</span>
            </div>
            <div className="text-xl font-semibold text-slate-900">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900">Data Preview</h3>
            <p className="text-xs text-slate-500">
              {error ? "Showing sample data · backend offline" : loading ? "Loading..." : `First ${rows} rows`}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Rows</span>
            <input
              type="number"
              min={5}
              max={100}
              value={rows}
              onChange={(e) => setRows(Math.max(5, Math.min(100, Number(e.target.value) || 20)))}
              className="w-20 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full outline-none"
            />
          </div>
        </div>
        <div className="overflow-auto max-h-[320px] rounded-xl border border-slate-100">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                {d.columns.map((c: any) => (
                  <th key={c.name} className="text-left px-3 py-2 font-medium text-slate-600 whitespace-nowrap">{c.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.preview.map((row: any, i: number) => (
                <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                  {d.columns.map((c: any) => (
                    <td key={c.name} className="px-3 py-2 text-slate-700 whitespace-nowrap max-w-[220px] truncate">{String(row[c.name] ?? "")}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Descriptive Statistics */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <h3 className="font-semibold text-slate-900 mb-1">📈 Descriptive Statistics</h3>
        <p className="text-xs text-slate-500 mb-4">Summary statistics for numeric attributes</p>
        {statsLoading ? (
          <p className="text-xs text-slate-400">Loading statistics...</p>
        ) : statsData && statsData.length > 0 ? (
          <div className="overflow-auto rounded-xl border border-slate-100">
            <table className="w-full text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-3 py-2 font-medium text-slate-600">Metric</th>
                  {Object.keys(statsData[0]).filter(k => k !== "metric").map((col) => (
                    <th key={col} className="text-left px-3 py-2 font-medium text-slate-600">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {statsData.map((row: any, i: number) => (
                  <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2 font-semibold text-slate-700 capitalize">{row.metric}</td>
                    {Object.keys(row).filter(k => k !== "metric").map((col) => (
                      <td key={col} className="px-3 py-2 text-slate-600">
                        {typeof row[col] === 'number' ? row[col].toLocaleString(undefined, { maximumFractionDigits: 2 }) : row[col]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400">No descriptive statistics available.</p>
        )}
      </div>

      {/* Invoice Viewer */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900">🧾 Invoice Line Item Lookup</h3>
            <p className="text-xs text-slate-500">Pick an invoice ID to inspect transaction details</p>
          </div>
          {invoices && invoices.length > 0 && (
            <select
              value={selectedInvoice}
              onChange={(e) => setSelectedInvoice(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-full px-4 py-2 outline-none font-medium text-slate-700"
            >
              <option value="">Select Invoice...</option>
              {invoices.map((inv: string) => (
                <option key={inv} value={inv}>Invoice #{inv}</option>
              ))}
            </select>
          )}
        </div>

        {selectedInvoice ? (
          invoiceLoading ? (
            <p className="text-xs text-slate-400">Loading invoice details...</p>
          ) : invoiceDetails && invoiceDetails.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-xl">
                <div>
                  <span className="text-slate-500">Invoice ID</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{selectedInvoice}</p>
                </div>
                <div>
                  <span className="text-slate-500">Customer ID</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{invoiceDetails[0]?.CustomerID || invoiceDetails[0]?.["Customer ID"] || "N/A"}</p>
                </div>
                <div>
                  <span className="text-slate-500">Country</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{invoiceDetails[0]?.Country || "N/A"}</p>
                </div>
                <div>
                  <span className="text-slate-500">Invoice Date</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{invoiceDetails[0]?.InvoiceDate || "N/A"}</p>
                </div>
              </div>
              <div className="overflow-auto rounded-xl border border-slate-100 max-h-[220px]">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-slate-600">Stock Code</th>
                      <th className="text-left px-3 py-2 font-medium text-slate-600">Description</th>
                      <th className="text-right px-3 py-2 font-medium text-slate-600">Qty</th>
                      <th className="text-right px-3 py-2 font-medium text-slate-600">Price</th>
                      <th className="text-right px-3 py-2 font-medium text-slate-600">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceDetails.map((item: any, i: number) => {
                      const qty = Number(item.Quantity || 0);
                      const price = Number(item.Price || 0);
                      return (
                        <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                          <td className="px-3 py-2 font-mono text-slate-600">{item.StockCode}</td>
                          <td className="px-3 py-2 font-medium text-slate-900">{item.Description}</td>
                          <td className="px-3 py-2 text-right text-slate-700">{qty.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right text-slate-700">£{price.toFixed(2)}</td>
                          <td className="px-3 py-2 text-right font-semibold text-[#1f4d2b]">£{(qty * price).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">No details found for this invoice.</p>
          )
        ) : (
          <p className="text-xs text-slate-400 text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">Please select an invoice from the dropdown to view details</p>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <h3 className="font-semibold text-slate-900 mb-1">Column Information</h3>
        <p className="text-xs text-slate-500 mb-4">Types, missing counts, uniqueness</p>
        <div className="overflow-auto rounded-xl border border-slate-100">
          <table className="w-full text-xs">
            <thead className="bg-slate-50">
              <tr>
                {["Column", "Type", "Non-null", "Null", "Null %", "Unique", "Sample"].map((h) => (
                  <th key={h} className="text-left px-3 py-2 font-medium text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.columns.map((c: any) => (
                <tr key={c.name} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-medium text-slate-900">{c.name}</td>
                  <td className="px-3 py-2 text-slate-600">{c.dtype}</td>
                  <td className="px-3 py-2 text-slate-600">{c.non_null.toLocaleString()}</td>
                  <td className="px-3 py-2 text-slate-600">{c.nulls.toLocaleString()}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded-full ${c.null_pct > 5 ? "bg-rose-50 text-rose-700" : "bg-slate-50 text-slate-600"}`}>
                      {c.null_pct}%
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-600">{c.unique.toLocaleString()}</td>
                  <td className="px-3 py-2 text-slate-500 max-w-[260px] truncate">{c.sample}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
