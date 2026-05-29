import { useState } from "react";
import { Play, Loader2, AlertCircle, Network, TrendingUp } from "lucide-react";
import { api } from "../lib/api";

const COUNTRIES = ["United Kingdom", "Germany", "France", "EIRE", "Netherlands", "Spain", "Belgium", "Switzerland"];

const FALLBACK = {
  itemsets: 131,
  rules: [
    { antecedents: ["PINK CHERRY LIGHTS"], consequents: ["WHITE CHERRY LIGHTS"], support: 0.041, confidence: 0.82, lift: 3.2 },
    { antecedents: ["GREEN REGENCY TEACUP AND SAUCER"], consequents: ["ROSES REGENCY TEACUP AND SAUCER"], support: 0.038, confidence: 0.78, lift: 3.05 },
    { antecedents: ["PINK REGENCY TEACUP AND SAUCER"], consequents: ["GREEN REGENCY TEACUP AND SAUCER"], support: 0.035, confidence: 0.74, lift: 2.94 },
    { antecedents: ["HEART OF WICKER SMALL"], consequents: ["HEART OF WICKER LARGE"], support: 0.029, confidence: 0.69, lift: 2.71 },
    { antecedents: ["JUMBO BAG RED RETROSPOT"], consequents: ["JUMBO BAG PINK POLKADOT"], support: 0.027, confidence: 0.65, lift: 2.58 },
    { antecedents: ["LUNCH BAG RED RETROSPOT"], consequents: ["LUNCH BAG BLACK SKULL."], support: 0.026, confidence: 0.62, lift: 2.41 },
    { antecedents: ["ALARM CLOCK BAKELIKE RED"], consequents: ["ALARM CLOCK BAKELIKE GREEN"], support: 0.024, confidence: 0.58, lift: 2.28 },
    { antecedents: ["SET/6 RED SPOTTY PAPER PLATES"], consequents: ["SET/6 RED SPOTTY PAPER CUPS"], support: 0.022, confidence: 0.55, lift: 2.18 },
    { antecedents: ["WOODEN STAR CHRISTMAS SCANDINAVIAN"], consequents: ["WOODEN HEART CHRISTMAS SCANDINAVIAN"], support: 0.021, confidence: 0.53, lift: 2.07 },
    { antecedents: ["CHARLOTTE BAG PINK POLKADOT"], consequents: ["RED RETROSPOT CHARLOTTE BAG"], support: 0.02, confidence: 0.51, lift: 1.96 },
  ],
};

type State = "idle" | "running" | "done" | "error";

