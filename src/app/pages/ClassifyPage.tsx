import { useState } from "react";
import { Play, Loader2, Trophy, AlertCircle } from "lucide-react";
import { api } from "../lib/api";

const FEATURES = ["Quantity", "Price", "Month", "Quarter", "CountryCode"];
const DEFAULT_FEATURES = ["Quantity", "Price", "Month", "Quarter"];

const FALLBACK = {
  labels: ["High", "Low", "Medium"],
  train_size: 320733,
  test_size_n: 80184,
  results: [
    { name: "Decision Tree", accuracy: 0.9987, precision: 0.9987, recall: 0.9987, f1: 0.9987,
      confusion_matrix: [[26720, 5, 3], [4, 26733, 8], [6, 7, 26698]],
      feature_importance: [{ feature: "Quantity", value: 0.61 }, { feature: "Price", value: 0.32 }, { feature: "Month", value: 0.04 }, { feature: "Quarter", value: 0.03 }] },
    { name: "Random Forest", accuracy: 0.9999, precision: 0.9999, recall: 0.9999, f1: 0.9999,
      confusion_matrix: [[26727, 1, 0], [0, 26744, 1], [1, 1, 26709]],
      feature_importance: [{ feature: "Quantity", value: 0.58 }, { feature: "Price", value: 0.35 }, { feature: "Month", value: 0.04 }, { feature: "Quarter", value: 0.03 }] },
    { name: "Naive Bayes", accuracy: 0.5238, precision: 0.521, recall: 0.524, f1: 0.487,
      confusion_matrix: [[12450, 8123, 6155], [5821, 14233, 6691], [4998, 8472, 13241]], feature_importance: null },
    { name: "K-Nearest Neighbour", accuracy: 0.989, precision: 0.989, recall: 0.989, f1: 0.989,
      confusion_matrix: [[26450, 152, 126], [134, 26421, 190], [149, 178, 26384]], feature_importance: null },
  ],
};

type State = "idle" | "running" | "done" | "error";

