import { useState } from "react";
import { BarChart3, PieChart as PieIcon, LineChart as LineIcon, Activity, ScatterChart } from "lucide-react";
import { api } from "../lib/api";
import { useApi } from "../lib/useApi";

const KPI_FALLBACK = { revenue: 8911407, orders: 19960, avg_order_value: 446.5, customers: 4383, products_sold: 4855840 };
const COUNTRIES_FALLBACK = {
  items: [
    { country: "United Kingdom", transactions: 368964, revenue: 8201423 },
    { country: "EIRE", transactions: 7891, revenue: 263277 },
    { country: "Germany", transactions: 6852, revenue: 198962 },
    { country: "France", transactions: 5612, revenue: 138521 },
    { country: "Netherlands", transactions: 2363, revenue: 84711 },
    { country: "Spain", transactions: 1278, revenue: 54775 },
    { country: "Belgium", transactions: 1873, revenue: 41196 },
    { country: "Switzerland", transactions: 1187, revenue: 36979 },
  ],
};

type Tab = "bar" | "pie" | "line" | "hist" | "scatter";

export function ExplorePage() {
  const [tab, setTab] = useState<Tab>("bar");

  const { data: kpis } = useApi(() => api.exploreKpis(), KPI_FALLBACK, []);
  const k = kpis?.revenue ? kpis : KPI_FALLBACK;
  const fmtMoney = (n: number) => `£${(n / 1000).toFixed(0)}K`;

  const cards = [
    { label: "Total Revenue", value: `£${(k.revenue / 1e6).toFixed(2)}M`, accent: "bg-[#dff2c8]" },
    { label: "Total Orders", value: k.orders.toLocaleString() },
    { label: "Avg Order Value", value: `£${k.avg_order_value.toFixed(2)}` },
    { label: "Active Customers", value: k.customers.toLocaleString() },
    { label: "Products Sold", value: k.products_sold.toLocaleString() },
  ];

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "bar", label: "Bar", icon: BarChart3 },
    { id: "pie", label: "Pie", icon: PieIcon },
    { id: "line", label: "Line", icon: LineIcon },
    { id: "hist", label: "Histogram", icon: Activity },
    { id: "scatter", label: "Scatter", icon: ScatterChart },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {cards.map((c) => (
          <div key={c.label} className={`${c.accent || "bg-white"} rounded-2xl p-4 border border-slate-100`}>
            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
            <p className="text-xl font-semibold text-slate-900">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-100 px-2">
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                  active ? "border-[#1f4d2b] text-[#1f4d2b]" : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <t.icon size={14} />
                {t.label}
              </button>
            );
          })}
        </div>
        <div className="p-6">
          {tab === "bar" && <BarTab fmt={fmtMoney} />}
          {tab === "pie" && <PieTab />}
          {tab === "line" && <LineTab fmt={fmtMoney} />}
          {tab === "hist" && <HistTab />}
          {tab === "scatter" && <ScatterTab />}
        </div>
      </div>

      <TopCountries />
    </div>
  );
}