export function AssociatePage() {
  const [country, setCountry] = useState("United Kingdom");
  const [maxInvoices, setMaxInvoices] = useState(1000);
  const [minSupport, setMinSupport] = useState(0.02);
  const [minConfidence, setMinConfidence] = useState(0.3);
  const [algorithm, setAlgorithm] = useState<"fpgrowth" | "apriori">("fpgrowth");
  const [state, setState] = useState<State>("idle");
  const [result, setResult] = useState<any>(FALLBACK);
  const [err, setErr] = useState("");

  const run = async () => {
    setState("running");
    setErr("");
    try {
      const r = await api.associate({
        country, max_invoices: maxInvoices, min_support: minSupport, min_confidence: minConfidence, algorithm,
      });
      setResult(r);
      setState("done");
    } catch (e: any) {
      setErr(String(e.message || e));
      setState("error");
    }
  };

  const rules = result.rules || [];
  const maxLift = rules.length ? Math.max(...rules.map((r: any) => r.lift)) : 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <Metric label="Support" desc="Fraction of transactions containing the itemset" />
        <Metric label="Confidence" desc="P(consequent | antecedent)" />
        <Metric label="Lift" desc=">1 = stronger than random" />
        <Metric label="Itemsets" value={result.itemsets} accent />
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <h3 className="font-semibold text-slate-900 mb-4">Mining Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Country</p>
            <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full text-sm bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 outline-none font-sans">
              {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Algorithm</p>
            <div className="flex gap-2">
              {(["fpgrowth", "apriori"] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setAlgorithm(a)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border ${algorithm === a ? "bg-[#1f4d2b] text-white border-[#1f4d2b]" : "bg-white text-slate-600 border-slate-200"}`}
                >
                  {a === "fpgrowth" ? "FP-Growth" : "Apriori"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-end">
            <button onClick={run} disabled={state === "running"} className="w-full px-5 py-2.5 rounded-full bg-[#1f4d2b] text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60">
              {state === "running" ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="white" />}
              Mine Rules
            </button>
          </div>
          <Slider label={`Max Invoices: ${maxInvoices}`} min={500} max={5000} step={100} value={maxInvoices} onChange={setMaxInvoices} />
          <Slider label={`Min Support: ${(minSupport * 100).toFixed(1)}%`} min={5} max={100} step={1} value={minSupport * 1000} onChange={(v) => setMinSupport(v / 1000)} />
          <Slider label={`Min Confidence: ${(minConfidence * 100).toFixed(0)}%`} min={10} max={90} step={5} value={minConfidence * 100} onChange={(v) => setMinConfidence(v / 100)} />
        </div>
        {err && <div className="mt-4 text-xs text-rose-600 flex items-center gap-1.5"><AlertCircle size={12} />{err}</div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Kpi label="Frequent Itemsets" value={result.itemsets} icon={<Network size={16} />} />
        <Kpi label="Association Rules" value={rules.length} icon={<TrendingUp size={16} />} />
        <Kpi label="Max Lift" value={maxLift.toFixed(2)} accent />
      </div>

      {/* Network Graph */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <h3 className="font-semibold text-slate-900 mb-1">🕸️ Association Rule Network Graph</h3>
        <p className="text-xs text-slate-500 mb-4">Visual representation of product-to-product associations (Top 15 rules)</p>
        <RuleNetwork rules={rules} />
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <h3 className="font-semibold text-slate-900 mb-1">Top Rules by Lift</h3>
        <p className="text-xs text-slate-500 mb-4">Strongest discovered product associations</p>
        <div className="space-y-2">
          {rules.slice(0, 10).map((r: any, i: number) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-6 text-xs text-slate-400 text-right">{i + 1}</span>
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <span className="text-xs text-slate-700 truncate flex-1">{r.antecedents.join(", ")}</span>
                <span className="text-slate-400">→</span>
                <span className="text-xs text-slate-900 font-medium truncate flex-1">{r.consequents.join(", ")}</span>
              </div>
              <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#1f4d2b]" style={{ width: `${(r.lift / maxLift) * 100}%` }} />
              </div>
              <span className="w-12 text-right text-xs font-semibold text-[#1f4d2b]">{r.lift.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <h3 className="font-semibold text-slate-900 mb-1">Rules Detail</h3>
        <p className="text-xs text-slate-500 mb-4">Full association table</p>
        <div className="overflow-auto rounded-xl border border-slate-100 max-h-[360px]">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                {["#", "Antecedents", "Consequents", "Support", "Confidence", "Lift"].map((h) => (
                  <th key={h} className="text-left px-3 py-2 font-medium text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rules.map((r: any, i: number) => (
                <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                  <td className="px-3 py-2 text-slate-700 max-w-[220px] truncate">{r.antecedents.join(", ")}</td>
                  <td className="px-3 py-2 font-medium text-slate-900 max-w-[220px] truncate">{r.consequents.join(", ")}</td>
                  <td className="px-3 py-2 text-slate-600">{(r.support * 100).toFixed(2)}%</td>
                  <td className="px-3 py-2 text-slate-600">{(r.confidence * 100).toFixed(1)}%</td>
                  <td className="px-3 py-2">
                    <span className="px-2 py-0.5 rounded-full bg-[#dff2c8] text-[#1f4d2b] font-semibold">{r.lift.toFixed(2)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <h3 className="font-semibold text-slate-900 mb-1">Business Recommendations</h3>
        <p className="text-xs text-slate-500 mb-4">Actionable insights from mined patterns</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {[
            "Place high-association products near each other in-store and online.",
            "Offer bundle discounts for the top 10 rule pairs discovered.",
            "Target retention campaigns at At-Risk and Dormant clusters — they've spent before.",
            "Reward Champions with loyalty points to maintain their behaviour.",
            "Invest heavily in the UK market (92% revenue), test growth in Germany & France.",
            "Stock up before November/December — clear seasonal spike in the data.",
          ].map((t, i) => (
            <div key={i} className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl">
              <span className="w-5 h-5 rounded-full bg-[#1f4d2b] text-white text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
              <span className="text-slate-700">{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RuleNetwork({ rules }: { rules: any[] }) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Extract top 15 rules
  const topRules = rules.slice(0, 15);

  // Find unique items
  const itemsSet = new Set<string>();
  topRules.forEach(r => {
    (r.antecedents || []).forEach((item: string) => itemsSet.add(item));
    (r.consequents || []).forEach((item: string) => itemsSet.add(item));
  });

  const items = Array.from(itemsSet);
  const N = items.length;

  if (N === 0) return <p className="text-xs text-slate-400 text-center py-6">No association rules mined yet.</p>;

  // Center and Radius
  const cx = 300;
  const cy = 200;
  const R = 135;

  // Nodes with coordinates
  const nodes = items.map((item, i) => {
    const angle = (2 * Math.PI * i) / N;
    return {
      name: item,
      x: cx + R * Math.cos(angle),
      y: cy + R * Math.sin(angle)
    };
  });

  // Helper to find node coordinates
  const findNode = (name: string) => nodes.find(n => n.name === name) || { x: cx, y: cy };

  // Generate edges
  const edges = topRules.map((r, index) => {
    const froms = (r.antecedents || []).map((item: string) => findNode(item));
    const tos = (r.consequents || []).map((item: string) => findNode(item));
    
    // Draw edges between all combinations of antecedents -> consequents
    return froms.flatMap(f => tos.map(t => ({
      from: f,
      to: t,
      antecedents: r.antecedents,
      consequents: r.consequents,
      support: r.support,
      confidence: r.confidence,
      lift: r.lift,
      key: `${f.name}-${t.name}-${index}`
    })));
  }).flat();

  // Highlight check
  const isHighlighted = (nodeName: string) => {
    if (!hoveredNode) return true;
    if (hoveredNode === nodeName) return true;
    // Check if connected in any top rule
    return topRules.some(r => 
      (r.antecedents.includes(hoveredNode) && r.consequents.includes(nodeName)) ||
      (r.consequents.includes(hoveredNode) && r.antecedents.includes(nodeName))
    );
  };

  const isEdgeHighlighted = (edge: any) => {
    if (!hoveredNode) return true;
    return edge.antecedents.includes(hoveredNode) || edge.consequents.includes(hoveredNode);
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center overflow-hidden">
        <svg viewBox="0 0 600 400" className="w-full max-w-[600px] h-[360px] select-none">
          {/* Arrow markers for edges */}
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#cbd5e1" />
            </marker>
            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#1f4d2b" />
            </marker>
          </defs>

          {/* Edges */}
          {edges.map((e) => {
            const active = isEdgeHighlighted(e);
            return (
              <g key={e.key}>
                <line
                  x1={e.from.x}
                  y1={e.from.y}
                  x2={e.to.x}
                  y2={e.to.y}
                  stroke={active ? "#1f4d2b" : "#e2e8f0"}
                  strokeWidth={active ? 1.5 : 0.5}
                  strokeDasharray={active ? "none" : "3,3"}
                  markerEnd={`url(#${active ? "arrow-active" : "arrow"})`}
                  className="transition-all duration-300"
                />
                {/* Invisible hover helper for edges */}
                <line
                  x1={e.from.x}
                  y1={e.from.y}
                  x2={e.to.x}
                  y2={e.to.y}
                  stroke="transparent"
                  strokeWidth={10}
                  className="cursor-pointer"
                >
                  <title>
                    {e.antecedents.join(", ")} ➔ {e.consequents.join(", ")}{"\n"}Support: {(e.support * 100).toFixed(2)}%{"\n"}Confidence: {(e.confidence * 100).toFixed(1)}%{"\n"}Lift: {e.lift.toFixed(2)}
                  </title>
                </line>
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((n) => {
            const active = isHighlighted(n.name);
            const isSelf = hoveredNode === n.name;
            return (
              <g
                key={n.name}
                onMouseEnter={() => setHoveredNode(n.name)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer transition-all duration-300"
              >
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={isSelf ? 7 : 5}
                  fill={isSelf ? "#1f4d2b" : active ? "#3a7d44" : "#cbd5e1"}
                  stroke="white"
                  strokeWidth={1.5}
                  className="transition-all duration-300"
                />
                <text
                  x={n.x}
                  y={n.y - 8}
                  textAnchor="middle"
                  fontSize={isSelf ? "9px" : "7px"}
                  fontWeight={active ? "semibold" : "normal"}
                  fill={isSelf ? "#1f4d2b" : active ? "#1e293b" : "#94a3b8"}
                  className="transition-all duration-300 pointer-events-none drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]"
                >
                  {n.name.length > 20 ? n.name.substring(0, 18) + "..." : n.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="text-[10px] text-slate-400 text-center">💡 Hover over any product node to highlight its market basket relationships!</p>
    </div>
  );
}

function Metric({ label, desc, value, accent }: { label: string; desc?: string; value?: any; accent?: boolean }) {
  return (
    <div className={`rounded-xl p-3 border border-slate-100 ${accent ? "bg-[#dff2c8]" : "bg-white"}`}>
      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">{label}</p>
      {value !== undefined ? <p className="text-lg font-semibold text-slate-900">{value}</p> : <p className="text-slate-600">{desc}</p>}
    </div>
  );
}

function Kpi({ label, value, accent, icon }: { label: string; value: any; accent?: boolean; icon?: React.ReactNode }) {
  return (
    <div className={`rounded-2xl p-5 border border-slate-100 ${accent ? "bg-[#dff2c8]" : "bg-white"}`}>
      <div className="flex items-center gap-2 mb-1 text-slate-500">
        {icon}
        <p className="text-xs">{label}</p>
      </div>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function Slider({ label, min, max, step, value, onChange }: { label: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</p>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#1f4d2b]" />
    </div>
  );
}
