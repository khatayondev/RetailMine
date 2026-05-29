import { api } from "../lib/api";
import { useApi } from "../lib/useApi";

const FALLBACK = {
  retained_pct: 76,
  steps: [
    { step: "Standardise cols" },
    { step: "Drop missing IDs", removed: 107927 },
    { step: "Remove cancelled", removed: 10206 },
    { step: "Drop duplicates", removed: 6865 },
    { step: "Feature engineering", added_columns: 7 },
  ],
};

export function ProjectProgress() {
  const { data, error } = useApi(() => api.etlProgress(), FALLBACK as any, []);
  const report = error ? FALLBACK : data;
  const pct = Math.round(report.retained_pct);
  const r = 60;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">ETL Progress</h3>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative w-[150px] h-[150px]">
          <svg viewBox="0 0 150 150" className="w-full h-full -rotate-90">
            <circle cx="75" cy="75" r={r} stroke="#f3f4ef" strokeWidth="14" fill="none" />
            <circle cx="75" cy="75" r={r} stroke="#1f4d2b" strokeWidth="14" fill="none" strokeLinecap="round" strokeDasharray={`${dash} ${c}`} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-slate-900">{pct}%</span>
            <span className="text-[10px] text-slate-500">retained</span>
          </div>
        </div>
        <div className="flex-1 space-y-2 text-xs">
          {(report.steps || []).slice(0, 5).map((s: any, i: number) => (
            <Row
              key={i}
              label={s.step}
              sub={s.removed ? `-${s.removed.toLocaleString()}` : s.added_columns ? `+${s.added_columns} cols` : undefined}
              green={!!s.added_columns}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ label, sub, green }: { label: string; sub?: string; green?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full ${green ? "bg-[#1f4d2b]" : "bg-slate-300"}`} />
        <span className="text-slate-700">{label}</span>
      </div>
      {sub && <span className="text-slate-400">{sub}</span>}
    </div>
  );
}
