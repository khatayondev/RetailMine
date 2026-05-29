import { useMemo } from "react";
import { api } from "../lib/api";
import { useApi } from "../lib/useApi";

const FALLBACK = {
  points: [
    { m: "Jan", v: 38 }, { m: "Feb", v: 52 }, { m: "Mar", v: 41 }, { m: "Apr", v: 60 },
    { m: "May", v: 48 }, { m: "Jun", v: 55 }, { m: "Jul", v: 70 }, { m: "Aug", v: 62 },
    { m: "Sep", v: 78 }, { m: "Oct", v: 84 }, { m: "Nov", v: 96, peak: true }, { m: "Dec", v: 88 },
  ],
};

export function AnalyticsChart() {
  const { data, error } = useApi(() => api.salesTrend(), FALLBACK as any, []);

  const points = useMemo(() => {
    const raw = (data?.points?.length ? data.points : FALLBACK.points) as { m: string; v: number; peak?: boolean }[];
    return raw.map((p, idx) => ({ ...p, id: `${idx}-${p.m}` }));
  }, [data]);

  const max = Math.max(...points.map((p) => p.v), 1);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-900">Sales Analytics</h3>
          <p className="text-xs text-slate-500">
            {error ? "Showing sample data · backend offline" : "Monthly revenue · Dec 2009 – Dec 2010"}
          </p>
        </div>
        <select className="text-xs bg-slate-50 border border-slate-100 rounded-full px-3 py-1.5 outline-none">
          <option>This Year</option>
          <option>Last 6 Months</option>
        </select>
      </div>
      <div className="h-[220px] w-full flex items-end gap-2 px-1">
        {points.map((p) => {
          const h = (p.v / max) * 100;
          return (
            <div key={p.id} className="flex-1 flex flex-col items-center gap-2 group min-w-0">
              <div className="relative w-full flex-1 flex items-end">
                <div
                  className={`w-full rounded-lg transition-all ${p.peak ? "bg-[#1f4d2b]" : "bg-[#dff2c8]"} group-hover:opacity-80`}
                  style={{ height: `${h}%` }}
                  title={`${p.m}: ${p.v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                />
              </div>
              <span className="text-[10px] text-slate-400 truncate w-full text-center">{p.m}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
