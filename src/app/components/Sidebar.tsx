import { LayoutDashboard, Database, Filter, BarChart3, Brain, Users, Network, FileText, HelpCircle, LogOut, Download } from "lucide-react";
import { PageId, usePage } from "../lib/page";

const menu: { icon: any; label: string; id: PageId }[] = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: Database, label: "Dataset", id: "dataset" },
  { icon: Filter, label: "Preprocessing", id: "preprocess" },
  { icon: BarChart3, label: "Exploration", id: "explore" },
  { icon: Brain, label: "Classification", id: "classify" },
  { icon: Users, label: "Clustering", id: "cluster" },
  { icon: Network, label: "Association", id: "associate" },
  { icon: FileText, label: "Reports", id: "reports" },
];

const general = [
  { icon: HelpCircle, label: "Help", action: "help" as const },
  { icon: LogOut, label: "Logout", action: "logout" as const },
];

export function Sidebar() {
  const { page, setPage } = usePage();

  const handleAction = (action: "help" | "logout") => {
    if (action === "logout") {
      if (window.confirm("Log out of RetailMine? This will reset the dashboard to its initial state.")) {
        setPage("dashboard");
        window.location.reload();
      }
    } else if (action === "help") {
      window.open("https://github.com/anthropics/claude-code/issues", "_blank");
    }
  };

  return (
    <aside className="w-[230px] shrink-0 bg-white border-r border-slate-100 flex flex-col p-5">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-[#1f4d2b] flex items-center justify-center text-white font-bold">R</div>
        <span className="font-semibold text-slate-900">RetailMine</span>
      </div>

      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Menu</p>
      <nav className="flex flex-col gap-1 mb-8">
        {menu.map(({ icon: Icon, label, id }) => {
          const active = page === id;
          return (
            <button
              key={id}
              onClick={() => setPage(id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                active ? "bg-[#1f4d2b] text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">General</p>
      <nav className="flex flex-col gap-1">
        {general.map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            onClick={() => handleAction(action)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
              action === "logout" ? "text-rose-600 hover:bg-rose-50" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto bg-slate-900 rounded-2xl p-4 text-white relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-[#3a7d44]/30" />
        <Download size={20} className="mb-2" />
        <p className="text-sm font-semibold mb-1">Download project report</p>
        <p className="text-xs text-slate-300 mb-3">Full PDF & schema</p>
        <button className="text-xs bg-white text-slate-900 px-3 py-1.5 rounded-full font-medium">Download</button>
      </div>
    </aside>
  );
}
