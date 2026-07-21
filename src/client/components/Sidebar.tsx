import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  UploadCloud,
  History,
  Star,
  BarChart2,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Activity,
  Sparkles,
} from "lucide-react";

export type NavTab =
  | "dashboard"
  | "upload"
  | "history"
  | "saved"
  | "analytics"
  | "settings"
  | "about";

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  hasAnalysisData: boolean;
  historyCount: number;
  starredCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  hasAnalysisData,
  historyCount,
  starredCount,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem("insightflow_sidebar_collapsed") === "true";
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("insightflow_sidebar_collapsed", String(next));
      return next;
    });
  };

  const navItems = [
    {
      id: "dashboard" as NavTab,
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      disabled: !hasAnalysisData,
      badge: hasAnalysisData ? "Active" : null,
    },
    {
      id: "upload" as NavTab,
      label: "Upload Conversation",
      icon: <UploadCloud className="h-5 w-5" />,
      disabled: false,
      badge: null,
    },
    {
      id: "history" as NavTab,
      label: "Analysis History",
      icon: <History className="h-5 w-5" />,
      disabled: false,
      badge: historyCount > 0 ? String(historyCount) : null,
    },
    {
      id: "saved" as NavTab,
      label: "Saved Reports",
      icon: <Star className="h-5 w-5 text-amber-400" />,
      disabled: false,
      badge: starredCount > 0 ? String(starredCount) : null,
    },
    {
      id: "analytics" as NavTab,
      label: "Analytics",
      icon: <BarChart2 className="h-5 w-5 text-cyan-400" />,
      disabled: false,
      badge: "Live",
    },
    {
      id: "settings" as NavTab,
      label: "Settings",
      icon: <Settings className="h-5 w-5" />,
      disabled: false,
      badge: null,
    },
    {
      id: "about" as NavTab,
      label: "About InsightFlow",
      icon: <HelpCircle className="h-5 w-5" />,
      disabled: false,
      badge: null,
    },
  ];

  return (
    <aside
      className={`relative sticky top-0 h-screen border-r border-slate-800/80 bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 z-30 select-none ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80 h-16">
          <div
            className="flex items-center space-x-3 cursor-pointer overflow-hidden"
            onClick={() => setActiveTab("upload")}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20 flex-shrink-0">
              <Activity className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-sm text-white tracking-tight">InsightFlow</span>
                  <span className="rounded bg-cyan-500/10 px-1.5 py-0.2 text-[10px] font-bold text-cyan-400 border border-cyan-500/20">
                    AI
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block truncate font-medium">Healthcare SaaS</span>
              </div>
            )}
          </div>

          <button
            onClick={toggleCollapse}
            className="hidden sm:flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Items List */}
        <nav className="p-2 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (!item.disabled) setActiveTab(item.id);
                }}
                disabled={item.disabled}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                    : item.disabled
                    ? "text-slate-600 cursor-not-allowed opacity-50"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && item.badge && (
                  <span
                    className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-800 text-cyan-400 border border-slate-700"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800/80">
        {!isCollapsed ? (
          <div className="rounded-xl bg-slate-900/80 p-3 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center space-x-1 font-bold text-cyan-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Insight Engine v1.2</span>
            </div>
            <p className="text-[10px] text-slate-500">Zero-Hallucination Evidence Audit Trail</p>
          </div>
        ) : (
          <div className="flex justify-center text-cyan-400">
            <Sparkles className="h-4 w-4" />
          </div>
        )}
      </div>
    </aside>
  );
};
