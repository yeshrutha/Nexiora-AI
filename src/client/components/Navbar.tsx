import React from "react";
import { Activity, Cpu, LayoutDashboard, UploadCloud, ShieldCheck } from "lucide-react";

interface NavbarProps {
  activeTab: "home" | "dashboard";
  setActiveTab: (tab: "home" | "dashboard") => void;
  providerUsed?: string;
  modelName?: string;
  hasAnalysisData: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  providerUsed = "Insight Analysis Engine",
  modelName = "Insight Engine v1.2",
  hasAnalysisData,
}) => {
  const displayProviderName =
    providerUsed === "mock"
      ? "Insight Analysis Engine"
      : providerUsed;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("home")}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-white font-sans">Nexiora</span>
              <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-xs font-semibold text-cyan-400 border border-cyan-500/20">
                AI
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Healthcare Client Intelligence</p>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="flex items-center space-x-1 rounded-xl bg-slate-900/90 p-1 border border-slate-800">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-200 ${
              activeTab === "home"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload & Analyze</span>
          </button>
          <button
            onClick={() => {
              if (hasAnalysisData) setActiveTab("dashboard");
            }}
            disabled={!hasAnalysisData}
            className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-200 ${
              activeTab === "dashboard"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20"
                : hasAnalysisData
                ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                : "text-slate-600 cursor-not-allowed opacity-50"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Clinical Dashboard</span>
            {hasAnalysisData && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
            )}
          </button>
        </nav>

        {/* Engine Status Badge */}
        <div className="hidden md:flex items-center space-x-2 rounded-xl bg-slate-900/80 px-3 py-1.5 border border-slate-800 text-xs">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/50">
            <Cpu className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Engine:</span>
              <span className="font-semibold text-slate-200 capitalize">{displayProviderName}</span>
            </div>
            <div className="text-[10px] text-cyan-400 font-mono truncate max-w-[150px]">{modelName}</div>
          </div>
          <ShieldCheck className="h-4 w-4 text-emerald-400 ml-1" />
        </div>
      </div>
    </header>
  );
};
