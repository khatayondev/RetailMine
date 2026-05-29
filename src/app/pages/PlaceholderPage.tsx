import { Sparkles } from "lucide-react";

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
      <div className="w-12 h-12 rounded-full bg-[#dff2c8] flex items-center justify-center mx-auto mb-3 text-[#1f4d2b]">
        <Sparkles size={20} />
      </div>
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500">Coming next — wired to its backend endpoint.</p>
    </div>
  );
}
