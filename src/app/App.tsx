import { useRef, useState, useEffect } from "react";
import { Loader2, Check, AlertCircle, FileSpreadsheet, Receipt, FileText, UploadCloud, ArrowLeft, X } from "lucide-react";
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

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<"excel" | "csv" | "pdf" | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const onFile = async (fileOrEvent: React.ChangeEvent<HTMLInputElement> | File) => {
    let file: File | undefined;
    if (fileOrEvent instanceof File) {
      file = fileOrEvent;
    } else {
      file = fileOrEvent.target.files?.[0];
    }
    if (!file) return;

    setStatus("uploading");
    setMsg(`Uploading ${file.name}...`);
    try {
      await api.upload(file);
      setStatus("done");
      setMsg(`Uploaded ${file.name} · ready for preprocessing`);
      // Auto-close modal after 1.5 seconds on success
      setTimeout(() => {
        setIsModalOpen(false);
        setStatus("idle");
        setMsg("");
        setModalStep(1);
        setSelectedType(null);
      }, 1500);
    } catch (err: any) {
      setStatus("error");
      setMsg(err?.message ? `Upload failed: ${err.message}` : "Upload failed — is the backend running?");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      
      // Basic type checks
      if (selectedType === "excel" && (ext === "xlsx" || ext === "xls")) {
        onFile(file);
      } else if (selectedType === "csv" && ext === "csv") {
        onFile(file);
      } else if (selectedType === "pdf" && ext === "pdf") {
        onFile(file);
      } else {
        setStatus("error");
        setMsg(`Invalid file type. Please upload a ${selectedType === "excel" ? "Excel (.xlsx, .xls)" : selectedType === "csv" ? "CSV (.csv)" : "PDF (.pdf)"} file.`);
      }
    }
  };

  const openImportModal = () => {
    setIsModalOpen(true);
    setModalStep(1);
    setSelectedType(null);
    setStatus("idle");
    setMsg("");
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
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setPage("preprocess")}
                className="px-5 py-2.5 rounded-full bg-[#1f4d2b] text-white text-sm font-medium hover:bg-[#163820] transition"
              >
                + Run Preprocessing
              </button>
              <button
                onClick={openImportModal}
                className="px-5 py-2.5 rounded-full bg-white text-slate-700 text-sm font-medium border border-slate-200 hover:bg-slate-50 transition"
              >
                Import Data
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

      {/* Modern Data Import Wizard Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center transition-all duration-300">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xl w-full max-w-lg mx-4 flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
            >
              <X size={14} />
            </button>

            {/* Modal Step 1: Choose File Type */}
            {modalStep === 1 ? (
              <div className="space-y-5">
                <div className="text-center py-2">
                  <h3 className="text-lg font-semibold text-slate-900">Import Retail Dataset</h3>
                  <p className="text-xs text-slate-500 mt-1">Select your file format to configure the import pipeline</p>
                </div>

                <div className="space-y-2">
                  {/* Excel Option */}
                  <button
                    onClick={() => {
                      setSelectedType("excel");
                      setModalStep(2);
                    }}
                    className="w-full p-4 rounded-2xl border border-slate-100 hover:border-[#1f4d2b]/20 hover:bg-[#dff2c8]/10 text-left flex items-start gap-4 transition duration-200 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#dff2c8] flex items-center justify-center text-[#1f4d2b] flex-shrink-0 group-hover:scale-105 transition-all">
                      <FileSpreadsheet size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Excel Worksheet (.xlsx, .xls)</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Optimized for standard data packages. Must contain a sheet named "Year 2009-2010".</p>
                    </div>
                  </button>

                  {/* CSV Option */}
                  <button
                    onClick={() => {
                      setSelectedType("csv");
                      setModalStep(2);
                    }}
                    className="w-full p-4 rounded-2xl border border-slate-100 hover:border-[#0ea5e9]/20 hover:bg-[#0ea5e9]/5 text-left flex items-start gap-4 transition duration-200 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-[#0ea5e9] flex-shrink-0 group-hover:scale-105 transition-all">
                      <Receipt size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">CSV Spreadsheet (.csv)</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Optimized for comma or tab delimited reports. Fast loads & easy processing.</p>
                    </div>
                  </button>

                  {/* PDF Option */}
                  <button
                    onClick={() => {
                      setSelectedType("pdf");
                      setModalStep(2);
                    }}
                    className="w-full p-4 rounded-2xl border border-slate-100 hover:border-[#ef4444]/20 hover:bg-[#ef4444]/5 text-left flex items-start gap-4 transition duration-200 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-[#ef4444] flex-shrink-0 group-hover:scale-105 transition-all">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Digitized PDF / Invoice List (.pdf)</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Advanced tabular extraction. Automatically parses structural grids & maps transaction fields.</p>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              /* Modal Step 2: Upload Dropzone */
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setModalStep(1);
                      setStatus("idle");
                      setMsg("");
                    }}
                    className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700 transition"
                  >
                    <ArrowLeft size={12} />
                  </button>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 capitalize">Upload {selectedType} File</h3>
                    <p className="text-[11px] text-slate-500">Pipeline is configured for {selectedType === "excel" ? "Worksheets" : selectedType === "csv" ? "CSVs" : "PDFs"}</p>
                  </div>
                </div>

                {status === "idle" && (
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition duration-200 ${
                      dragActive ? "border-[#1f4d2b] bg-[#dff2c8]/10" : "border-slate-200 hover:border-[#1f4d2b]/40 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept={selectedType === "excel" ? ".xlsx,.xls" : selectedType === "csv" ? ".csv" : ".pdf"}
                      onChange={onFile}
                      className="hidden"
                    />
                    <UploadCloud size={32} className="text-slate-400 mb-2" />
                    <p className="text-xs font-semibold text-slate-700">Drag & drop your file here, or <span className="text-[#1f4d2b]">browse</span></p>
                    <p className="text-[10px] text-slate-400 mt-1">Supports {selectedType === "excel" ? ".xlsx, .xls" : selectedType === "csv" ? ".csv" : ".pdf"} files up to 50MB</p>
                  </div>
                )}

                {status === "uploading" && (
                  <div className="p-8 border border-slate-100 rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-center">
                    <Loader2 size={24} className="animate-spin text-[#1f4d2b] mb-3" />
                    <p className="text-xs font-semibold text-slate-800">{msg}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Parsing headers, mapping columns & extracting tables...</p>
                  </div>
                )}

                {status === "done" && (
                  <div className="p-8 border border-[#dff2c8]/40 rounded-2xl bg-[#dff2c8]/10 flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 rounded-full bg-[#1f4d2b] flex items-center justify-center text-white mb-3">
                      <Check size={18} />
                    </div>
                    <p className="text-xs font-semibold text-[#1f4d2b]">{msg}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Loading dataset dashboard preview...</p>
                  </div>
                )}

                {status === "error" && (
                  <div className="p-6 border border-rose-100 rounded-2xl bg-rose-50/50 flex flex-col items-center justify-center text-center">
                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 mb-2">
                      <AlertCircle size={16} />
                    </div>
                    <p className="text-xs font-semibold text-rose-700">{msg}</p>
                    <button
                      onClick={() => setStatus("idle")}
                      className="mt-3 px-4 py-1.5 rounded-full bg-white border border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
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
