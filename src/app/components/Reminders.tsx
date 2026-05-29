import { Play, Loader2, Check } from "lucide-react";
import { useState } from "react";
import { api } from "../lib/api";

type Status = "idle" | "running" | "done" | "error";

export function Reminders() {
  const [status, setStatus] = useState<Status>("idle");
  const [msg, setMsg] = useState<string>("");

  const run = async () => {
    setStatus("running");
    setMsg("");
    try {
      const report = await api.preprocess();
      const wh = await api.buildWarehouse();
      setStatus("done");
      setMsg(`Cleaned ${report.clean_rows.toLocaleString()} rows · ${wh.fact_rows.toLocaleString()} facts loaded`);
    } catch (e: any) {
      setStatus("error");
      setMsg(String(e.message || e));
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100">
      <h3 className="font-semibold text-slate-900 mb-1">Reminders</h3>
      <p className="text-xs text-slate-500 mb-4">First-run workflow</p>
      <div className="bg-[#f3f4ef] rounded-xl p-4">
        <p className="text-sm font-medium text-slate-900 mb-1">Run Preprocessing pipeline</p>
        <p className="text-xs text-slate-500 mb-3">7 cleaning steps · build warehouse</p>
        <button
          onClick={run}
          disabled={status === "running"}
          className="w-full bg-[#1f4d2b] text-white text-sm font-medium py-2.5 rounded-full flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {status === "running" ? <Loader2 size={14} className="animate-spin" /> : status === "done" ? <Check size={14} /> : <Play size={14} fill="white" />}
          {status === "running" ? "Running..." : status === "done" ? "Completed" : "Start Pipeline"}
        </button>
        {msg && <p className={`mt-3 text-xs ${status === "error" ? "text-rose-600" : "text-slate-600"}`}>{msg}</p>}
      </div>
    </div>
  );
}