export function ClassifyPage() {
  const [features, setFeatures] = useState<string[]>(DEFAULT_FEATURES);
  const [testSize, setTestSize] = useState(0.2);
  const [state, setState] = useState<State>("idle");
  const [result, setResult] = useState<any>(FALLBACK);
  const [err, setErr] = useState("");
  const [activeModel, setActiveModel] = useState(1);

  const run = async () => {
    setState("running");
    setErr("");
    try {
      const r = await api.classify({ features, test_size: testSize });
      setResult(r);
      setState("done");
    } catch (e: any) {
      setErr(String(e.message || e));
      setState("error");
    }
  };

  const toggleFeature = (f: string) => {
    setFeatures((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));
  };

  const best = result.results.reduce((a: any, b: any) => (b.accuracy > a.accuracy ? b : a));
  const active = result.results[activeModel];

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Features</p>
            <div className="flex flex-wrap gap-2">
              {FEATURES.map((f) => {
                const on = features.includes(f);
                return (
                  <button
                    key={f}
                    onClick={() => toggleFeature(f)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border ${on ? "bg-[#1f4d2b] text-white border-[#1f4d2b]" : "bg-white text-slate-600 border-slate-200"}`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Test Size: {(testSize * 100).toFixed(0)}%</p>
            <input type="range" min={10} max={40} value={testSize * 100} onChange={(e) => setTestSize(Number(e.target.value) / 100)} className="w-full" />
            <p className="text-xs text-slate-500 mt-2">Train {result.train_size?.toLocaleString()} · Test {result.test_size_n?.toLocaleString()}</p>
          </div>
          <div className="flex items-end justify-end">
            <button onClick={run} disabled={state === "running"} className="px-5 py-2.5 rounded-full bg-[#1f4d2b] text-white text-sm font-medium flex items-center gap-2 disabled:opacity-60">
              {state === "running" ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="white" />}
              Run All Classifiers
            </button>
          </div>
        </div>
        {err && <div className="mt-4 text-xs text-rose-600 flex items-center gap-1.5"><AlertCircle size={12} />{err}</div>}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Model Comparison</h3>
          <div className="flex items-center gap-2 text-xs text-[#1f4d2b]">
            <Trophy size={14} />
            <span className="font-medium">Best: {best.name} · {(best.accuracy * 100).toFixed(2)}%</span>
          </div>
        </div>
        <div className="overflow-auto rounded-xl border border-slate-100">
          <table className="w-full text-xs">
            <thead className="bg-slate-50">
              <tr>
                {["Algorithm", "Accuracy", "Precision", "Recall", "F1-Score"].map((h) => (
                  <th key={h} className="text-left px-3 py-2 font-medium text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.results.map((r: any) => {
                const isBest = r.name === best.name;
                return (
                  <tr key={r.name} className={`border-t border-slate-100 ${isBest ? "bg-[#dff2c8]/40" : ""}`}>
                    <td className="px-3 py-2 font-medium text-slate-900 flex items-center gap-2">
                      {isBest && <Trophy size={12} className="text-[#1f4d2b]" />}
                      {r.name}
                    </td>
                    {["accuracy", "precision", "recall", "f1"].map((m) => (
                      <td key={m} className="px-3 py-2 text-slate-700">{(r[m] * 100).toFixed(2)}%</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <MetricsBars results={result.results} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-100 px-2 overflow-x-auto">
          {result.results.map((r: any, i: number) => (
            <button
              key={r.name}
              onClick={() => setActiveModel(i)}
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${activeModel === i ? "border-[#1f4d2b] text-[#1f4d2b]" : "border-transparent text-slate-500"}`}
            >
              {r.name}
            </button>
          ))}
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Accuracy", v: active.accuracy },
              { label: "Precision", v: active.precision },
              { label: "Recall", v: active.recall },
              { label: "F1-Score", v: active.f1 },
            ].map((m) => (
              <div key={m.label} className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">{m.label}</p>
                <p className="text-lg font-semibold text-slate-900 mt-1">{(m.v * 100).toFixed(2)}%</p>
              </div>
            ))}
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Confusion Matrix</h4>
            <ConfusionMatrix matrix={active.confusion_matrix} labels={result.labels} />
          </div>

          {active.feature_importance && (
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Feature Importance</h4>
              <div className="space-y-2">
                {active.feature_importance.map((f: any) => (
                  <div key={f.feature} className="flex items-center gap-3 text-xs">
                    <span className="w-24 text-slate-700">{f.feature}</span>
                    <div className="flex-1 h-5 bg-slate-50 rounded-lg overflow-hidden">
                      <div className="h-full bg-[#1f4d2b]" style={{ width: `${f.value * 100}%` }} />
                    </div>
                    <span className="w-12 text-right text-slate-600">{(f.value * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active.name === "Decision Tree" && active.dt_rules && (
            <div className="mt-5 border-t border-slate-100 pt-5">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">📜 Decision Tree Rules (Top 3 Levels)</h4>
              <p className="text-xs text-slate-500 mb-3">Rules extracted using scikit-learn's export_text</p>
              <pre className="bg-slate-50 border border-slate-100 rounded-xl p-4 font-mono text-[11px] text-slate-700 overflow-auto max-h-[260px] leading-relaxed">
                {active.dt_rules}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricsBars({ results }: { results: any[] }) {
  const metrics = ["accuracy", "precision", "recall", "f1"];
  const colors = ["#1f4d2b", "#3a7d44", "#7bb069", "#dff2c8"];
  return (
    <div className="mt-5">
      <div className="grid grid-cols-4 gap-3">
        {metrics.map((m, mi) => (
          <div key={m}>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">{m}</p>
            <div className="flex items-end gap-1 h-24">
              {results.map((r) => (
                <div key={r.name} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t" style={{ height: `${r[m] * 100}%`, background: colors[mi] }} />
                  <span className="text-[9px] text-slate-400 truncate w-full text-center">{r.name.split(" ")[0]}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConfusionMatrix({ matrix, labels }: { matrix: number[][]; labels: string[] }) {
  const max = Math.max(...matrix.flat(), 1);
  return (
    <div className="inline-block rounded-xl border border-slate-100 overflow-hidden">
      <table className="text-xs">
        <thead>
          <tr>
            <th className="bg-slate-50 px-3 py-2" />
            <th className="bg-slate-50 px-3 py-2 text-slate-500 font-medium" colSpan={labels.length}>Predicted</th>
          </tr>
          <tr>
            <th className="bg-slate-50 px-3 py-2" />
            {labels.map((l) => <th key={l} className="bg-slate-50 px-3 py-2 font-medium text-slate-600">{l}</th>)}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              <td className="bg-slate-50 px-3 py-2 font-medium text-slate-600">{labels[i]}</td>
              {row.map((v, j) => {
                const t = v / max;
                return (
                  <td key={j} className="px-4 py-3 text-center font-medium" style={{ background: `rgba(31, 77, 43, ${t})`, color: t > 0.4 ? "white" : "#0f172a" }}>
                    {v.toLocaleString()}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
