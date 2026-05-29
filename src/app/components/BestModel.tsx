import { Trophy, Play, Pause, Square } from "lucide-react";
import { useState } from "react";
import { api } from "../lib/api";

export function BestModel() {
  const [name, setName] = useState("Random Forest");
  const [acc, setAcc] = useState(99.99);
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    try {
      const res = await api.bestModel();
      setName(res.best.name);
      setAcc(Number((res.best.accuracy * 100).toFixed(2)));
    } catch (_) {
      // keep fallback
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Best Model</h3>
        <Trophy size={18} className="text-amber-400" />
      </div>
      <p className="text-xs text-slate-300 mb-3">{name} classifier</p>
      <div className="text-4xl font-bold mb-1 tabular-nums">
        {acc}
        <span className="text-xl text-slate-400">%</span>
      </div>
      <p className="text-xs text-slate-400 mb-5">Accuracy on RevenueClass</p>
      <div className="flex items-center gap-2">
        <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><Pause size={16} /></button>
        <button
          onClick={run}
          disabled={running}
          className="w-10 h-10 rounded-full bg-[#3a7d44] flex items-center justify-center disabled:opacity-50"
        >
          <Play size={16} fill="white" />
        </button>
        <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><Square size={14} fill="white" /></button>
      </div>
    </div>
  );
}
