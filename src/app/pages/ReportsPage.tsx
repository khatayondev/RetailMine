import { useRef, useState } from "react";
import { FileText, Image as ImageIcon, FileType, Loader2, Download, Check } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type ReportId = "executive" | "dataset" | "cleaning" | "classification" | "clustering" | "association" | "full";
type Format = "pdf" | "png" | "doc";

const REPORTS: { id: ReportId; title: string; desc: string }[] = [
  { id: "executive", title: "Executive Summary", desc: "High-level KPIs, key findings, recommendations." },
  { id: "dataset", title: "Dataset Quality", desc: "Row counts, column types, missing values, duplicates." },
  { id: "cleaning", title: "Cleaning & ETL", desc: "7-step pipeline results and warehouse build." },
  { id: "classification", title: "Classification Results", desc: "Model comparison, best accuracy, confusion matrices." },
  { id: "clustering", title: "Clustering Profile", desc: "RFM segments, silhouette, cluster sizes." },
  { id: "association", title: "Association Rules", desc: "Top market-basket rules by lift." },
  { id: "full", title: "Full Project Report", desc: "Everything above in one document." },
];

const FORMATS: { id: Format; label: string; icon: any; ext: string }[] = [
  { id: "pdf", label: "PDF", icon: FileType, ext: ".pdf" },
  { id: "png", label: "PNG Image", icon: ImageIcon, ext: ".png" },
  { id: "doc", label: "Word (.doc)", icon: FileText, ext: ".doc" },
];

