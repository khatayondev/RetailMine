import { useState } from "react";
import { Play, Database, Check, Loader2, AlertCircle } from "lucide-react";
import { api } from "../lib/api";

const STEPS = [
  { name: "Standardise column names", desc: "Remove spaces, normalize casing" },
  { name: "Drop missing Customer ID", desc: "Cannot cluster without a customer", typicalRemoved: 107927 },
  { name: "Drop missing Description", desc: "Cannot build product baskets", typicalRemoved: 2928 },
  { name: "Remove cancelled invoices", desc: "Invoices starting with C are returns", typicalRemoved: 10206 },
  { name: "Remove non-positive Quantity/Price", desc: "Invalid transactions", typicalRemoved: 16016 },
  { name: "Remove duplicate rows", desc: "Exact duplicates add no information", typicalRemoved: 6865 },
  { name: "Feature engineering", desc: "Revenue, Year, Month, Quarter, RevenueClass...", added: 7 },
];

type Status = "idle" | "running" | "done" | "error";

export function PreprocessPage() {
  const [preStatus, setPreStatus] = useState<Status>("idle");
  const [whStatus, setWhStatus] = useState<Status>("idle");
  const [report, setReport] = useState<any>(null);
  const [whResult, setWhResult] = useState<any>(null);
  const [err, setErr] = useState<string>("");

  const runPreprocess = async () => {
    setPreStatus("running");
    setErr("");
    try {
      const r = await api.preprocess();
      setReport(r);
      setPreStatus("done");
    } catch (e: any) {
      setErr(String(e.message || e));
      setPreStatus("error");
    }
  };

  const buildWarehouse = async () => {
    setWhStatus("running");
    setErr("");
    try {
      const r = await api.buildWarehouse();
      setWhResult(r);
      setWhStatus("done");
    } catch (e: any) {
      setErr(String(e.message || e));
      setWhStatus("error");
    }
  };

  const steps = report?.steps?.length
    ? report.steps.map((s: any, i: number) => ({ ...STEPS[i], ...s }))
    : STEPS.map((s) => ({ ...s, removed: s.typicalRemoved }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <p className="text-xs text-slate-500 mb-1">Raw rows</p>
          <p className="text-2xl font-semibold text-slate-900">{(report?.raw_rows ?? 525461).toLocaleString()}</p>
        </div>
        <div className="bg-[#dff2c8] rounded-2xl p-5 border border-slate-100">
          <p className="text-xs text-slate-600 mb-1">Cleaned rows</p>
          <p className="text-2xl font-semibold text-slate-900">{(report?.clean_rows ?? 400916).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <p className="text-xs text-slate-500 mb-1">Retained</p>
          <p className="text-2xl font-semibold text-slate-900">{report?.retained_pct ?? 76.3}%</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900">Cleaning Pipeline</h3>
            <p className="text-xs text-slate-500">7 sequential steps applied to raw data</p>
          </div>
          <button
            onClick={runPreprocess}
            disabled={preStatus === "running"}
            className="px-4 py-2 rounded-full bg-[#1f4d2b] text-white text-sm font-medium flex items-center gap-2 disabled:opacity-60"
          >
            {preStatus === "running" ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="white" />}
            {preStatus === "running" ? "Running..." : "Run Preprocessing"}
          </button>
        </div>

        <div className="space-y-2">
          {steps.map((s: any, i: number) => {
            const done = preStatus === "done";
            return (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${done ? "bg-[#1f4d2b] text-white" : "bg-white text-slate-500 border border-slate-200"}`}>
                  {done ? <Check size={14} /> : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{s.step || s.name}</p>
                  <p className="text-xs text-slate-500 truncate">{s.desc}</p>
                </div>
                <div className="text-xs text-slate-600">
                  {s.removed ? `-${s.removed.toLocaleString()}` : s.added_columns || s.added ? `+${s.added_columns || s.added} cols` : "—"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900">Data Warehouse</h3>
            <p className="text-xs text-slate-500">Build SQLite star schema (1 fact + 4 dim tables)</p>
          </div>
          <button
            onClick={buildWarehouse}
            disabled={whStatus === "running" || preStatus !== "done"}
            className="px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-medium flex items-center gap-2 disabled:opacity-40"
          >
            {whStatus === "running" ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />}
            Build Warehouse
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {["fact_sales", "dim_date", "dim_customer", "dim_product", "dim_country"].map((t) => {
            const built = whStatus === "done";
            return (
              <div key={t} className={`rounded-xl p-3 border ${built ? "bg-[#dff2c8] border-[#1f4d2b]/20" : "bg-slate-50 border-slate-100"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Database size={12} className={built ? "text-[#1f4d2b]" : "text-slate-400"} />
                  <span className="text-xs font-medium text-slate-900">{t}</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  {built && t === "fact_sales" && whResult ? `${whResult.fact_rows.toLocaleString()} rows` : built ? "loaded" : "pending"}
                </p>
              </div>
            );
          })}
        </div>

        {preStatus !== "done" && (
          <p className="mt-4 text-xs text-slate-500 flex items-center gap-1.5">
            <AlertCircle size={12} /> Run preprocessing first to enable warehouse build.
          </p>
        )}
      </div>

      {err && (
        <div className="bg-rose-50 text-rose-700 rounded-xl p-3 text-sm flex items-center gap-2">
          <AlertCircle size={14} /> {err}
        </div>
      )}
    </div>
  );
}
