import React, { useState } from "react";
import { PendingAction } from "../types/insight.ts";
import { CheckCircle2, Clock, AlertCircle, User, Stethoscope, FileText, ChevronRight } from "lucide-react";

interface PendingActionsProps {
  actions: PendingAction[];
  onSelectEvidence: (lineIds: string[]) => void;
}

export const PendingActions: React.FC<PendingActionsProps> = ({ actions: initialActions, onSelectEvidence }) => {
  const [actionsList, setActionsList] = useState<PendingAction[]>(initialActions);

  const toggleStatus = (id: string) => {
    setActionsList((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const nextStatus = a.status === "pending" ? "completed" : a.status === "completed" ? "overdue" : "pending";
          return { ...a, status: nextStatus };
        }
        return a;
      })
    );
  };

  const statusBadgeMap: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
    completed: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/30",
      icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />,
    },
    pending: {
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/30",
      icon: <Clock className="h-3.5 w-3.5 text-amber-400" />,
    },
    overdue: {
      bg: "bg-rose-500/10",
      text: "text-rose-400",
      border: "border-rose-500/30",
      icon: <AlertCircle className="h-3.5 w-3.5 text-rose-400" />,
    },
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white">Pending Action Commitments</h2>
          <p className="text-xs text-slate-400">Goals and assignments identified from conversation</p>
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-mono font-bold text-cyan-400 border border-slate-700">
          {actionsList.filter((a) => a.status === "pending").length} Open / {actionsList.length} Total
        </span>
      </div>

      {actionsList.length === 0 ? (
        <p className="text-xs text-slate-500 italic py-4">No explicit action commitments extracted from this conversation.</p>
      ) : (
        <div className="space-y-3">
          {actionsList.map((action) => {
            const badge = statusBadgeMap[action.status] || statusBadgeMap["pending"];
            const lineIds = action.evidence.map((e) => e.lineId);

            return (
              <div
                key={action.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 gap-3 hover:border-slate-700 transition"
              >
                <div className="flex items-start space-x-3 min-w-0 flex-1">
                  {/* Status Toggle Checkbox */}
                  <button
                    onClick={() => toggleStatus(action.id)}
                    className="mt-0.5 flex-shrink-0 cursor-pointer hover:scale-110 transition-transform"
                    title="Click to toggle action status"
                  >
                    {badge.icon}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-medium ${
                        action.status === "completed" ? "text-slate-400 line-through" : "text-slate-200"
                      }`}
                    >
                      {action.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {/* Assigned To Tag */}
                      <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {action.assignedTo === "coach" ? <Stethoscope className="h-3 w-3 text-indigo-400" /> : <User className="h-3 w-3 text-cyan-400" />}
                        <span>Assigned: {action.assignedTo || "Client"}</span>
                      </span>

                      {/* Evidence Link */}
                      {lineIds.length > 0 && (
                        <button
                          onClick={() => onSelectEvidence(lineIds)}
                          className="inline-flex items-center space-x-1 text-[10px] font-medium text-cyan-400 hover:underline"
                        >
                          <FileText className="h-3 w-3" />
                          <span>Lines ({lineIds.join(", ")})</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <button
                  onClick={() => toggleStatus(action.id)}
                  className={`inline-flex items-center space-x-1.5 rounded-lg px-3 py-1 text-xs font-bold border ${badge.bg} ${badge.text} ${badge.border} flex-shrink-0`}
                >
                  <span className="capitalize">{action.status}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
