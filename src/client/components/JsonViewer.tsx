import React, { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Check, Code, FileJson } from "lucide-react";

interface JsonViewerProps {
  data: any;
  title?: string;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ data, title = "Collapsible Raw JSON & Zod Payload" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden backdrop-blur-xl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 sm:p-5 text-left bg-slate-950/80 hover:bg-slate-950 transition"
      >
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <FileJson className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>{title}</span>
              <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-cyan-400 border border-slate-700">
                Validated Zod Structure
              </span>
            </h3>
            <p className="text-xs text-slate-400">View exact JSON response & anti-hallucination evidence payload</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isOpen ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-slate-800 bg-slate-950 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-500">application/json ({jsonString.length} bytes)</span>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1 text-xs font-semibold text-cyan-300 border border-slate-700 transition"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Copied JSON</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Payload</span>
                </>
              )}
            </button>
          </div>

          <pre className="max-h-96 overflow-auto rounded-xl bg-slate-900/90 p-4 text-[11px] font-mono text-cyan-300 leading-relaxed border border-slate-800">
            {jsonString}
          </pre>
        </div>
      )}
    </div>
  );
};
