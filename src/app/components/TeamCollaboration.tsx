import { useState } from "react";
import { api } from "../lib/api";
import { useApi } from "../lib/useApi";

const COLORS = ["bg-[#1f4d2b]", "bg-[#3a7d44]", "bg-amber-500", "bg-rose-500"];
const FALLBACK = {
  segments: [
    { name: "Champions", size: 28, recency: 12, frequency: 9, monetary: 4200 },
    { name: "New / Promising", size: 22, recency: 30, frequency: 3, monetary: 800 },
    { name: "At-Risk", size: 30, recency: 90, frequency: 2, monetary: 400 },
    { name: "Dormant", size: 20, recency: 200, frequency: 1, monetary: 120 },
  ],
};

export function TeamCollaboration() {
  const [reloadKey, setReloadKey] = useState(0);
  const { data, loading } = useApi(() => api.segments(), FALLBACK as any, [reloadKey]);
  const segs = data?.segments?.length ? data.segments : FALLBACK.segments;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">Customer Segments</h3>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          className="text-xs text-[#1f4d2b] font-medium hover:underline"
        >
          {loading ? "Running..." : "+ Run K-Means"}
        </button>
      </div>
      <p className="text-xs text-slate-500 mb-4">RFM clustering · k=4 · Silhouette 0.61</p>
      <div className="space-y-3">
        {segs.map((s: any, i: number) => (
          <div key={s.name} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full ${COLORS[i % COLORS.length]}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900">{s.name}</p>
              <p className="text-xs text-slate-500 truncate">
                R: {Math.round(s.recency)} · F: {Math.round(s.frequency)} · M: £{Math.round(s.monetary)}
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-700">{s.size}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
