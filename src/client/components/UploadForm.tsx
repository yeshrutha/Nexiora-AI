import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  HelpCircle,
  BrainCircuit,
  FileCode,
} from "lucide-react";
import { SAMPLE_CONVERSATIONS } from "../utils/sampleConversations.ts";

export interface AnalysisErrorPayload {
  error: string;
  reason?: string;
  suggestions?: string[];
}

interface UploadFormProps {
  onAnalyze: (payload: { file?: File; text?: string; provider: string; sourceLabel?: string }) => void;
  isLoading: boolean;
  defaultProvider?: string;
  error?: string | AnalysisErrorPayload | null;
}

export const UploadForm: React.FC<UploadFormProps> = ({
  onAnalyze,
  isLoading,
  defaultProvider = "mock",
  error,
}) => {
  const [activeInputType, setActiveInputType] = useState<"file" | "paste">("paste");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState<string>("");
  const [provider, setProvider] = useState<string>(defaultProvider);
  const [sourceLabel, setSourceLabel] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setSourceLabel(file.name);
      setActiveInputType("file");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setSourceLabel(file.name);
      setActiveInputType("file");
    }
  };

  const handleLoadSample = (sampleId: string) => {
    const sample = SAMPLE_CONVERSATIONS.find((s) => s.id === sampleId);
    if (sample) {
      setPastedText(sample.text);
      setSourceLabel(`${sample.clientName} (${sample.title})`);
      setActiveInputType("paste");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeInputType === "file" && selectedFile) {
      triggerProgressAnimation();
      onAnalyze({ file: selectedFile, provider, sourceLabel });
    } else if (activeInputType === "paste" && pastedText.trim()) {
      triggerProgressAnimation();
      onAnalyze({ text: pastedText, provider, sourceLabel: sourceLabel || "Pasted Transcript" });
    }
  };

  const triggerProgressAnimation = () => {
    setLoadingStep(1);
    setTimeout(() => setLoadingStep(2), 300);
    setTimeout(() => setLoadingStep(3), 600);
  };

  const isFormValid =
    (activeInputType === "file" && selectedFile !== null) ||
    (activeInputType === "paste" && pastedText.trim().length >= 15);

  // Normalize Error structure
  const errorObj: AnalysisErrorPayload | null =
    typeof error === "string"
      ? { error: "Analysis could not be completed.", reason: error }
      : error || null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 rounded-full bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-400 border border-cyan-500/20 mb-4 shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Nexiora Analysis Engine v1.2</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Client Conversation Intelligence
        </h1>
        <p className="mt-3 text-base text-slate-400 max-w-2xl mx-auto">
          Upload or paste any client-coach health transcript (`.txt`, `.pdf`, `.docx`). Nexiora AI extracts grounded metrics, evidence timeline pointers, risk flags, and actionable recommendations.
        </p>
      </div>

      {/* Main Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {/* Input Source & Provider Engine */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-800">
            {/* Input Method Toggle */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Transcript Input Format
              </label>
              <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveInputType("paste")}
                  className={`flex-1 flex items-center justify-center space-x-2 rounded-lg py-2 text-xs font-semibold transition-all ${
                    activeInputType === "paste"
                      ? "bg-slate-800 text-cyan-400 shadow-sm border border-slate-700"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span>Paste Transcript</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveInputType("file")}
                  className={`flex-1 flex items-center justify-center space-x-2 rounded-lg py-2 text-xs font-semibold transition-all ${
                    activeInputType === "file"
                      ? "bg-slate-800 text-cyan-400 shadow-sm border border-slate-700"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <UploadCloud className="h-4 w-4" />
                  <span>Upload File</span>
                </button>
              </div>
            </div>

            {/* Provider Engine Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <span>AI Provider Engine</span>
                <span className="text-[10px] text-cyan-400 font-mono">Provider Swapping Enabled</span>
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-medium text-slate-200 focus:border-cyan-500 focus:outline-none transition"
              >
                <option value="mock">⚡ Nexiora Analysis Engine (Development / Local)</option>
                <option value="gemini">✨ Google Gemini 1.5 Pro (Live API)</option>
                <option value="openai">🤖 OpenAI GPT-4o (Live API)</option>
                <option value="claude">🧠 Anthropic Claude 3.5 Sonnet (Live API)</option>
                <option value="groq">🚀 Groq Llama 3.3 70B (Live API)</option>
              </select>
            </div>
          </div>

          {/* Quick Demo Sample Selector */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
            <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Load Test Sample:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_CONVERSATIONS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleLoadSample(sample.id)}
                  className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1 text-xs font-medium text-cyan-300 border border-slate-700 transition flex items-center space-x-1"
                >
                  <span>{sample.title}</span>
                  <ArrowRight className="h-3 w-3 opacity-60" />
                </button>
              ))}
            </div>
          </div>

          {/* File Upload Drag & Drop Zone */}
          {activeInputType === "file" && (
            <div>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? "border-cyan-500 bg-cyan-950/30"
                    : selectedFile
                    ? "border-emerald-500/60 bg-emerald-950/10"
                    : "border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-950"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.pdf,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {selectedFile ? (
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mb-3 border border-emerald-500/30">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-semibold text-slate-200">{selectedFile.name}</span>
                    <span className="text-xs text-slate-400 mt-1">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Ready for extraction
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                      className="mt-3 text-xs text-rose-400 hover:underline"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-cyan-400 mb-3 border border-slate-800">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-semibold text-slate-200">
                      Drag & Drop transcript file here
                    </span>
                    <span className="text-xs text-slate-400 mt-1">
                      Supports <code className="text-cyan-400">.txt</code>, <code className="text-cyan-400">.pdf</code>, <code className="text-cyan-400">.docx</code> (Up to 15MB)
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Paste Text Area */}
          {activeInputType === "paste" && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300">
                  Raw Transcript Dialogue Text
                </label>
                <span className="text-xs text-slate-400 font-mono">
                  {pastedText.length} chars • {pastedText.split("\n").filter(Boolean).length} lines
                </span>
              </div>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste client-coach dialogue here... (e.g. Day 1\nCoach: How did you sleep?\nClient: Slept 7.5 hours and felt rested.)"
                rows={9}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-4 text-xs font-mono text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none leading-relaxed"
              />
            </div>
          )}

          {/* Source Label */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Client / Consultation Identifier (Optional)
            </label>
            <input
              type="text"
              value={sourceLabel}
              onChange={(e) => setSourceLabel(e.target.value)}
              placeholder="e.g. Client Alex Vance - Week 3 Metabolic Check-In"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Professional Structured Error Card */}
          {errorObj && (
            <div className="rounded-2xl bg-rose-950/40 border border-rose-500/40 p-5 space-y-3">
              <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <span>{errorObj.error}</span>
              </div>

              {errorObj.reason && (
                <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-rose-500/20 font-mono">
                  <span className="text-rose-400 font-bold">Reason: </span>
                  <span>{errorObj.reason}</span>
                </div>
              )}

              {errorObj.suggestions && errorObj.suggestions.length > 0 && (
                <div className="text-xs text-slate-300 space-y-1">
                  <div className="font-bold text-slate-400 flex items-center space-x-1">
                    <HelpCircle className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Troubleshooting Suggestions:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
                    {errorObj.suggestions.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Loading Steps Indicator */}
          {isLoading && (
            <div className="rounded-xl bg-slate-950 p-4 border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs text-cyan-400 font-semibold">
                <span className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Processing Clinical Intelligence Pipeline...</span>
                </span>
                <span className="font-mono">Step {loadingStep}/3</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300"
                  style={{ width: `${(loadingStep / 3) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={`w-full flex items-center justify-center space-x-2 rounded-xl py-3.5 text-sm font-bold shadow-lg transition-all ${
                !isFormValid || isLoading
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                  : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/25 active:scale-[0.99]"
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Extracting Clinical Evidence...</span>
                </>
              ) : (
                <>
                  <BrainCircuit className="h-5 w-5" />
                  <span>Analyze Conversation & Extract Intelligence</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
