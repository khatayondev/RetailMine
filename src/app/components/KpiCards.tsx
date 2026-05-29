import { ArrowUpRight } from "lucide-react";
import { api } from "../lib/api";
import { useApi } from "../lib/useApi";

const FALLBACK = { transactions: 525461, clean_rows: 400916, customers: 4383, products: 4681, retained_pct: 76.3 };

export function KpiCards() {
  const { data } = useApi(() => api.kpis(), FALLBACK as any, []);
  const k = data.transactions ? data : FALLBACK;

  const fmt = (n: number) => n.toLocaleString();
  const kpis = [
    { label: "Total Transactions", value: fmt(k.transactions), sub: "Raw rows ingested", accent: "bg-[#dff2c8]" },
    { label: "Cleaned Rows", value: fmt(k.clean_rows), sub: `${k.retained_pct}% retained`, accent: "bg-white" },
    { label: "Unique Customers", value: fmt(k.customers), sub: "Across 40 countries", accent: "bg-white" },
    { label: "Unique Products", value: fmt(k.products), sub: "Distinct descriptions", accent: "bg-white" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((k) => (
        <div key={k.label} className={`${k.accent} rounded-2xl p-5 border border-slate-100`}>
          <div className="flex items-start justify-between mb-3">
            <span className="text-sm text-slate-600">{k.label}</span>
            <button className="w-7 h-7 rounded-full bg-white/70 border border-slate-200 flex items-center justify-center">
              <ArrowUpRight size={14} className="text-slate-700" />
            </button>
          </div>
          <div className="text-[32px] font-semibold text-slate-900 leading-none mb-2">{k.value}</div>
          <p className="text-xs text-slate-500">{k.sub}</p>
        </div>
      ))}
    </div>
  );
}
