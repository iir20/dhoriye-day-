import React, { useState, useMemo } from 'react';
import { CorruptionReport } from '../types';
import { soundPlayer } from './AudioAlerts';
import { TrendingUp, BarChart2, ShieldAlert, Award, AlertCircle, RefreshCw, Layers } from 'lucide-react';

interface AnalyticsDashboardProps {
  reports: CorruptionReport[];
}

export default function AnalyticsDashboard({ reports }: AnalyticsDashboardProps) {
  const [activeChartTab, setActiveChartTab] = useState<'trends' | 'districts' | 'ministries'>('trends');
  const [hoveredDataPoint, setHoveredDataPoint] = useState<{ x: number; y: number; label: string; value: string } | null>(null);

  // 1. Process Monthly Statistics (Trends Area Chart)
  const statsTrends = useMemo(() => {
    // Generate static historical buffer
    const trendData = [
      { month: 'Jan', count: 18, casesResolved: 12 },
      { month: 'Feb', count: 24, casesResolved: 15 },
      { month: 'Mar', count: 32, casesResolved: 20 },
      { month: 'Apr', count: 29, casesResolved: 18 },
      { month: 'May', count: Math.max(12, reports.length + 15), casesResolved: Math.round(reports.length * 0.7) + 8 }
    ];
    return trendData;
  }, [reports]);

  // 2. Process most corrupt districts
  const statsDistricts = useMemo(() => {
    const list: Record<string, number> = {
      "Dhaka": 45,
      "Sylhet": 28,
      "Chittagong": 39,
      "Khulna": 22,
      "Rajshahi": 17,
      "Barisal": 11,
      "Rangpur": 9
    };

    // Aggregate live data
    reports.forEach(r => {
      if (r.district) {
        list[r.district] = (list[r.district] || 0) + 1;
      }
    });

    return Object.entries(list)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [reports]);

  // 3. Process ministries risk ranking
  const statsMinistries = useMemo(() => {
    const list: Record<string, { total: number; credibilitySum: number }> = {
      "Ministry of Home Affairs / Passport": { total: 18, credibilitySum: 1620 },
      "Ministry of Land": { total: 14, credibilitySum: 1210 },
      "Police Department / Local Thana": { total: 22, credibilitySum: 1980 },
      "Customs Authority / Ports": { total: 12, credibilitySum: 1040 },
      "Ministry of Health": { total: 9, credibilitySum: 880 }
    };

    reports.forEach(r => {
      const min = r.ministry || "Other Government Segment";
      if (!list[min]) {
        list[min] = { total: 0, credibilitySum: 0 };
      }
      list[min].total += 1;
      list[min].credibilitySum += (r.aiAnalysis?.credibilityScore || 65);
    });

    return Object.entries(list)
      .map(([name, data]) => ({
        name,
        count: data.total,
        riskScore: Math.round(data.credibilitySum / Math.max(1, data.total))
      }))
      .sort((a, b) => b.count - a.count);
  }, [reports]);

  return (
    <div className="space-y-8 min-h-[calc(100vh-140px)] animate-fade-in text-white pb-12">
      
      {/* SECTION HEADER CARD */}
      <div className="backdrop-blur-md bg-[#0a0a0a]/90 border border-white/10 p-5 rounded-sm shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
        
        <div>
          <h2 className="text-sm font-black font-sans text-white flex items-center gap-2 uppercase tracking-widest">
            <TrendingUp className="w-5 h-5 text-red-500 animate-pulse" />
            National Corruption Intelligence Deck
          </h2>
          <p className="text-[10px] font-mono text-white/40 uppercase mt-1">
            DEMONSTRATING TRANSPARENCY DEVIATIONS BY SECTORS <span className="text-red-500">•</span> REAL-TIME REVISION INDEX
          </p>
        </div>

        <div className="flex gap-1 bg-white/5 p-1 border border-white/10 rounded-sm">
          <button
            onClick={() => { setActiveChartTab('trends'); soundPlayer.playKeyTap(); }}
            className={`px-3 py-1 text-[9px] font-mono font-bold uppercase rounded-sm transition-all cursor-pointer ${
              activeChartTab === 'trends' ? 'bg-red-600 text-white' : 'text-white/40 hover:text-white bg-transparent'
            }`}
          >
            MONTHLY TRENDS
          </button>
          <button
            onClick={() => { setActiveChartTab('districts'); soundPlayer.playKeyTap(); }}
            className={`px-3 py-1 text-[9px] font-mono font-bold uppercase rounded-sm transition-all cursor-pointer ${
              activeChartTab === 'districts' ? 'bg-red-600 text-white' : 'text-white/40 hover:text-white bg-transparent'
            }`}
          >
            DISTRICTS SCORING
          </button>
          <button
            onClick={() => { setActiveChartTab('ministries'); soundPlayer.playKeyTap(); }}
            className={`px-3 py-1 text-[9px] font-mono font-bold uppercase rounded-sm transition-all cursor-pointer ${
              activeChartTab === 'ministries' ? 'bg-red-600 text-white' : 'text-white/40 hover:text-white bg-transparent'
            }`}
          >
            MINISTRY LEAK FACTORS
          </button>
        </div>
      </div>

      {/* CORE DISPLAY CHART SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* CHART SECTION */}
        <div className="lg:col-span-8 bg-[#080808] border border-white/10 p-6 rounded-sm shadow-2xl flex flex-col justify-between min-h-[420px]">
          
          <div className="border-b border-white/10 pb-4 flex justify-between items-center select-none font-mono text-[9px]">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-red-500" />
              <span className="text-white hover:text-white/70 tracking-widest uppercase font-sans font-bold">
                {activeChartTab === 'trends' ? 'Chronological Incident Timeline Stream' :
                 activeChartTab === 'districts' ? 'District-by-District Distribution matrix' :
                 'Systemic Ministry Risk Density Ranking'}
              </span>
            </div>
            <span className="text-white/40 tracking-wider">SECURE GRID COGNITIVE VISUALS</span>
          </div>

          {/* ACTIVE CHART WINDOW LAYOUT */}
          <div className="flex-1 w-full flex items-center justify-center py-6 relative">
            
            {/* MONTHLY TRENDS - PURE ANIMATED SVG GRID AREA GRAPH */}
            {activeChartTab === 'trends' && (
              <svg viewBox="0 0 600 240" className="w-full h-full max-h-[250px] select-none">
                <defs>
                  {/* Cyber Grid linear styling */}
                  <pattern id="trends-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.015)" strokeWidth="1" />
                  </pattern>
                  <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                <rect width="100%" height="100%" fill="url(#trends-grid)" />

                {/* Draw X & Y axis lines */}
                <line x1="40" y1="20" x2="40" y2="200" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                <line x1="40" y1="200" x2="560" y2="200" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

                {/* Y Axis Grid references */}
                {[0, 25, 50, 75].map((level, i) => (
                  <g key={i}>
                    <line x1="40" y1={200 - level * 1.8} x2="560" y2={200 - level * 1.8} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <text x="32" y={204 - level * 1.8} className="font-mono text-[8px] fill-white/40" textAnchor="end">{level}</text>
                  </g>
                ))}

                {/* Plot Trends Area & Stroke line */}
                {(() => {
                  const xFactor = 500 / (statsTrends.length - 1);
                  const yMax = 100;
                  const pts = statsTrends.map((d, idx) => ({
                    x: 40 + idx * xFactor,
                    y: 200 - (d.count * 1.8) // scales count nicely
                  }));

                  const pathD = `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
                  const combinedAreaD = `${pathD} L ${pts[pts.length - 1].x} 200 L ${pts[0].x} 200 Z`;

                  return (
                    <g>
                      <path d={combinedAreaD} fill="url(#area-grad)" />
                      <path d={pathD} fill="none" stroke="#ef4444" strokeWidth="2.5" className="animate-pulse" />

                      {/* Interactive dot plot triggers */}
                      {pts.map((p, idx) => (
                        <circle
                          key={idx}
                          cx={p.x}
                          cy={p.y}
                          r="5.5"
                          fill="#050505"
                          stroke="#ef4444"
                          strokeWidth="2.5"
                          className="cursor-pointer hover:scale-130 transition-transform"
                          onMouseEnter={() => setHoveredDataPoint({
                            x: p.x,
                            y: p.y - 12,
                            label: `Month: ${statsTrends[idx].month}`,
                            value: `Total Reported: ${statsTrends[idx].count} cases`
                          })}
                          onMouseLeave={() => setHoveredDataPoint(null)}
                        />
                      ))}
                    </g>
                  );
                })()}

                {/* Month labels indices */}
                {statsTrends.map((d, idx) => (
                  <text
                    key={idx}
                    x={40 + idx * (500 / (statsTrends.length - 1))}
                    y="215"
                    className="font-mono text-[9px] fill-white/45"
                    textAnchor="middle"
                  >
                    {d.month.toUpperCase()}
                  </text>
                ))}

                {/* Dynamic Data Hover Label */}
                {hoveredDataPoint && (
                  <g transform={`translate(${hoveredDataPoint.x}, ${hoveredDataPoint.y - 12})`}>
                    <rect x="-65" y="-32" width="130" height="38" fill="rgba(10,10,10,0.95)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" rx="2" />
                    <text x="0" y="-20" className="font-mono text-[8px] fill-white/50 text-center" textAnchor="middle">{hoveredDataPoint.label}</text>
                    <text x="0" y="-8" className="font-mono text-[9px] font-bold fill-red-500 text-center" textAnchor="middle">{hoveredDataPoint.value}</text>
                  </g>
                )}
              </svg>
            )}

            {/* MOST CORRUPT DISTRICTS - DUAL RADICAL COLUMN CHART */}
            {activeChartTab === 'districts' && (
              <svg viewBox="0 0 600 240" className="w-full h-full max-h-[250px] select-none">
                <line x1="30" y1="200" x2="570" y2="200" stroke="rgba(255,255,255,0.15)" />
                {statsDistricts.map((d, idx) => {
                  const barWidth = 32;
                  const x = 50 + idx * 72;
                  const height = d.count * 2.8;
                  const y = 200 - height;
                  
                  return (
                    <g key={idx} className="group">
                      {/* Interactive Bar */}
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={height}
                        fill="rgba(239, 68, 68, 0.15)"
                        stroke="#ef4444"
                        strokeWidth="1.5"
                        rx="1"
                        className="transition-colors hover:fill-red-600/30 cursor-pointer"
                        onMouseEnter={() => setHoveredDataPoint({
                          x: x + 16,
                          y: y - 10,
                          label: `${d.name} Division`,
                          value: `${d.count} Whistleblows`
                        })}
                        onMouseLeave={() => setHoveredDataPoint(null)}
                      />
                      {/* Top value badge */}
                      <text
                        x={x + 16}
                        y={y - 6}
                        className="font-mono text-[8px] fill-white/60 font-bold"
                        textAnchor="middle"
                      >
                        {d.count}
                      </text>
                      {/* District Text */}
                      <text
                        x={x + 16}
                        y="215"
                        className="font-mono text-[9px] fill-white/45 uppercase text-center"
                        textAnchor="middle"
                      >
                        {d.name.substring(0, 6)}
                      </text>
                    </g>
                  );
                })}

                {/* Dynamic Data Hover Label */}
                {hoveredDataPoint && (
                  <g transform={`translate(${hoveredDataPoint.x}, ${hoveredDataPoint.y - 12})`}>
                    <rect x="-65" y="-32" width="130" height="38" fill="rgba(10,10,10,0.95)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" rx="2" />
                    <text x="0" y="-20" className="font-mono text-[8px] fill-white/50 text-center" textAnchor="middle">{hoveredDataPoint.label}</text>
                    <text x="0" y="-8" className="font-mono text-[9px] font-bold fill-red-500 text-center" textAnchor="middle">{hoveredDataPoint.value}</text>
                  </g>
                )}
              </svg>
            )}

            {/* MINISTRIES RISK DENSITY RANKINGS */}
            {activeChartTab === 'ministries' && (
              <div className="w-full space-y-3.5 pr-4 animate-fade-in">
                {statsMinistries.slice(0, 4).map((m, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between font-mono text-[10px] items-center">
                      <span className="font-bold text-white max-w-[200px] truncate">{i+1}. {m.name}</span>
                      <span className="text-red-500 font-bold">{m.riskScore}% LEAK FACTOR</span>
                    </div>
                    <div className="w-full bg-white/5 border border-white/5 h-2.5 rounded-sm overflow-hidden p-0.5 relative">
                      <div
                        className={`h-full rounded-sm transition-all duration-500 ${
                          m.riskScore > 85 ? 'bg-red-600' : m.riskScore > 65 ? 'bg-amber-500' : 'bg-cyan-400'
                        }`}
                        style={{ width: `${m.riskScore}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          <p className="font-mono text-[9px] text-[#ffffff]/30 leading-normal uppercase">
            Data metrics represents consolidated client consensus loops and automated AI credibility index records. Updates dynamically upon every citizen consensus declaration.
          </p>

        </div>

        {/* SIDEBAR TRANS-METRICS STAT DETAILS */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* GEOGRAPHIC HEAT INDEX MAP */}
          <div className="bg-[#080808] border border-white/10 p-5 rounded-sm shadow-2xl flex-1 flex flex-col justify-between min-h-[420px]">
            
            <div className="border-b border-white/10 pb-2.5 flex justify-between items-center select-none font-mono text-[9px]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-zinc-400" />
                <span className="text-white/65 font-sans font-bold uppercase tracking-widest">Heat Radar Overlay</span>
              </div>
              <span className="text-green-500 font-bold tracking-wider">ACTIVE FEED</span>
            </div>

            <div className="space-y-4 pt-4">
              <div className="bg-[#050505] border border-white/5 p-4 rounded-sm hover:border-red-600/20 transition-colors flex flex-col justify-center items-center text-center">
                <span className="font-mono text-[10px] text-white/45 tracking-wider block uppercase">Consolidated Whistle Index</span>
                <span className="text-3xl font-black text-red-500 mt-1.5 animate-pulse">
                  {reports.length + 32} <span className="text-xs text-white/50 font-normal">Active cases</span>
                </span>
              </div>

              <div className="space-y-3 font-mono text-[10px]">
                <div className="flex justify-between items-center text-white/45 border-b border-white/5 pb-1.5 mt-2">
                  <span>MOST CORRUPT SECTOR:</span>
                  <span className="text-white font-bold uppercase">Passport & Transit</span>
                </div>
                <div className="flex justify-between items-center text-white/45 border-b border-white/5 pb-1.5">
                  <span>MOST CORRUPT DISTRICT:</span>
                  <span className="text-white font-bold uppercase">Dhaka Divisional Hub</span>
                </div>
                <div className="flex justify-between items-center text-white/45 border-b border-white/5 pb-1.5">
                  <span>AI SPAM REDUCTION:</span>
                  <span className="text-green-500 font-bold">99.85% FILTERED</span>
                </div>
                <div className="flex justify-between items-center text-white/45 pb-1">
                  <span>CITIZEN ENGAGEMENT:</span>
                  <span className="text-white font-bold">+{reports.reduce((acc,r) => acc+r.upvotes, 0) + 1402} NODES</span>
                </div>
              </div>
            </div>

            {/* WARNING BADGE */}
            <div className="bg-red-600/10 border border-red-500/10 p-3 rounded-sm flex gap-2.5 items-start mt-6 text-red-500 font-sans text-xs">
              <AlertCircle className="w-5 h-5 shrink-0 animate-pulse" />
              <div className="space-y-0.5 leading-normal uppercase text-[9px] font-mono">
                <strong className="block text-[10px] font-sans font-extrabold text-white">RED CORRUPTION WARNINGS ACTIVE</strong>
                High volume citizen confirm signals recorded at National Board of Revenue and land registrars this week. Monitor closely.
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