function BarTab({ fmt }: { fmt: (n: number) => string }) {
  const [dim, setDim] = useState("country");
  const [n, setN] = useState(10);
  const fallback = { items: COUNTRIES_FALLBACK.items.slice(0, n).map((c) => ({ label: c.country, value: c.revenue })) };
  const { data, error } = useApi(() => api.exploreBar(dim, n), fallback, [dim, n]);
  const items = (data?.items?.length ? data.items : fallback.items).slice(0, n);
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <select value={dim} onChange={(e) => setDim(e.target.value)} className="text-xs bg-slate-50 border border-slate-100 rounded-full px-3 py-1.5 outline-none">
          <option value="country">By Country</option>
          <option value="product">By Product</option>
          <option value="month">By Month</option>
          <option value="weekday">By Weekday</option>
        </select>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Top N</span>
          <input type="range" min={5} max={20} value={n} onChange={(e) => setN(Number(e.target.value))} />
          <span className="font-medium text-slate-900 w-6">{n}</span>
        </div>
        {error && <span className="text-xs text-slate-400 ml-auto">sample data · backend offline</span>}
      </div>
      <div className="space-y-2">
        {items.map((i, idx) => (
          <div key={`${idx}-${i.label}`} className="flex items-center gap-3">
            <span className="w-40 text-xs text-slate-700 truncate">{i.label}</span>
            <div className="flex-1 h-7 bg-slate-50 rounded-lg overflow-hidden">
              <div
                className="h-full rounded-lg"
                style={{
                  width: `${(i.value / max) * 100}%`,
                  background: `linear-gradient(90deg, #dff2c8 0%, #1f4d2b 100%)`,
                }}
              />
            </div>
            <span className="w-20 text-xs text-right text-slate-600">{fmt(i.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const PIE_COLORS = ["#1f4d2b", "#3a7d44", "#7bb069", "#dff2c8", "#a8d18d", "#5c9268", "#2f6635", "#c4e0b1"];

function PieTab() {
  const [dim, setDim] = useState("country");
  const fallback = { items: COUNTRIES_FALLBACK.items.map((c) => ({ label: c.country, value: c.revenue })) };
  const { data, error } = useApi(() => api.explorePie(dim), fallback, [dim]);
  const items = data?.items?.length ? data.items : fallback.items;
  const total = items.reduce((s, i) => s + i.value, 0);

  let acc = 0;
  const arcs = items.map((i, idx) => {
    const start = acc / total;
    acc += i.value;
    const end = acc / total;
    return { ...i, start, end, color: PIE_COLORS[idx % PIE_COLORS.length] };
  });

  const polar = (r: number, t: number) => [Math.cos(2 * Math.PI * t - Math.PI / 2) * r, Math.sin(2 * Math.PI * t - Math.PI / 2) * r];

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <select value={dim} onChange={(e) => setDim(e.target.value)} className="text-xs bg-slate-50 border border-slate-100 rounded-full px-3 py-1.5 outline-none">
          <option value="country">By Country</option>
          <option value="class">By Revenue Class</option>
          <option value="quarter">By Quarter</option>
        </select>
        {error && <span className="text-xs text-slate-400 ml-auto">sample data · backend offline</span>}
      </div>
      <div className="flex items-center gap-8">
        <svg viewBox="-110 -110 220 220" className="w-[220px] h-[220px]">
          {arcs.map((a, idx) => {
            const [x1, y1] = polar(100, a.start);
            const [x2, y2] = polar(100, a.end);
            const large = a.end - a.start > 0.5 ? 1 : 0;
            return (
              <path
                key={idx}
                d={`M 0 0 L ${x1} ${y1} A 100 100 0 ${large} 1 ${x2} ${y2} Z`}
                fill={a.color}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
          <circle r="55" fill="white" />
          <text textAnchor="middle" dy="0.35em" fontSize="14" fontWeight="600" fill="#0f172a">
            {arcs.length}
          </text>
          <text textAnchor="middle" dy="1.6em" fontSize="9" fill="#64748b">segments</text>
        </svg>
        <div className="flex-1 space-y-2">
          {arcs.map((a, idx) => (
            <div key={idx} className="flex items-center gap-3 text-xs">
              <span className="w-3 h-3 rounded" style={{ background: a.color }} />
              <span className="flex-1 text-slate-700 truncate">{a.label}</span>
              <span className="font-medium text-slate-900">{((a.value / total) * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LineTab({ fmt }: { fmt: (n: number) => string }) {
  const fallback = { points: [
    { label: "Jan '10", revenue: 460000, orders: 1500 },
    { label: "Feb '10", revenue: 480000, orders: 1600 },
    { label: "Mar '10", revenue: 520000, orders: 1700 },
    { label: "Apr '10", revenue: 540000, orders: 1750 },
    { label: "May '10", revenue: 560000, orders: 1820 },
    { label: "Jun '10", revenue: 580000, orders: 1880 },
    { label: "Jul '10", revenue: 620000, orders: 1980 },
    { label: "Aug '10", revenue: 680000, orders: 2100 },
    { label: "Sep '10", revenue: 780000, orders: 2350 },
    { label: "Oct '10", revenue: 920000, orders: 2680 },
    { label: "Nov '10", revenue: 1200000, orders: 3120 },
    { label: "Dec '10", revenue: 980000, orders: 2780 },
  ]};
  const { data, error } = useApi(() => api.exploreLine("month"), fallback, []);
  const points = data?.points?.length ? data.points : fallback.points;
  const max = Math.max(...points.map((p) => p.revenue));
  const W = 600, H = 200, pad = 30;
  const stepX = (W - pad * 2) / (points.length - 1);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${pad + i * stepX} ${H - pad - (p.revenue / max) * (H - pad * 2)}`).join(" ");

  return (
    <div>
      {error && <p className="text-xs text-slate-400 mb-3">sample data · backend offline</p>}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[220px]">
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1f4d2b" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#1f4d2b" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path} L ${pad + (points.length - 1) * stepX} ${H - pad} L ${pad} ${H - pad} Z`} fill="url(#lg)" />
        <path d={path} fill="none" stroke="#1f4d2b" strokeWidth="2.5" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={pad + i * stepX} cy={H - pad - (p.revenue / max) * (H - pad * 2)} r="3" fill="#1f4d2b" />
            <text x={pad + i * stepX} y={H - 8} fontSize="9" fill="#94a3b8" textAnchor="middle">{p.label}</text>
          </g>
        ))}
      </svg>
      <div className="grid grid-cols-3 gap-3 mt-4">
        <Mini label="Peak month" value={points.reduce((m, p) => (p.revenue > m.revenue ? p : m), points[0]).label} />
        <Mini label="Peak revenue" value={fmt(Math.max(...points.map((p) => p.revenue)))} />
        <Mini label="Total orders" value={points.reduce((s, p) => s + p.orders, 0).toLocaleString()} />
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3">
      <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-slate-900 mt-1">{value}</p>
    </div>
  );
}

function HistTab() {
  const [col, setCol] = useState("Revenue");
  const fallback = {
    bins: Array.from({ length: 20 }).map((_, i) => ({ x: i * 5, count: Math.round(800 * Math.exp(-i / 6) + Math.random() * 50) })),
    mean: 14.2, median: 11.5, std: 8.9, max: 38450,
  };
  const { data, error } = useApi(() => api.exploreHistogram(col, 20), fallback, [col]);
  const d = data?.bins?.length ? data : fallback;
  const max = Math.max(...d.bins.map((b: any) => b.count), 1);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <select value={col} onChange={(e) => setCol(e.target.value)} className="text-xs bg-slate-50 border border-slate-100 rounded-full px-3 py-1.5 outline-none">
          <option value="Revenue">Revenue</option>
          <option value="Quantity">Quantity</option>
          <option value="Price">Price</option>
        </select>
        {error && <span className="text-xs text-slate-400 ml-auto">sample data · backend offline</span>}
      </div>
      <div className="h-[200px] flex items-end gap-1">
        {d.bins.map((b: any, i: number) => (
          <div key={i} className="flex-1 bg-[#dff2c8] hover:bg-[#1f4d2b] transition rounded-t" style={{ height: `${(b.count / max) * 100}%` }} title={`${b.x.toFixed(2)} → ${b.count}`} />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-3 mt-4">
        <Mini label="Mean" value={d.mean.toFixed(2)} />
        <Mini label="Median" value={d.median.toFixed(2)} />
        <Mini label="Std Dev" value={d.std.toFixed(2)} />
        <Mini label="Max" value={d.max.toFixed(0)} />
      </div>
    </div>
  );
}

function ScatterTab() {
  const { data, error } = useApi(() => api.exploreCorrelation(), {
    columns: ["Quantity", "Price", "Revenue", "Month", "Quarter"],
    matrix: [
      [1, -0.05, 0.62, 0.04, 0.05],
      [-0.05, 1, 0.31, -0.02, -0.02],
      [0.62, 0.31, 1, 0.05, 0.06],
      [0.04, -0.02, 0.05, 1, 0.98],
      [0.05, -0.02, 0.06, 0.98, 1],
    ],
  }, []);

  const color = (v: number) => {
    const t = (v + 1) / 2;
    const r = Math.round(255 - 220 * t);
    const g = Math.round(120 + 40 * t);
    const b = Math.round(100 + 50 * t);
    return `rgb(${r},${g},${b})`;
  };

  return (
    <div>
      <p className="text-sm text-slate-600 mb-3">Correlation matrix of numeric features</p>
      {error && <p className="text-xs text-slate-400 mb-3">sample data · backend offline</p>}
      <div className="inline-block rounded-xl border border-slate-100 overflow-hidden">
        <table className="text-xs">
          <thead>
            <tr>
              <th className="bg-slate-50 px-3 py-2" />
              {data.columns.map((c) => (
                <th key={c} className="bg-slate-50 px-3 py-2 font-medium text-slate-600">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.matrix.map((row, i) => (
              <tr key={i}>
                <td className="bg-slate-50 px-3 py-2 font-medium text-slate-600">{data.columns[i]}</td>
                {row.map((v, j) => (
                  <td key={j} className="px-4 py-2 text-center font-medium" style={{ background: color(v), color: Math.abs(v) > 0.5 ? "white" : "#0f172a" }}>
                    {v.toFixed(2)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TopCountries() {
  const { data, error } = useApi(() => api.exploreTopCountries(10), COUNTRIES_FALLBACK, []);
  const items = data?.items?.length ? data.items : COUNTRIES_FALLBACK.items;
  const maxRev = Math.max(...items.map((i) => i.revenue));

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">Top Countries</h3>
        {error && <span className="text-xs text-slate-400">sample data · backend offline</span>}
      </div>
      <div className="overflow-auto rounded-xl border border-slate-100">
        <table className="w-full text-xs">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left px-3 py-2 font-medium text-slate-600">Country</th>
              <th className="text-right px-3 py-2 font-medium text-slate-600">Transactions</th>
              <th className="text-right px-3 py-2 font-medium text-slate-600">Revenue</th>
              <th className="text-left px-3 py-2 font-medium text-slate-600">Share</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.country} className="border-t border-slate-100">
                <td className="px-3 py-2 font-medium text-slate-900">{c.country}</td>
                <td className="px-3 py-2 text-right text-slate-600">{c.transactions.toLocaleString()}</td>
                <td className="px-3 py-2 text-right text-slate-600">£{c.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                <td className="px-3 py-2">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1f4d2b]" style={{ width: `${(c.revenue / maxRev) * 100}%` }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
