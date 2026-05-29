import { useState } from "react";
import { Play, Loader2, AlertCircle } from "lucide-react";
import { api } from "../lib/api";
import { useApi } from "../lib/useApi";

const ELBOW_FALLBACK = {
  recommended_k: 4,
  points: [
    { k: 2, inertia: 9800, silhouette: 0.49 },
    { k: 3, inertia: 7200, silhouette: 0.55 },
    { k: 4, inertia: 5400, silhouette: 0.61 },
    { k: 5, inertia: 4200, silhouette: 0.58 },
    { k: 6, inertia: 3500, silhouette: 0.54 },
    { k: 7, inertia: 3000, silhouette: 0.51 },
    { k: 8, inertia: 2700, silhouette: 0.49 },
    { k: 9, inertia: 2400, silhouette: 0.47 },
    { k: 10, inertia: 2200, silhouette: 0.45 },
  ],
};

const NAMES = ["Champions", "Loyal", "New", "At-Risk", "Dormant", "Lost", "Big Spenders", "Casual"];

const CLUSTER_FALLBACK = {
  silhouette: 0.61,
  inertia: 5400,
  profile: [
    { cluster: 0, recency: 12, frequency: 9, monetary: 4200, count: 1228 },
    { cluster: 1, recency: 30, frequency: 3, monetary: 800, count: 965 },
    { cluster: 2, recency: 90, frequency: 2, monetary: 400, count: 1314 },
    { cluster: 3, recency: 200, frequency: 1, monetary: 120, count: 876 },
  ],
  points: Array.from({ length: 200 }).map(() => {
    const c = Math.floor(Math.random() * 4);
    const base = [{ r: 12, f: 9, m: 4200 }, { r: 30, f: 3, m: 800 }, { r: 90, f: 2, m: 400 }, { r: 200, f: 1, m: 120 }][c];
    return {
      r: base.r + (Math.random() - 0.5) * base.r * 0.6,
      f: Math.max(1, base.f + (Math.random() - 0.5) * 3),
      m: Math.max(50, base.m + (Math.random() - 0.5) * base.m),
      c,
    };
  }),
};

const COLORS = ["#1f4d2b", "#3a7d44", "#f59e0b", "#ef4444", "#7c3aed", "#0ea5e9", "#84cc16", "#ec4899"];

