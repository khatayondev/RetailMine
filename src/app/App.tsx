import { useRef, useState } from "react";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { api } from "./lib/api";
import { PageProvider, usePage } from "./lib/page";
import { DashboardPage } from "./pages/DashboardPage";
import { DatasetPage } from "./pages/DatasetPage";
import { PreprocessPage } from "./pages/PreprocessPage";
import { ExplorePage } from "./pages/ExplorePage";
import { ClassifyPage } from "./pages/ClassifyPage";
import { ClusterPage } from "./pages/ClusterPage";
import { AssociatePage } from "./pages/AssociatePage";
import { ReportsPage } from "./pages/ReportsPage";

type UploadStatus = "idle" | "uploading" | "done" | "error";

const TITLES: Record<string, { title: string; sub: string }> = {
  dashboard: { title: "Dashboard", sub: "Mine, classify, and cluster your retail sales data with ease." },
  dataset: { title: "Dataset", sub: "Raw data preview, column info, and quality checks." },
  preprocess: { title: "Preprocessing", sub: "Run the 7-step cleaning pipeline & build the warehouse." },
  explore: { title: "Exploration", sub: "Interactive charts, KPIs, and correlation analysis." },
  classify: { title: "Classification", sub: "Train and compare four classifiers on RevenueClass." },
  cluster: { title: "Clustering", sub: "Segment customers by RFM using K-Means and Hierarchical." },
  associate: { title: "Association", sub: "Mine market-basket rules with Apriori and FP-Growth." },
  reports: { title: "Reports", sub: "Generate PDF, image, or Word reports from your analysis." },
};

function Shell() {
  const { page, setPage } = usePage();
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [msg, setMsg] = useState<string>("");
  const { title, sub } = TITLES[page];

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("uploading");
    setMsg(`Uploading ${file.name}...`);
    try {
      await api.upload(file);
      setStatus("done");
      setMsg(`Uploaded ${file.name} · ready for preprocessing`);
    } catch (err: any) {
      setStatus("error");
      setMsg(err?.message ? `Upload failed: ${err.message}` : "Upload failed — is the backend running?");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="size-full min-h-screen bg-[#f3f4ef] flex">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-auto px-8 pb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-[28px] font-semibold text-slate-900">{title}</h1>
              <p className="text-sm text-slate-500">{sub}</p>
              {status !== "idle" && (
                <div
                  className={`mt-2 inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full ${
                    status === "uploading" ? "bg-slate-100 text-slate-700"
                    : status === "done" ? "bg-[#dff2c8] text-[#1f4d2b]"
                    : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {status === "uploading" && <Loader2 size={12} className="animate-spin" />}
                  {status === "done" && <Check size={12} />}
                  {status === "error" && <AlertCircle size={12} />}
                  {msg}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setPage("preprocess")}
                className="px-5 py-2.5 rounded-full bg-[#1f4d2b] text-white text-sm font-medium hover:bg-[#163820] transition"
              >
                + Run Preprocessing
              </button>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv,.pdf" className="hidden" onChange={onFile} />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={status === "uploading"}
                className="px-5 py-2.5 rounded-full bg-white text-slate-700 text-sm font-medium border border-slate-200 hover:bg-slate-50 transition disabled:opacity-60"
              >
                {status === "uploading" ? "Uploading..." : "Import Data"}
              </button>
            </div>
          </div>

          {page === "dashboard" && <DashboardPage />}
          {page === "dataset" && <DatasetPage />}
          {page === "preprocess" && <PreprocessPage />}
          {page === "explore" && <ExplorePage />}
          {page === "classify" && <ClassifyPage />}
          {page === "cluster" && <ClusterPage />}
          {page === "associate" && <AssociatePage />}
          {page === "reports" && <ReportsPage />}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <PageProvider>
      <Shell />
    </PageProvider>
  );
}
