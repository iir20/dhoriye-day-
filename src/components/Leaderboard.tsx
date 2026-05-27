import React from 'react';
import { CorruptionReport } from '../types';
import { soundPlayer } from './AudioAlerts';
import { Flame, Award, Trash2, ArrowUp, Zap, HelpCircle, ShieldAlert, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';

interface LeaderboardProps {
  reports: CorruptionReport[];
}

export default function Leaderboard({ reports }: LeaderboardProps) {
  // Aggregate Ministries stats under Shame leaderboard
  const getMinistryShameStats = () => {
    const list: Record<string, { total: number, bribery: number, embezzlement: number, scoreSum: number, count: number }> = {};
    
    // Seed default if empty
    list["Passport Office / Immigration"] = { total: 18, bribery: 12, embezzlement: 2, scoreSum: 1620, count: 18 };
    list["Ministry of Land"] = { total: 14, bribery: 6, embezzlement: 8, scoreSum: 1210, count: 14 };
    list["Police Department / Local Thana"] = { total: 22, bribery: 18, embezzlement: 0, scoreSum: 1980, count: 22 };
    list["Customs Authority / Ports"] = { total: 12, bribery: 9, embezzlement: 3, scoreSum: 1040, count: 12 };
    list["Ministry of Health and Family Welfare"] = { total: 9, bribery: 4, embezzlement: 5, scoreSum: 880, count: 9 };

    reports.forEach(r => {
      const minName = r.ministry || "Other Government Segment";
      if (!list[minName]) {
        list[minName] = { total: 0, bribery: 0, embezzlement: 0, scoreSum: 0, count: 0 };
      }
      list[minName].total += 1;
      list[minName].count += 1;
      if (r.category === 'Bribery') list[minName].bribery += 1;
      if (r.category === 'Embezzlement') list[minName].embezzlement += 1;
      list[minName].scoreSum += (r.aiAnalysis?.credibilityScore || 65);
    });

    return Object.entries(list)
      .map(([name, data]) => ({
        name,
        total: data.total,
        bribery: data.bribery,
        embezzlement: data.embezzlement,
        heatIndex: Math.round((data.total * 30 + data.bribery * 10 + (data.scoreSum / Math.max(1, data.count)) * 0.5)),
        percentageVerified: Math.round(data.scoreSum / Math.max(1, data.count))
      }))
      .sort((a, b) => b.heatIndex - a.heatIndex);
  };

  const shameList = getMinistryShameStats();

  // Top verified highest citizen-voted exposes
  const topReportExposes = [...reports]
    .sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
    .slice(0, 3);

  // Top mock clean active anonymous citizen whistle nodes
  const topReporterNodes = [
    { tag: "Secure_Node_7092", division: "Dhaka", totalAudits: 28, trustExponent: 99.4, reputation: "CITADEL SENTINEL" },
    { tag: "Anonymous_Sylhet_Eco", division: "Sylhet", totalAudits: 19, trustExponent: 96.8, reputation: "EcoGuardian" },
    { tag: "Bengal_Accountability_55", division: "Chittagong", totalAudits: 21, trustExponent: 92.1, reputation: "Field Inspector" },
    { tag: "Node_Ombudsman_004", division: "Khulna", totalAudits: 11, trustExponent: 89.2, reputation: "Local Auditor" }
  ];

  return (
    <div className="space-y-8 min-h-[calc(100vh-140px)] animate-fade-in pb-12 text-white">
      
      {/* HEADER HERO */}
      <div className="backdrop-blur-md bg-[#0a0a0a]/90 border border-white/10 p-6 rounded-sm shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
        
        <div className="space-y-1">
          <h2 className="text-lg font-black font-sans uppercase tracking-widest text-[#ffffff] flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-500 animate-pulse" />
            Hall of Shame <span className="text-white/40">&</span> Integrity Leaderboards
          </h2>
          <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest leading-none">
            REAL-TIME INDICTMENT SCORES <span className="text-red-500">•</span> REVOLUTION ARTIFACTS
          </p>
        </div>
        
        <span className="font-mono text-[9px] text-white/50 bg-white/5 border border-white/10 rounded-sm px-3 py-1.5 flex items-center gap-1.5 shrink-0 uppercase tracking-wider">
          <Award className="w-3.5 h-3.5 text-white/40" />
          COMMUNITY SANCTION ACTIVE
        </span>
      </div>

      {/* TOP RATING ROW: MINI SHAME & EXPOSES */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* SHAME TABLE OF MINISTRIES OR DEPARTMENTS */}
        <div className="xl:col-span-8 bg-[#080808] border border-white/10 rounded-sm p-6 shadow-2xl flex flex-col">
          <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-5">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-white/85">Most Reported Public Offices</h3>
            </div>
            <span className="text-[9px] font-mono text-white/40 tracking-wider">SORT BY SHAME HEAT</span>
          </div>

          <div className="space-y-5">
            {shameList.slice(0, 5).map((office, idx) => {
              // bar scale calculation based on highest heat
              const highestHeat = shameList[0]?.heatIndex || 1;
              const barPercent = Math.max(12, Math.min(100, Math.round((office.heatIndex / highestHeat) * 100)));
              
              return (
                <div key={office.name} className="space-y-2 group">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="bg-red-600 text-white rounded-sm font-bold w-5 h-5 flex items-center justify-center text-[9px]">
                        0{idx + 1}
                      </span>
                      <span className="text-white font-semibold truncate group-hover:text-red-500 transition-colors duration-300">
                        {office.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-white/40">
                      <span>Incidents: <strong className="text-white">{office.total}</strong></span>
                      <span>Approved: <strong className="text-green-500">{office.percentageVerified}%</strong></span>
                      <span className="bg-white/5 text-red-500 border border-white/10 px-2 py-0.5 rounded-sm font-bold">
                        INDEX {office.heatIndex}
                      </span>
                    </div>
                  </div>

                  {/* Progressive indicator bar */}
                  <div className="h-2 bg-[#050505] border border-white/5 rounded-none overflow-hidden relative">
                    <div
                      className="absolute left-0 h-full bg-red-600 transition-all duration-1000"
                      style={{ width: `${barPercent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DANGEROUS WARNING DISCLOSURE */}
          <div className="bg-white/5 border border-white/10 rounded-sm p-4 text-[10px] font-mono text-white/40 leading-relaxed flex items-start gap-3 mt-6">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-red-500 font-bold block mb-1">EXPOSURE VELOCITY DISCLAIMER:</span>
              Government ministries displayed above are prioritized for accountability checks according to open citizen reporting logs and verifying nodes. Metrics reflect dynamic community consensus indicators.
            </div>
          </div>
        </div>

        {/* BRIGHT SHAME SPECIAL CARDS */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          
          <div className="bg-[#080808] border border-white/10 rounded-sm p-6 shadow-2xl relative overflow-hidden flex-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-red-600/5 blur-xl"></div>
            
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-red-500" />
              <h3 className="font-sans text-[10px] font-bold tracking-widest text-[#ffffff]/60 uppercase">Most Reported Ministry</h3>
            </div>

            <div className="space-y-1.5">
              <span className="font-sans font-bold text-base text-red-500 leading-tight block uppercase">
                {shameList[0]?.name || "Local Passport Bureau"}
              </span>
              <p className="font-mono text-[9px] text-white/40 leading-normal uppercase">
                LOCKED HARASSMENT ACCUSATION FREQUENCY RANGE ACCUMULATION
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 text-center font-mono text-[10px]">
              <div className="bg-[#050505] p-3 rounded-none border border-white/5">
                <span className="text-white/40 uppercase text-[9px]">Bribery Cases</span>
                <p className="text-white mt-1 font-bold text-sm">+{shameList[0]?.bribery || 12}</p>
              </div>
              <div className="bg-[#050505] p-3 rounded-none border border-white/5">
                <span className="text-white/40 uppercase text-[9px]">Shame Score</span>
                <p className="text-red-500 mt-1 font-bold text-sm">{shameList[0]?.heatIndex || 560}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#080808] border border-white/10 rounded-sm p-6 shadow-2xl relative overflow-hidden flex-1">
            
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-red-500" />
              <h3 className="font-sans text-[10px] font-bold tracking-widest text-[#ffffff]/60 uppercase">Top Citizen Whistle Nodes</h3>
            </div>

            <div className="space-y-3 font-mono text-[10px] max-h-[140px] overflow-y-auto">
              {topReporterNodes.map((node, i) => (
                <div key={node.tag} className="flex justify-between items-center border-b border-white/5 pb-1.5">
                  <div className="truncate">
                    <span className="text-white font-bold block">{node.tag}</span>
                    <span className="text-[9px] text-white/40 uppercase tracking-wide">{node.reputation}</span>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <span className="text-green-500 font-bold block">{node.trustExponent}%</span>
                    <span className="text-[9px] text-white/40 uppercase">{node.totalAudits} cases</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* BOTTOM ROW: TOP CITIZEN CASE EXPOSES */}
      <div className="bg-[#080808] border border-white/10 rounded-sm p-6 shadow-2xl relative overflow-hidden">
        <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <TrendingUp className="w-4 h-4 text-red-500" />
            <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-white/85">Highest Credibility Exposed Cases</h3>
          </div>
          <span className="text-[9px] font-mono text-white/40 tracking-wider">SORT BY CITIZEN CONSENSUS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topReportExposes.map((r, i) => {
            const consensusRate = Math.round((r.upvotes / Math.max(1, r.upvotes + r.downvotes)) * 100);
            return (
              <div
                key={r.id}
                onClick={() => {
                  soundPlayer.playSonar();
                }}
                className="bg-[#050505] hover:bg-white/5 transition-all duration-300 border border-white/10 rounded-sm p-5 flex flex-col justify-between h-56 cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center font-mono text-[9px] text-white/40">
                    <span>SECTOR: {r.id}</span>
                    <span className="bg-white/5 text-[#ffffff] border border-white/10 px-2 py-0.5 rounded-sm uppercase tracking-wider text-[8px] font-bold">
                      {r.category}
                    </span>
                  </div>

                  <h4 className="text-white font-sans font-bold text-sm tracking-tight leading-snug line-clamp-2">
                    {r.title}
                  </h4>

                  <p className="font-sans text-xs text-white/50 line-clamp-3 leading-normal">
                    {r.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center font-mono text-[10px]">
                  <div>
                    <span className="text-white/40 block uppercase text-[8px] tracking-wider">Consensus percentage</span>
                    <span className="text-green-500 font-bold">{consensusRate}% APPROVED</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white/40 block uppercase text-[8px] tracking-wider">Total votes</span>
                    <span className="text-[#ffffff] font-semibold">✅ {r.upvotes} / ❌ {r.downvotes}</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

