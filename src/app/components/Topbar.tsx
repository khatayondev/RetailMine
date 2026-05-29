import { Search, Bell } from "lucide-react";

export function Topbar() {
  return (
    <div className="flex items-center justify-between px-8 py-5">
      <div className="relative flex-1 max-w-xl">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          placeholder="Search transactions, customers, products..."
          className="w-full bg-white rounded-full pl-11 pr-4 py-2.5 text-sm border border-slate-100 outline-none focus:border-[#1f4d2b]/30"
        />
      </div>
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-600">
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-3 bg-white rounded-full pl-1.5 pr-4 py-1.5 border border-slate-100">
          <div className="w-8 h-8 rounded-full bg-[#1f4d2b] text-white flex items-center justify-center text-sm font-medium">G1</div>
          <div className="text-sm">
            <p className="font-medium text-slate-900 leading-tight">Group 1</p>
            <p className="text-[11px] text-slate-500 leading-tight">BCSC 406</p>
          </div>
        </div>
      </div>
    </div>
  );
}
