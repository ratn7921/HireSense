import { useState, useEffect } from "react";
import { api } from "../../api/client";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import * as pdfjsLib from 'pdfjs-dist';

// Try to load worker from local node_modules first, fallback to CDN
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

export default function ResumeUpload() {
  const [text, setText] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Initialize worker
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker || `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
    } catch (err) {
      console.error("Failed to set PDF worker source:", err);
    }
  }, []);

  const handleFile = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf" && file.type !== "text/plain") {
      setStatus("error");
      setErrorMessage("Please upload a PDF or TXT file.");
      return;
    }

    setFileName(file.name);
    setLoading(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      let extractedText = "";
      if (file.type === "application/pdf") {
        console.log("Parsing PDF...");
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          standardFontDataUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/standard_fonts/`
        });

        const pdf = await loadingTask.promise;
        console.log(`PDF loaded with ${pdf.numPages} pages`);

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map((item: any) => item.str).join(" ");
          extractedText += pageText + "\n";
        }
      } else {
        extractedText = await file.text();
      }

      if (!extractedText.trim()) {
        throw new Error("No text could be extracted from this file.");
      }

      console.log("Text extracted successfully, length:", extractedText.length);
      setText(extractedText);
      setStatus("idle");
    } catch (e: any) {
      console.error("File processing error:", e);
      setStatus("error");
      setErrorMessage(e.message || "Failed to parse file. Try copying and pasting the text manually.");
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const submit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      console.log("Uploading resume text to backend...");
      const res = await api.uploadResume(text);
      if (!res.ok) throw new Error("Server returned an error");

      setStatus("success");
      console.log("Resume saved successfully");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (e: any) {
      console.error("Upload error:", e);
      setStatus("error");
      setErrorMessage("Failed to save resume to server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-8 w-full max-w-lg mx-auto relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />

      <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
        <FileText className="text-indigo-400" />
        Upload Resume
      </h2>
      <p className="text-zinc-400 mb-6 text-sm">
        Upload your PDF or TXT resume to get AI-powered job matching.
      </p>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${isDragOver
            ? "border-indigo-500 bg-indigo-500/10"
            : "border-zinc-700 hover:border-zinc-600 bg-zinc-800/30"
          }`}
      >
        <input
          type="file"
          id="resume-upload"
          className="hidden"
          accept=".pdf,.txt"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
            {loading ? (
              <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
            ) : (
              <Upload className="w-6 h-6 text-zinc-400" />
            )}
          </div>

          {fileName ? (
            <div className="text-indigo-400 font-medium truncate max-w-xs">{fileName}</div>
          ) : (
            <div className="space-y-1">
              <p className="font-medium">Click to upload or drag and drop</p>
              <p className="text-xs text-zinc-500">PDF or TXT (max 5MB)</p>
            </div>
          )}

          {!fileName && (
            <label
              htmlFor="resume-upload"
              className="btn-secondary text-xs py-1.5 cursor-pointer"
            >
              Select File
            </label>
          )}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
            {text ? "Resume Content Preview" : "Or Paste Text Manually"}
          </span>
          {text && <span className="text-xs text-zinc-500">{text.length} chars</span>}
        </div>
        <textarea
          className="input-field min-h-[120px] text-xs font-mono text-zinc-400 mb-4"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your resume text here if file upload fails..."
        />

        <button
          onClick={submit}
          disabled={loading || !text.trim()}
          className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : status === "success" ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Saved Successfully
            </>
          ) : (
            "Save Resume"
          )}
        </button>
      </div>

      {status === "error" && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{errorMessage || "Something went wrong. Please try again."}</span>
        </div>
      )}
    </div>
  );
}