export function ClusterPage() {
  const { data: elbow } = useApi(() => api.clusterElbow(), ELBOW_FALLBACK, []);
  const elbowData = elbow?.points?.length ? elbow : ELBOW_FALLBACK;

  const [k, setK] = useState(4);
  const [algorithm, setAlgorithm] = useState<"kmeans" | "hierarchical">("kmeans");
  const [linkage, setLinkage] = useState<"ward" | "complete" | "average">("ward");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(CLUSTER_FALLBACK);
  const [err, setErr] = useState("");

  const run = async () => {
    setRunning(true);
    setErr("");
    try {
      const r = await api.cluster({ k, algorithm, linkage });
      setResult(r);
    } catch (e: any) {
      setErr(String(e.message || e));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Kpi label="Customers (RFM)" value={result.profile.reduce((s: number, p: any) => s + p.count, 0).toLocaleString()} />
        <Kpi label="Silhouette Score" value={result.silhouette.toFixed(3)} accent />
        <Kpi label="Inertia" value={Math.round(result.inertia).toLocaleString()} />
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900">Elbow Analysis</h3>
            <p className="text-xs text-slate-500">Inertia and silhouette vs k · recommended k = {elbowData.recommended_k}</p>
          </div>
        </div>
        <ElbowChart data={elbowData.points} />
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
          <div>
            <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider mb-2">Algorithm</p>
            <div className="flex gap-2">
              {(["kmeans", "hierarchical"] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setAlgorithm(a)}
                  className={`flex-1 px-3 py-1.5 rounded-lg font-medium border ${algorithm === a ? "bg-[#1f4d2b] text-white border-[#1f4d2b]" : "bg-white text-slate-600 border-slate-200"}`}
                >
                  {a === "kmeans" ? "K-Means" : "Hierarchical"}
                </button>
              ))}
            </div>
          </div>
          
          {algorithm === "hierarchical" && (
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider mb-2">Linkage Method</p>
              <select
                value={linkage}
                onChange={(e) => setLinkage(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 outline-none font-medium text-slate-700 font-sans"
              >
                <option value="ward">Ward</option>
                <option value="complete">Complete</option>
                <option value="average">Average</option>
              </select>
            </div>
          )}

          <div className={algorithm === "hierarchical" ? "col-span-1" : "col-span-2"}>
            <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider mb-2">Number of Clusters (k): {k}</p>
            <input type="range" min={2} max={8} value={k} onChange={(e) => setK(Number(e.target.value))} className="w-full mt-2" />
          </div>
          <div className="flex items-end justify-end">
            <button onClick={run} disabled={running} className="w-full px-5 py-2.5 rounded-full bg-[#1f4d2b] text-white text-xs font-medium flex items-center justify-center gap-2 disabled:opacity-60">
              {running ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} fill="white" />}
              Run Clustering
            </button>
          </div>
        </div>
        {err && <div className="mt-4 text-xs text-rose-600 flex items-center gap-1.5"><AlertCircle size={12} />{err}</div>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <h3 className="font-semibold text-slate-900 mb-1">Recency vs Monetary</h3>
          <p className="text-xs text-slate-500 mb-4">Sampled customers · color = cluster</p>
          <ScatterPlot points={result.points} xKey="r" yKey="m" xLabel="Recency (days)" yLabel="Monetary (£)" />
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <h3 className="font-semibold text-slate-900 mb-1">Frequency vs Monetary</h3>
          <p className="text-xs text-slate-500 mb-4">Sampled customers · color = cluster</p>
          <ScatterPlot points={result.points} xKey="f" yKey="m" xLabel="Frequency" yLabel="Monetary (£)" />
        </div>
      </div>

      {algorithm === "hierarchical" && result.dendrogram && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <h3 className="font-semibold text-slate-900 mb-1">🌿 Cluster Dendrogram (300-Customer Sample)</h3>
          <p className="text-xs text-slate-500 mb-4">Hierarchical tree structure using {linkage} linkage</p>
          <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-center border border-slate-100">
            <img src={`data:image/png;base64,${result.dendrogram}`} alt="Dendrogram" className="max-w-full h-auto rounded-lg shadow-sm" />
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <h3 className="font-semibold text-slate-900 mb-1">Cluster Profile</h3>
        <p className="text-xs text-slate-500 mb-4">Average RFM per cluster</p>
        <div className="overflow-auto rounded-xl border border-slate-100">
          <table className="w-full text-xs">
            <thead className="bg-slate-50">
              <tr>
                {["Cluster", "Label", "Customers", "Recency", "Frequency", "Monetary", "Share"].map((h) => (
                  <th key={h} className="text-left px-3 py-2 font-medium text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.profile.map((p: any) => {
                const total = result.profile.reduce((s: number, x: any) => s + x.count, 0);
                return (
                  <tr key={p.cluster} className="border-t border-slate-100">
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ background: COLORS[p.cluster % COLORS.length] }} />
                        {p.cluster}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-medium text-slate-900">{NAMES[p.cluster] || `Segment ${p.cluster}`}</td>
                    <td className="px-3 py-2 text-slate-700">{p.count.toLocaleString()}</td>
                    <td className="px-3 py-2 text-slate-700">{Math.round(p.recency)} days</td>
                    <td className="px-3 py-2 text-slate-700">{p.frequency.toFixed(1)}</td>
                    <td className="px-3 py-2 text-slate-700">£{p.monetary.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="px-3 py-2">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden w-24">
                        <div className="h-full" style={{ width: `${(p.count / total) * 100}%`, background: COLORS[p.cluster % COLORS.length] }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 border border-slate-100 ${accent ? "bg-[#dff2c8]" : "bg-white"}`}>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function ElbowChart({ data }: { data: { k: number; inertia: number; silhouette: number }[] }) {
  const W = 600, H = 200, pad = 36;
  const maxI = Math.max(...data.map((d) => d.inertia));
  const maxS = Math.max(...data.map((d) => d.silhouette), 1);
  const xStep = (W - pad * 2) / (data.length - 1);

  const linePath = (key: "inertia" | "silhouette", max: number) =>
    data.map((d, i) => `${i === 0 ? "M" : "L"} ${pad + i * xStep} ${H - pad - (d[key] / max) * (H - pad * 2)}`).join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[220px]">
        <path d={linePath("inertia", maxI)} fill="none" stroke="#1f4d2b" strokeWidth="2.5" />
        <path d={linePath("silhouette", maxS)} fill="none" stroke="#f59e0b" strokeWidth="2.5" />
        {data.map((d, i) => (
          <g key={d.k}>
            <circle cx={pad + i * xStep} cy={H - pad - (d.inertia / maxI) * (H - pad * 2)} r="3" fill="#1f4d2b" />
            <circle cx={pad + i * xStep} cy={H - pad - (d.silhouette / maxS) * (H - pad * 2)} r="3" fill="#f59e0b" />
            <text x={pad + i * xStep} y={H - 10} fontSize="10" fill="#94a3b8" textAnchor="middle">k={d.k}</text>
          </g>
        ))}
      </svg>
      <div className="flex items-center gap-6 mt-3 text-xs">
        <Legend color="#1f4d2b" label="Inertia (lower = tighter)" />
        <Legend color="#f59e0b" label="Silhouette (higher = better)" />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-slate-600">
      <span className="w-3 h-3 rounded-full" style={{ background: color }} />
      {label}
    </div>
  );
}

function ScatterPlot({ points, xKey, yKey, xLabel, yLabel }: { points: any[]; xKey: string; yKey: string; xLabel: string; yLabel: string }) {
  const W = 400, H = 280, pad = 30;
  const xs = points.map((p) => p[xKey]);
  const ys = points.map((p) => p[yKey]);
  const xMax = Math.max(...xs), yMax = Math.max(...ys);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[240px]">
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#e2e8f0" />
        <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="#e2e8f0" />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={pad + (p[xKey] / xMax) * (W - pad * 2)}
            cy={H - pad - (p[yKey] / yMax) * (H - pad * 2)}
            r="3"
            fill={COLORS[p.c % COLORS.length]}
            opacity="0.7"
          />
        ))}
        <text x={W / 2} y={H - 5} fontSize="9" textAnchor="middle" fill="#94a3b8">{xLabel}</text>
        <text x={10} y={H / 2} fontSize="9" textAnchor="middle" fill="#94a3b8" transform={`rotate(-90, 10, ${H / 2})`}>{yLabel}</text>
      </svg>
    </div>
  );
}
