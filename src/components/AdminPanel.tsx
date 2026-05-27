import React, { useState } from 'react';
import { CorruptionReport } from '../types';
import { soundPlayer } from './AudioAlerts';
import { Shield, RefreshCw, Trash2, ArrowUp, Zap, HelpCircle, ShieldAlert, Sparkles, Filter, Check, Terminal, Play, AlertCircle } from 'lucide-react';

interface AdminPanelProps {
  reports: CorruptionReport[];
  onUpdateStatus: (id: string, status: CorruptionReport['status']) => void;
  onDeleteReport: (id: string) => void;
  onAddComment: (id: string, title: string, text: string) => void;
}

export default function AdminPanel({
  reports,
  onUpdateStatus,
  onDeleteReport,
  onAddComment
}: AdminPanelProps) {
  const [selectedRepId, setSelectedRepId] = useState<string>("");
  const [statusInput, setStatusInput] = useState<CorruptionReport['status']>("AI_VERIFIED");
  const [commentTitle, setCommentTitle] = useState("");
  const [commentText, setCommentText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Telemetry logs simulation
  const [systemLogs, setSystemLogs] = useState<string[]>([
    "SYS_INIT: Whistleblower secure state-sync unlocked.",
    "DB_LEDGER: Syncing reports index (5 blocks found).",
    "SSL_ALARM: SSL secure anonymity handshakes verifying safely.",
    "GEO_RADAR: Pulse segments mapping complete for Bangladesh."
  ]);

  const addTelemetryLog = (msg: string) => {
    const formatted = `[${new Date().toLocaleTimeString()}] ${msg}`;
    setSystemLogs(prev => [formatted, ...prev].slice(0, 10));
  };

  const handleApplyStatusChange = (id: string) => {
    soundPlayer.playSonar();
    onUpdateStatus(id, statusInput);
    addTelemetryLog(`STATUS_CHG: Modified case [${id}] status posture to [${statusInput}].`);
  };

  const handleApplyComment = (id: string) => {
    if (!commentTitle || !commentText) return;
    soundPlayer.playNodeLocked();
    onAddComment(id, commentTitle, commentText);
    addTelemetryLog(`COM_ADD: Submitted accountability update details to case ledger [${id}].`);
    setCommentTitle("");
    setCommentText("");
  };

  const handleDeleteCase = (id: string) => {
    if (confirm(`ADMIN ALARM: Are you absolutely sure you want to erase case node [${id}] from the platform ledger? This cannot be undone.`)) {
      soundPlayer.playWarning();
      onDeleteReport(id);
      addTelemetryLog(`NODE_ERASE: Purged case file node [${id}] due to spam/fraud flag.`);
      if (selectedRepId === id) setSelectedRepId("");
    }
  };

  // Filter list
  const filtered = reports.filter(r => {
    if (filterStatus === "ALL") return true;
    return r.status === filterStatus;
  });

  const selectedReport = reports.find(r => r.id === selectedRepId);

  // Global Statistics
  const totalCases = reports.length;
  const verifiedCases = reports.filter(r => r.status === "APPROVED" || r.status === "AI_VERIFIED").length;
  const spamPercentage = totalCases > 0 ? Math.round((reports.filter(r => r.status === "SPAM").length / totalCases) * 100) : 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 min-h-[calc(100vh-140px)] animate-fade-in pb-12 text-white">
      
      {/* LEFT COLUMN: ACTIVE CASES TO MODERATE */}
      <div className="xl:col-span-7 flex flex-col gap-5">
        
        {/* HEADER BAR */}
        <div className="backdrop-blur-md bg-[#0a0a0a]/90 border border-white/10 p-4 rounded-sm shadow-2xl relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
          
          <div>
            <h2 className="text-sm font-black font-sans text-white flex items-center gap-2 uppercase tracking-widest">
              <Shield className="w-5 h-5 text-red-500 animate-pulse" />
              Administrative Moderation Panel
            </h2>
            <p className="text-[10px] font-mono text-white/40 uppercase mt-1">
              PRIVILEGED INTERFACE <span className="text-red-500">•</span> VERIFY CLAIMS & CODES
            </p>
          </div>

          <div className="flex gap-2 items-center">
            <Filter className="w-4 h-4 text-white/40" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white/5 border border-white/10 text-[10px] font-mono text-white rounded px-2.5 py-1.5 focus:outline-none focus:border-red-500"
            >
              <option value="ALL">ALL CASES</option>
              <option value="AI_VERIFIED">AI VERIFIED</option>
              <option value="UNDER_INVESTIGATION">UNDER INVESTIGATION</option>
              <option value="APPROVED">APPROVED BY COURT</option>
              <option value="SPAM">CLASSIFIED SPAM</option>
            </select>
          </div>
        </div>

        {/* LIST */}
        <div className="bg-[#080808] border border-white/10 rounded-sm p-4 shadow-2xl flex-1 flex flex-col overflow-y-auto max-h-[500px] min-h-[300px]">
          <div className="space-y-2">
            {filtered.length > 0 ? (
              filtered.map(r => {
                const isSelected = selectedRepId === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      setSelectedRepId(r.id);
                      soundPlayer.playKeyTap();
                    }}
                    className={`p-4 rounded-sm border cursor-pointer font-mono transition-all duration-300 flex items-center justify-between gap-4 ${
                      isSelected 
                        ? 'bg-white/5 border-red-500' 
                        : 'bg-transparent border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="truncate space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded-sm font-bold">
                          {r.id}
                        </span>
                        <span className="text-white text-xs font-semibold truncate font-sans uppercase">
                          {r.title}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-[9px] text-white/40 uppercase">
                        <span>MINISTRY: {r.ministry}</span>
                        <span>SITE: {r.district}</span>
                        <span>DATE: {r.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-right">
                      {/* STATUS BADGES */}
                      <span className={`text-[9px] px-2 py-0.5 rounded-sm font-bold border font-mono ${
                        r.status === 'APPROVED' ? 'bg-green-600/10 text-green-500 border-green-500/20' :
                        r.status === 'AI_VERIFIED' ? 'bg-cyan-600/10 text-cyan-500 border-cyan-500/20' :
                        r.status === 'SPAM' ? 'bg-red-600/10 text-red-500 border-red-500/20' :
                        'bg-yellow-600/10 text-yellow-500 border-yellow-500/20'
                      }`}>
                        {r.status}
                      </span>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="text-center italic font-mono text-xs text-white/30 py-12">
                No whistleblower files matching this posture category.
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM TELMETRY LOG CONSOLE */}
        <div className="bg-[#080808] border border-white/10 rounded-sm p-4 shadow-2xl">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2.5 mb-3">
            <Terminal className="w-4 h-4 text-white/40" />
            <h4 className="font-mono text-[9px] text-white/60 uppercase tracking-widest">LIVE ACTION SYSTEM TELEMETRY</h4>
          </div>

          <div className="max-h-[100px] overflow-y-auto font-mono text-[10px] text-white/40 space-y-1.5 bg-[#050505] p-3 rounded-none border border-white/5">
            {systemLogs.map((log, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="text-red-500 font-bold">&gt;&gt;</span>
                <span className="truncate">{log}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: ACTION & DETAIL FORM */}
      <div className="xl:col-span-5 flex flex-col gap-5">
        
        {/* ACTOR FORM */}
        <div className="bg-[#080808] border border-white/10 rounded-sm p-5 shadow-2xl flex-1 flex flex-col relative text-white">
          
          {selectedReport ? (
            <div className="space-y-5 h-full flex flex-col justify-between">
              
              <div className="border-b border-white/10 pb-4 space-y-1 font-mono">
                <span className="text-[9px] text-white/40">YOU ARE INSPECTING BLOCK FILE</span>
                <h3 className="text-sm font-bold text-white uppercase truncate">
                  {selectedReport.id}: {selectedReport.title}
                </h3>
                <span className="text-[10px] text-red-500 block uppercase font-bold">AI CREDIBILITY METRIC: {selectedReport.aiAnalysis?.credibilityScore}%</span>
              </div>

              {/* ACTION: ALTER STATUS POSTURE */}
              <div className="space-y-2 font-mono">
                <label className="block text-white/40 text-[10px] uppercase font-bold">Configure File Status Posture</label>
                <div className="flex gap-2">
                  <select
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value as any)}
                    className="bg-[#050505] border border-white/10 text-xs text-white rounded-sm px-2.5 py-2.5 focus:outline-none w-full"
                  >
                    <option value="PENDING">PENDING MODERATION</option>
                    <option value="AI_VERIFIED">AI_VERIFIED (আর্টিফিশিয়াল ফিল্টারিং সফল)</option>
                    <option value="UNDER_INVESTIGATION">UNDER_INVESTIGATION (তদন্তাধীন)</option>
                    <option value="APPROVED">APPROVED LEGITIMATE (জনতার আদালতে সত্য প্রমাণিত)</option>
                    <option value="SPAM">SPAM (ভুয়া বা অপপ্রচার ফ্ল্যাগ)</option>
                  </select>
                  
                  <button
                    onClick={() => handleApplyStatusChange(selectedReport.id)}
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase rounded-sm cursor-pointer transition-colors"
                  >
                    APPLY
                  </button>
                </div>
              </div>

              {/* ACTION: APPEND LEADERBOARD UPDATE DETAILS */}
              <div className="space-y-2 font-mono pt-4 border-t border-white/10">
                <label className="block text-white/40 text-[10px] uppercase font-bold">Inject Audit Timeline Event</label>
                
                <input
                  type="text"
                  value={commentTitle}
                  onChange={(e) => setCommentTitle(e.target.value)}
                  placeholder="e.g. Complaint Sent to NBR Commissioner"
                  className="w-full bg-[#050505] border border-white/10 rounded-sm px-3 py-2.5 text-xs text-white placeholder:text-white/20 focus:outline-none"
                />
                
                <textarea
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Official status update or administrative tribunal minutes block details..."
                  className="w-full bg-[#050505] border border-white/10 rounded-sm p-3 text-xs text-white placeholder:text-white/20 focus:outline-none"
                />

                <button
                  onClick={() => handleApplyComment(selectedReport.id)}
                  disabled={!commentTitle || !commentText}
                  className="w-full py-2.5 bg-white text-black hover:bg-red-600 hover:text-white font-bold rounded-sm text-xs cursor-pointer border border-transparent disabled:opacity-30 disabled:border-white/5 disabled:bg-white/5 disabled:text-white/45 transition-colors uppercase tracking-widest text-[9px]"
                >
                  APPEND TIMELINE BLOCK
                </button>
              </div>

              {/* DANGER DELETION ROOT */}
              <div className="pt-4 border-t border-white/10 mt-auto">
                <button
                  type="button"
                  onClick={() => handleDeleteCase(selectedReport.id)}
                  className="w-full py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 font-bold rounded-sm text-xs cursor-pointer border border-red-500/20 flex items-center justify-center gap-2 transition-colors uppercase tracking-wide"
                >
                  <Trash2 className="w-4 h-4" />
                  PURGE CASE FROM PLATFORM LEDGER (মুছে ফেলুন)
                </button>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center font-mono text-white/30 text-center text-xs p-6 h-full">
              <AlertCircle className="w-10 h-10 text-white/10 animate-pulse mb-3.5" />
              <div className="text-white/40 uppercase tracking-widest font-bold text-[10px] mb-1">SELECT COMPLAINT FILE</div>
              <div className="max-w-xs text-[11px] leading-relaxed">Pick a case record from the active listing on the left to moderate status, append audits, or purge records.</div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
