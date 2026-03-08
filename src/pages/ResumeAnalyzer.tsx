import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { FileText, Upload, CheckCircle2, AlertTriangle, XCircle, Loader2, FileUp } from "lucide-react";
import { useState, useRef } from "react";
import { extractTextFromFile, analyzeResume, type ResumeAnalysis } from "@/lib/resumeAnalyzer";

export default function ResumeAnalyzer() {
  const [results, setResults] = useState<ResumeAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const statusIcon = (s: string) => {
    if (s === "pass") return <CheckCircle2 className="w-4 h-4 text-neon-green" />;
    if (s === "warning") return <AlertTriangle className="w-4 h-4 text-neon-orange" />;
    return <XCircle className="w-4 h-4 text-destructive" />;
  };

  const handleFile = async (file: File) => {
    const validTypes = [".pdf", ".txt", ".md", ".doc", ".docx"];
    const ext = "." + (file.name.split(".").pop()?.toLowerCase() || "");
    if (!validTypes.includes(ext) && !file.type.includes("text")) {
      alert("Please upload a PDF, TXT, or text-based resume file.");
      return;
    }

    setFileName(file.name);
    setIsLoading(true);
    try {
      const text = await extractTextFromFile(file);
      if (!text.trim()) {
        alert("Could not extract text from this file. Try a different format (PDF or TXT).");
        setIsLoading(false);
        return;
      }
      const analysis = analyzeResume(text);
      setResults(analysis);
    } catch (err) {
      console.error("Error analyzing resume:", err);
      alert("Error processing file. Please try a PDF or TXT file.");
    }
    setIsLoading(false);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    setResults(null);
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold gradient-text flex items-center gap-2">
            <FileText className="w-6 h-6 text-neon-orange" /> Resume Analyzer
          </h1>
          <p className="text-sm text-muted-foreground mt-1">AI-powered resume analysis with ATS scoring</p>
        </div>

        {!results && !isLoading ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className={`glass-card p-12 text-center neon-border cursor-pointer transition-all duration-300 ${dragOver ? "border-primary bg-primary/5 scale-[1.01]" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            <input ref={fileInputRef} type="file" accept=".pdf,.txt,.md,.doc,.docx" onChange={onFileChange} className="hidden" />
            <Upload className={`w-12 h-12 mx-auto mb-4 transition-colors ${dragOver ? "text-primary" : "text-muted-foreground"}`} />
            <h2 className="font-display text-lg font-semibold text-foreground mb-2">Upload Your Resume</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Drag & drop or click to browse · <span className="text-primary">PDF</span> or <span className="text-primary">TXT</span> supported
            </p>
            <div className="neon-button text-sm inline-flex items-center gap-2 pointer-events-none">
              <FileUp className="w-4 h-4" /> Choose File
            </div>
          </motion.div>
        ) : isLoading ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center neon-border">
            <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
            <h2 className="font-display text-lg font-semibold text-foreground mb-2">Analyzing Resume...</h2>
            <p className="text-sm text-muted-foreground">{fileName}</p>
          </motion.div>
        ) : results ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* File info */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <FileText className="w-4 h-4 text-primary" />
              <span>{fileName}</span>
              <span className="text-border">·</span>
              <span>~{results.wordCount} words</span>
              <span className="text-border">·</span>
              <span>~{results.pageEstimate} page(s)</span>
            </div>

            {/* ATS Score */}
            <div className="glass-card p-6 neon-border text-center">
              <div className={`font-display text-5xl font-bold mb-2 ${results.atsScore >= 70 ? "neon-text" : results.atsScore >= 50 ? "text-neon-orange" : "text-destructive"}`}>
                {results.atsScore}%
              </div>
              <div className="text-sm text-muted-foreground">ATS Compatibility Score</div>
              <div className="mt-4 h-3 bg-muted rounded-full overflow-hidden max-w-xs mx-auto">
                <motion.div initial={{ width: 0 }} animate={{ width: `${results.atsScore}%` }} transition={{ duration: 1 }}
                  className={`h-full rounded-full ${results.atsScore >= 70 ? "bg-primary" : results.atsScore >= 50 ? "bg-neon-orange" : "bg-destructive"}`}
                />
              </div>
            </div>

            {/* Found Keywords */}
            {results.foundKeywords.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="font-display text-sm font-semibold mb-4 text-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-neon-green" /> Found Keywords ({results.foundKeywords.length})
                </h2>
                <div className="flex flex-wrap gap-2">
                  {results.foundKeywords.map((k, i) => (
                    <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-neon-green/10 text-neon-green border border-neon-green/20">{k}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Section Analysis */}
            <div className="glass-card p-6">
              <h2 className="font-display text-sm font-semibold mb-4 text-foreground">Section Analysis</h2>
              <div className="space-y-3">
                {results.sections.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    {statusIcon(s.status)}
                    <div>
                      <div className="text-sm font-medium text-foreground">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Missing Keywords */}
              <div className="glass-card p-6">
                <h2 className="font-display text-sm font-semibold mb-4 text-foreground">Missing Keywords</h2>
                <div className="flex flex-wrap gap-2">
                  {results.missingKeywords.map((k, i) => (
                    <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">{k}</span>
                  ))}
                </div>
              </div>
              {/* Suggestions */}
              <div className="glass-card p-6">
                <h2 className="font-display text-sm font-semibold mb-4 text-foreground">AI Suggestions</h2>
                <ul className="space-y-2">
                  {results.suggestions.map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5">→</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button onClick={reset} className="neon-button-outline text-sm">Upload New Resume</button>
          </motion.div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
