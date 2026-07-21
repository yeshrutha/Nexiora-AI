import React from "react";
import {
  Activity,
  ShieldCheck,
  BrainCircuit,
  FileCheck2,
  Lock,
  Sparkles,
  ArrowRight,
  Database,
  Cpu,
  LayoutDashboard,
  FileText,
} from "lucide-react";

export const AboutView: React.FC = () => {
  const features = [
    {
      title: "Structured Clinical Extraction",
      description: "Extracts sleep, nutrition, exercise, steps, water, symptoms, and stress into validated schema metrics.",
      icon: <BrainCircuit className="h-5 w-5 text-cyan-400" />,
    },
    {
      title: "Zero-Hallucination Evidence Grounding",
      description: "Every AI statement must reference explicit line IDs (L1, L2...). Missing information is explicitly flagged.",
      icon: <Lock className="h-5 w-5 text-emerald-400" />,
    },
    {
      title: "Human-in-the-Loop Review",
      description: "Coaches inspect, edit, approve, or reject AI outputs prior to final client delivery.",
      icon: <ShieldCheck className="h-5 w-5 text-indigo-400" />,
    },
    {
      title: "Explainable AI Audit Trail",
      description: "Interactive timeline links metrics to line quotes with pulsing highlights and hover audit context.",
      icon: <FileCheck2 className="h-5 w-5 text-teal-400" />,
    },
  ];

  const pipelineSteps = [
    { step: "1", title: "Conversation Input", desc: ".txt, .pdf, .docx, or pasted dialogue", icon: <FileText className="h-4 w-4 text-cyan-400" /> },
    { step: "2", title: "Conversation Parser", desc: "Assigns Line IDs, Speaker tags, Day markers", icon: <Database className="h-4 w-4 text-blue-400" /> },
    { step: "3", title: "Analysis Provider", desc: "Insight Analysis Engine / Gemini / Claude", icon: <Cpu className="h-4 w-4 text-amber-400" /> },
    { step: "4", title: "Zod Schema & Chronology", desc: "Guarantees zero hallucinations & time consistency", icon: <ShieldCheck className="h-4 w-4 text-emerald-400" /> },
    { step: "5", title: "Clinical Dashboard", desc: "Interactive intelligence report & evidence timeline", icon: <LayoutDashboard className="h-4 w-4 text-indigo-400" /> },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Brand Overview */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 rounded-full bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-400 border border-cyan-500/20 shadow-sm">
          <Activity className="h-4 w-4" />
          <span>InsightFlow AI Platform</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
          Evidence-Grounded Client Intelligence Platform
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Designed for healthcare & wellness practitioners to analyze client consultation transcripts, monitor physical symptoms, track lifestyle metrics, and maintain verifiable clinical evidence audit trails.
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map((f, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur-xl space-y-2 hover:border-slate-700 transition"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 border border-slate-700">
              {f.icon}
            </div>
            <h3 className="text-sm font-bold text-white">{f.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>

      {/* System Architecture Pipeline Flowchart */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-xl space-y-5">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span>End-to-End System Architecture</span>
          </h2>
          <p className="text-xs text-slate-400">Request pipeline execution flow from raw input to clinical dashboard</p>
        </div>

        {/* Step-by-Step Flowchart */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 relative">
          {pipelineSteps.map((s, idx) => (
            <React.Fragment key={s.step}>
              <div className="flex-1 w-full rounded-xl bg-slate-950 p-4 border border-slate-800 text-center space-y-1 relative group hover:border-cyan-500/50 transition">
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 mb-2">
                  {s.icon}
                </div>
                <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase">Step {s.step}</div>
                <div className="text-xs font-bold text-slate-200">{s.title}</div>
                <div className="text-[11px] text-slate-400 leading-snug">{s.desc}</div>
              </div>

              {idx < pipelineSteps.length - 1 && (
                <ArrowRight className="hidden md:block h-5 w-5 text-slate-600 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
