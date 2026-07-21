import React, { useState } from "react";
import { AppSettings } from "../types/history.ts";
import { applyTheme, ThemeMode } from "../utils/theme.ts";
import { Settings, Moon, Sun, Monitor, Check, Database } from "lucide-react";

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings: initialSettings,
  onSaveSettings,
}) => {
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleUpdate = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    onSaveSettings(updated);

    if (key === "theme") {
      applyTheme(value as ThemeMode);
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Application Settings</h1>
            <p className="text-xs text-slate-400">Manage theme appearance and local storage preferences</p>
          </div>
        </div>

        {savedSuccess && (
          <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30 animate-in fade-in duration-200">
            <Check className="h-4 w-4" />
            <span>Preference Saved</span>
          </div>
        )}
      </div>

      {/* Settings Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-xl backdrop-blur-xl space-y-6">
        {/* 1. Theme Selection */}
        <div className="space-y-3 pb-6 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Moon className="h-4 w-4 text-cyan-400" />
              <span>Interface Theme</span>
            </h3>
            <p className="text-xs text-slate-400">Select application visual appearance across all views</p>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-1">
            {[
              { id: "dark", label: "Dark Mode", icon: <Moon className="h-4 w-4" /> },
              { id: "light", label: "Light Mode", icon: <Sun className="h-4 w-4" /> },
              { id: "system", label: "System Sync", icon: <Monitor className="h-4 w-4" /> },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => handleUpdate("theme", t.id as any)}
                className={`flex items-center justify-center space-x-2 rounded-xl py-3 text-xs font-bold border transition ${
                  settings.theme === t.id
                    ? "bg-slate-800 text-cyan-400 border-cyan-500 shadow-md"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Local Storage Persistence */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Database className="h-4 w-4 text-cyan-400" />
              <span>Local Storage Preferences</span>
            </h3>
            <p className="text-xs text-slate-400">Control how client reports are saved and restored locally</p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <div className="text-xs font-bold text-slate-200">Auto Save Reports to Local History</div>
              <div className="text-[11px] text-slate-400">Automatically persist completed analyses to browser LocalStorage</div>
            </div>
            <button
              onClick={() => handleUpdate("autoSaveReports", !settings.autoSaveReports)}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                settings.autoSaveReports ? "bg-cyan-500" : "bg-slate-800"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.autoSaveReports ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <div>
              <div className="text-xs font-bold text-slate-200">Remember Last Active Analysis</div>
              <div className="text-[11px] text-slate-400 font-normal">Reopen the most recent report on page refresh</div>
            </div>
            <button
              onClick={() => handleUpdate("rememberLastAnalysis", !settings.rememberLastAnalysis)}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                settings.rememberLastAnalysis ? "bg-cyan-500" : "bg-slate-800"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.rememberLastAnalysis ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
