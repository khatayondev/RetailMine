import { Database, Filter, BarChart3, Brain, Users, Network } from "lucide-react";

const modules = [
  { icon: Database, name: "Dataset Management", desc: "Preview & quality checks", color: "bg-blue-100 text-blue-700" },
  { icon: Filter, name: "Preprocessing", desc: "ETL · 7 cleaning steps", color: "bg-amber-100 text-amber-700" },
  { icon: BarChart3, name: "Exploration", desc: "5 interactive chart types", color: "bg-green-100 text-green-700" },
  { icon: Brain, name: "Classification", desc: "DT · RF · NB · KNN", color: "bg-purple-100 text-purple-700" },
  { icon: Users, name: "Clustering", desc: "K-Means · Hierarchical", color: "bg-pink-100 text-pink-700" },
  { icon: Network, name: "Association", desc: "Apriori · FP-Growth", color: "bg-orange-100 text-orange-700" },
];

export function ModulesList() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">Modules</h3>
        <button className="text-xs text-slate-500">View all</button>
      </div>
      <div className="space-y-3">
        {modules.map((m) => (
          <div key={m.name} className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${m.color}`}>
              <m.icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{m.name}</p>
              <p className="text-xs text-slate-500 truncate">{m.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