export function ReportsPage() {
  const [report, setReport] = useState<ReportId>("executive");
  const [format, setFormat] = useState<Format>("pdf");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const renderRef = useRef<HTMLDivElement>(null);

  const generate = async () => {
    if (!renderRef.current) return;
    setBusy(true);
    setDone(false);
    try {
      const filename = `retailmine-${report}-${new Date().toISOString().slice(0, 10)}`;
      if (format === "pdf") await exportPDF(renderRef.current, filename);
      else if (format === "png") await exportPNG(renderRef.current, filename);
      else await exportDoc(renderRef.current, filename);
      setDone(true);
      setTimeout(() => setDone(false), 2500);
    } finally {
      setBusy(false);
    }
  };

  const meta = REPORTS.find((r) => r.id === report)!;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <h3 className="font-semibold text-slate-900 mb-1">Report Type</h3>
            <p className="text-xs text-slate-500 mb-4">Choose what to include</p>
            <div className="space-y-2">
              {REPORTS.map((r) => {
                const on = report === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setReport(r.id)}
                    className={`w-full text-left p-3 rounded-xl border transition ${on ? "bg-[#1f4d2b] text-white border-[#1f4d2b]" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}`}
                  >
                    <p className="text-sm font-medium">{r.title}</p>
                    <p className={`text-xs mt-0.5 ${on ? "text-white/80" : "text-slate-500"}`}>{r.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <h3 className="font-semibold text-slate-900 mb-1">Format</h3>
            <p className="text-xs text-slate-500 mb-4">How to download it</p>
            <div className="grid grid-cols-3 gap-2">
              {FORMATS.map((f) => {
                const on = format === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition ${on ? "bg-[#dff2c8] border-[#1f4d2b]/30" : "bg-white border-slate-200 hover:bg-slate-50"}`}
                  >
                    <f.icon size={20} className={on ? "text-[#1f4d2b]" : "text-slate-500"} />
                    <span className={`text-xs font-medium ${on ? "text-[#1f4d2b]" : "text-slate-700"}`}>{f.label}</span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={generate}
              disabled={busy}
              className="mt-5 w-full bg-[#1f4d2b] text-white text-sm font-medium py-3 rounded-full flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : done ? <Check size={14} /> : <Download size={14} />}
              {busy ? "Generating..." : done ? "Downloaded" : `Generate ${FORMATS.find((f) => f.id === format)!.label}`}
            </button>
            <p className="text-[11px] text-slate-400 mt-3 text-center">
              {format === "doc" ? ".doc files open in Microsoft Word, Google Docs and Pages." : "Generated client-side in your browser."}
            </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-slate-100 rounded-2xl p-5 border border-slate-200">
            <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-semibold">Preview · {meta.title}</p>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div ref={renderRef} className="p-8 text-slate-900" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
                <ReportBody report={report} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportBody({ report }: { report: ReportId }) {
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1f4d2b] text-white flex items-center justify-center font-bold">R</div>
            <span className="font-semibold">RetailMine</span>
          </div>
          <span className="text-xs text-slate-500">{today}</span>
        </div>
        <h1 className="text-2xl font-bold mb-1">{REPORTS.find((r) => r.id === report)!.title}</h1>
        <p className="text-sm text-slate-600">Retail Sales Data Mining · BCSC 406 · Group 1</p>
      </div>

      {(report === "executive" || report === "full") && <ExecutiveSection />}
      {(report === "dataset" || report === "full") && <DatasetSection />}
      {(report === "cleaning" || report === "full") && <CleaningSection />}
      {(report === "classification" || report === "full") && <ClassificationSection />}
      {(report === "clustering" || report === "full") && <ClusteringSection />}
      {(report === "association" || report === "full") && <AssociationSection />}

      <div className="border-t border-slate-200 pt-4 text-xs text-slate-400 text-center">
        Generated by RetailMine · Ho Technical University · Department of Computer Science
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-3 border-l-4 border-[#1f4d2b] pl-3">{title}</h2>
      {children}
    </section>
  );
}

function ExecutiveSection() {
  return (
    <Section title="Executive Summary">
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { l: "Transactions", v: "525,461" }, { l: "Cleaned Rows", v: "400,916" },
          { l: "Customers", v: "4,383" }, { l: "Best Accuracy", v: "99.99%" },
        ].map((k) => (
          <div key={k.l} className="border border-slate-200 rounded-lg p-3">
            <p className="text-[10px] uppercase text-slate-500">{k.l}</p>
            <p className="text-lg font-semibold">{k.v}</p>
          </div>
        ))}
      </div>
      <p className="text-sm leading-relaxed text-slate-700">
        This report summarises the findings of the Retail Sales Data Mining project on the UCI Online Retail II dataset.
        After cleaning 525K transactions down to 401K valid records, four classifiers were trained on RevenueClass and
        Random Forest emerged with 99.99% accuracy. K-Means clustering (k=4) achieved a silhouette score of 0.61,
        revealing Champions, At-Risk, New, and Dormant customer segments. FP-Growth identified 29 strong association
        rules with lift &gt; 2, supporting bundle and placement decisions.
      </p>
    </Section>
  );
}

function DatasetSection() {
  return (
    <Section title="Dataset Quality">
      <table className="w-full text-xs border border-slate-200">
        <thead className="bg-slate-50">
          <tr><th className="text-left p-2">Metric</th><th className="text-left p-2">Value</th><th className="text-left p-2">Notes</th></tr>
        </thead>
        <tbody>
          <tr className="border-t border-slate-200"><td className="p-2">Source</td><td className="p-2">UCI Online Retail II</td><td className="p-2 text-slate-500">Excel, 2 sheets</td></tr>
          <tr className="border-t border-slate-200"><td className="p-2">Total rows</td><td className="p-2">525,461</td><td className="p-2 text-slate-500">Raw, Year 2009–2010</td></tr>
          <tr className="border-t border-slate-200"><td className="p-2">Missing Customer ID</td><td className="p-2">107,927 (20.5%)</td><td className="p-2 text-slate-500">Largest data quality issue</td></tr>
          <tr className="border-t border-slate-200"><td className="p-2">Duplicates</td><td className="p-2">6,865</td><td className="p-2 text-slate-500">Exact row matches</td></tr>
          <tr className="border-t border-slate-200"><td className="p-2">Countries</td><td className="p-2">40</td><td className="p-2 text-slate-500">UK dominates (92%)</td></tr>
        </tbody>
      </table>
    </Section>
  );
}

function CleaningSection() {
  const steps = [
    ["Standardise column names", "All cols"],
    ["Drop missing Customer ID", "-107,927"],
    ["Drop missing Description", "-2,928"],
    ["Remove cancelled invoices", "-10,206"],
    ["Remove non-positive Quantity/Price", "-16,016"],
    ["Remove duplicate rows", "-6,865"],
    ["Feature engineering", "+7 cols"],
  ];
  return (
    <Section title="Cleaning Pipeline">
      <p className="text-sm text-slate-700 mb-3">76.3% of raw rows retained (400,916 / 525,461).</p>
      <table className="w-full text-xs border border-slate-200">
        <thead className="bg-slate-50"><tr><th className="text-left p-2">#</th><th className="text-left p-2">Step</th><th className="text-left p-2">Effect</th></tr></thead>
        <tbody>
          {steps.map(([s, e], i) => (
            <tr key={i} className="border-t border-slate-200"><td className="p-2">{i + 1}</td><td className="p-2">{s}</td><td className="p-2">{e}</td></tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
}

function ClassificationSection() {
  const models = [
    ["Decision Tree", "99.87%", "99.87%", "99.87%", "99.87%"],
    ["Random Forest", "99.99%", "99.99%", "99.99%", "99.99%"],
    ["Naive Bayes", "52.38%", "52.10%", "52.40%", "48.70%"],
    ["K-Nearest Neighbour", "98.90%", "98.90%", "98.90%", "98.90%"],
  ];
  return (
    <Section title="Classification Results">
      <table className="w-full text-xs border border-slate-200">
        <thead className="bg-slate-50"><tr>{["Algorithm", "Accuracy", "Precision", "Recall", "F1"].map((h) => <th key={h} className="text-left p-2">{h}</th>)}</tr></thead>
        <tbody>
          {models.map((m, i) => (
            <tr key={i} className={`border-t border-slate-200 ${m[0] === "Random Forest" ? "bg-[#dff2c8]" : ""}`}>
              {m.map((c, j) => <td key={j} className="p-2">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-sm text-slate-700 mt-3">Random Forest is the best classifier. Naive Bayes underperforms due to its feature-independence assumption, which does not hold here.</p>
    </Section>
  );
}

function ClusteringSection() {
  const segs = [
    ["Champions", "Low recency, high frequency, high monetary", "28%"],
    ["New / Promising", "Medium recency, low frequency", "22%"],
    ["At-Risk", "Rising recency, declining frequency", "30%"],
    ["Dormant", "High recency, low monetary", "20%"],
  ];
  return (
    <Section title="Clustering Profile">
      <p className="text-sm text-slate-700 mb-3">K-Means (k=4) on standardised RFM · silhouette = 0.61</p>
      <table className="w-full text-xs border border-slate-200">
        <thead className="bg-slate-50"><tr>{["Segment", "Description", "Share"].map((h) => <th key={h} className="text-left p-2">{h}</th>)}</tr></thead>
        <tbody>
          {segs.map((s, i) => (
            <tr key={i} className="border-t border-slate-200">{s.map((c, j) => <td key={j} className="p-2">{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
}

function AssociationSection() {
  const rules = [
    ["PINK CHERRY LIGHTS", "WHITE CHERRY LIGHTS", "4.1%", "82%", "3.20"],
    ["GREEN REGENCY TEACUP", "ROSES REGENCY TEACUP", "3.8%", "78%", "3.05"],
    ["JUMBO BAG RED RETROSPOT", "JUMBO BAG PINK POLKADOT", "2.7%", "65%", "2.58"],
    ["ALARM CLOCK BAKELIKE RED", "ALARM CLOCK BAKELIKE GREEN", "2.4%", "58%", "2.28"],
  ];
  return (
    <Section title="Association Rules">
      <p className="text-sm text-slate-700 mb-3">UK transactions · FP-Growth · min support = 2%, min confidence = 30%</p>
      <table className="w-full text-xs border border-slate-200">
        <thead className="bg-slate-50"><tr>{["Antecedent", "Consequent", "Support", "Confidence", "Lift"].map((h) => <th key={h} className="text-left p-2">{h}</th>)}</tr></thead>
        <tbody>
          {rules.map((r, i) => (
            <tr key={i} className="border-t border-slate-200">{r.map((c, j) => <td key={j} className="p-2">{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
}

async function exportPNG(node: HTMLElement, filename: string) {
  const canvas = await html2canvas(node, { backgroundColor: "#ffffff", scale: 2 });
  const link = document.createElement("a");
  link.download = `${filename}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

async function exportPDF(node: HTMLElement, filename: string) {
  const canvas = await html2canvas(node, { backgroundColor: "#ffffff", scale: 2 });
  const img = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgW = pageW - 40;
  const imgH = (canvas.height / canvas.width) * imgW;
  let y = 20;
  let remaining = imgH;
  // Add first page
  pdf.addImage(img, "PNG", 20, y, imgW, imgH);
  // Paginate if image taller than page
  while (remaining > pageH - 40) {
    remaining -= pageH - 40;
    y -= pageH - 40;
    pdf.addPage();
    pdf.addImage(img, "PNG", 20, y, imgW, imgH);
  }
  pdf.save(`${filename}.pdf`);
}

async function exportDoc(node: HTMLElement, filename: string) {
  const html = `<!DOCTYPE html><html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'><title>${filename}</title>
<style>
  body { font-family: Calibri, Arial, sans-serif; color: #0f172a; }
  table { border-collapse: collapse; width: 100%; margin: 8px 0; }
  th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; font-size: 11pt; }
  th { background: #f1f5f9; }
  h1 { font-size: 22pt; margin: 0 0 6pt 0; }
  h2 { font-size: 14pt; border-left: 4px solid #1f4d2b; padding-left: 8px; margin: 16pt 0 6pt 0; }
  p { font-size: 11pt; line-height: 1.5; }
</style>
</head><body>${node.innerHTML}</body></html>`;
  const blob = new Blob(["﻿", html], { type: "application/msword" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.doc`;
  link.click();
  URL.revokeObjectURL(link.href);
}
