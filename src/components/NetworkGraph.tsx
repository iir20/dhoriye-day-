import React, { useState, useMemo } from 'react';
import { CorruptionReport } from '../types';
import { soundPlayer } from './AudioAlerts';
import { ShieldAlert, Users, Network, Link, Sparkles, Target, Zap, AlertTriangle, HelpCircle } from 'lucide-react';

interface NetworkGraphProps {
  reports: CorruptionReport[];
  onSelectReport: (report: CorruptionReport) => void;
}

interface Node {
  id: string;
  label: string;
  type: 'ministry' | 'person' | 'report';
  x: number;
  y: number;
  size: number;
  riskScore: number;
  reportRef?: CorruptionReport;
}

interface Edge {
  sourceId: string;
  targetId: string;
  type: 'accused-by' | 'belongs-to' | 'involved-in';
  active: boolean;
}

export default function NetworkGraph({ reports, onSelectReport }: NetworkGraphProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [activeFilterType, setActiveFilterType] = useState<'all' | 'ministry' | 'person' | 'report'>('all');

  // Dynamically build nodes and connections from live cases
  const graphContent = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const nodeMap = new Map<string, Node>();

    // 1. Establish central center of gravity
    const width = 800;
    const height = 480;
    const cx = width / 2;
    const cy = height / 2;

    // Build lists of unique ministries and accused entities from reports
    const uniqueMinistries = Array.from(new Set(reports.map(r => r.ministry || "General Public Services")));
    
    // Seed ministries around an inner circle
    uniqueMinistries.forEach((min, idx) => {
      const angle = (idx / uniqueMinistries.length) * 2 * Math.PI;
      const radius = 130 + Math.sin(idx) * 25; // ring radius
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      
      // Calculate high-risk factors
      const associatedReports = reports.filter(r => r.ministry === min);
      const avgCredibility = associatedReports.length > 0
        ? Math.round(associatedReports.reduce((sum, r) => sum + (r.aiAnalysis?.credibilityScore || 60), 0) / associatedReports.length)
        : 70;
      
      const riskScore = Math.min(100, Math.round(associatedReports.length * 20 + avgCredibility * 0.4));

      const minNode: Node = {
        id: `min-${idx}`,
        label: min,
        type: 'ministry',
        x,
        y,
        size: Math.max(16, 12 + associatedReports.length * 2.5),
        riskScore
      };
      nodes.push(minNode);
      nodeMap.set(min, minNode);
    });

    // Seed report and accused person nodes around an outer circle
    reports.forEach((report, idx) => {
      const angle = ((idx + 0.5) / reports.length) * 2 * Math.PI;
      const radius = 220 + (idx % 2 === 0 ? 30 : -35); // concentric layout
      const rx = cx + radius * Math.cos(angle);
      const ry = cy + radius * Math.sin(angle);

      const repNodeId = `rep-${report.id}`;
      const repNode: Node = {
        id: repNodeId,
        label: report.title,
        type: 'report',
        x: rx,
        y: ry,
        size: 11,
        riskScore: report.aiAnalysis?.credibilityScore || 75,
        reportRef: report
      };
      nodes.push(repNode);

      // Connect Report to its Ministry
      const parentMin = report.ministry || "General Public Services";
      const minNode = nodeMap.get(parentMin);
      if (minNode) {
        edges.push({
          sourceId: minNode.id,
          targetId: repNodeId,
          type: 'belongs-to',
          active: false
        });
      }

      // Generate nodes for accused persons listed
      if (report.involvedPeople && report.involvedPeople !== "Not disclosed") {
        // split names briefly
        const names = report.involvedPeople.split(/[,&;•]+/).map(n => n.trim()).filter(Boolean);
        names.slice(0, 2).forEach((name, nameIdx) => {
          const personId = `person-${name.toLowerCase().replace(/\s+/g, '-')}`;
          let pNode = nodes.find(n => n.id === personId);
          
          if (!pNode) {
            // position close to report node
            const px = rx + Math.cos(angle + 0.5 + nameIdx * 0.4) * 55;
            const py = ry + Math.sin(angle + 0.5 + nameIdx * 0.4) * 55;
            pNode = {
              id: personId,
              label: name,
              type: 'person',
              x: px,
              y: py,
              size: 10,
              riskScore: Math.round(55 + Math.random() * 40)
            };
            nodes.push(pNode);
          }

          // Link Person to Report
          edges.push({
            sourceId: repNodeId,
            targetId: pNode.id,
            type: 'accused-by',
            active: false
          });
        });
      }
    });

    return { nodes, edges };
  }, [reports]);

  // Handle click on node elements
  const handleNodeClick = (node: Node) => {
    soundPlayer.playSonar();
    setSelectedNodeId(node.id === selectedNodeId ? null : node.id);
    if (node.type === 'report' && node.reportRef) {
      onSelectReport(node.reportRef);
    }
  };

  const handleNodeHover = (node: Node | null) => {
    setHoveredNodeId(node ? node.id : null);
  };

  // Find linked edges and nodes for highlighting
  const highlightedData = useMemo(() => {
    if (!selectedNodeId && !hoveredNodeId) return { nodeIds: new Set<string>(), edgeIds: new Set<number>() };
    
    const targetId = hoveredNodeId || selectedNodeId || '';
    const connectedNodeIds = new Set<string>([targetId]);
    const connectedEdgeIds = new Set<number>();

    graphContent.edges.forEach((edge, idx) => {
      if (edge.sourceId === targetId) {
        connectedNodeIds.add(edge.targetId);
        connectedEdgeIds.add(idx);
      } else if (edge.targetId === targetId) {
        connectedNodeIds.add(edge.sourceId);
        connectedEdgeIds.add(idx);
      }
    });

    return { nodeIds: connectedNodeIds, edgeIds: connectedEdgeIds };
  }, [selectedNodeId, hoveredNodeId, graphContent]);

  // Selected report ref if active
  const selectedReportRef = useMemo(() => {
    if (!selectedNodeId) return null;
    const node = graphContent.nodes.find(n => n.id === selectedNodeId);
    return node && node.type === 'report' ? node.reportRef || null : null;
  }, [selectedNodeId, graphContent]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[calc(100vh-140px)] animate-fade-in text-white">
      
      {/* GRAPH CONTROL PANEL COLUMN */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        
        {/* GRAPH INTRO */}
        <div className="bg-[#080808] border border-white/10 p-5 rounded-sm shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600"></div>
          
          <div className="flex items-center gap-2 mb-3">
            <Network className="w-4 h-4 text-red-500" />
            <span className="font-sans text-[10px] font-bold tracking-widest text-white uppercase">OSINT RELATIONSHIPS</span>
          </div>
          
          <p className="text-[10px] text-white/40 leading-relaxed uppercase font-mono">
            CRIMINAL SECTOR RELATIONSHIPS. THE SYSTEM INTELLIGENTLY CORRELATES TRANSGRESSIONS, ACCUSED PUBLIC SERVANTS, AND ASSOCIATED MINISTRIES INTO INTERLINKED HEURISTIC FLOWS.
          </p>

          <div className="mt-5 pt-4 border-t border-white/10 space-y-3">
            <div className="text-[9px] text-white/50 tracking-wider font-bold font-mono uppercase">Filter Segment Nodes:</div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setActiveFilterType('all'); soundPlayer.playKeyTap(); }}
                className={`py-1 px-2 text-[9px] font-mono border rounded-sm tracking-wider uppercase transition-all ${
                  activeFilterType === 'all' ? 'bg-red-600 text-white border-red-500 font-bold' : 'bg-[#050505] border-white/10 text-white/40 hover:text-white'
                }`}
              >
                ALL NODES
              </button>
              <button
                onClick={() => { setActiveFilterType('ministry'); soundPlayer.playKeyTap(); }}
                className={`py-1 px-2 text-[10px] font-sans border rounded-sm uppercase tracking-wider transition-all ${
                  activeFilterType === 'ministry' ? 'bg-red-600 text-white border-red-500 font-bold' : 'bg-[#050505] border-white/10 text-white/40 hover:text-white'
                }`}
              >
                OFFICES
              </button>
              <button
                onClick={() => { setActiveFilterType('person'); soundPlayer.playKeyTap(); }}
                className={`py-1 px-2 text-[10px] font-sans border rounded-sm uppercase tracking-wider transition-all ${
                  activeFilterType === 'person' ? 'bg-red-600 text-white border-red-500 font-bold' : 'bg-[#050505] border-white/10 text-white/40 hover:text-white'
                }`}
              >
                ACCUSED
              </button>
              <button
                onClick={() => { setActiveFilterType('report'); soundPlayer.playKeyTap(); }}
                className={`py-1 px-2 text-[10px] font-sans border rounded-sm uppercase tracking-wider transition-all ${
                  activeFilterType === 'report' ? 'bg-red-600 text-white border-red-500 font-bold' : 'bg-[#050505] border-white/10 text-white/40 hover:text-white'
                }`}
              >
                REPORTS
              </button>
            </div>
          </div>
        </div>

        {/* METRIC CARD */}
        <div className="bg-[#080808] border border-white/10 p-5 rounded-sm shadow-2xl space-y-4">
          <div className="border-b border-white/10 pb-2 flex items-center justify-between">
            <span className="font-sans text-[10px] font-bold text-white/60 uppercase tracking-widest">Network Scoreboard</span>
            <span className="text-[10px] bg-red-600 px-1.5 py-0.5 rounded-sm animate-pulse tracking-wide font-bold font-mono">DANGER INDEX</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-[#050505] border border-white/5 p-3 rounded-sm">
              <span className="text-[8px] text-white/40 block uppercase">Cluster Load</span>
              <span className="text-sm font-black text-white">{graphContent.nodes.length} Items</span>
            </div>
            <div className="bg-[#050505] border border-white/5 p-3 rounded-sm">
              <span className="text-[8px] text-white/40 block uppercase">Aggregated Density</span>
              <span className="text-sm font-black text-red-500">{Math.round(graphContent.edges.length * 1.8)} Links</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-sm p-3 font-mono text-[9px] leading-relaxed uppercase text-white/50 space-y-1">
            <div className="flex justify-between"><span>⬤ CENTRAL AGENT BUBBLES:</span> <span className="text-white font-bold">OFFICE SEGMENTS</span></div>
            <div className="flex justify-between"><span>⬤ CONCENTRIC NODES:</span> <span className="text-red-500 font-bold">ACCUSED INDIVIDUALS</span></div>
            <div className="flex justify-between"><span>⬤ CORE GLOW CONNECTOR:</span> <span className="text-green-400 font-bold">ACTIVE ALLEGATIONS</span></div>
          </div>
        </div>

      </div>

      {/* CENTER GRID STAGE WINDOW & SCENE CANVAS */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        
        <div className="bg-[#080808] border border-white/10 rounded-sm p-2 shadow-2xl relative flex-1 min-h-[480px] flex flex-col justify-between overflow-hidden">
          
          {/* SATELLITE HUD OVERLAY */}
          <div className="absolute top-4 left-4 font-mono pointer-events-none select-none z-10 opacity-30">
            <div className="text-[10px] font-black tracking-widest text-white uppercase flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
              BANGLADESH OSINT CORRELATION CANVAS
            </div>
            <div className="text-[8px] text-zinc-500 font-mono mt-0.5">SCALE: GEOMETRIC CLUSTER VECTOR // AUTOPAGE</div>
          </div>

          {/* ACTIVE FILTER / HOVER STATUS BAR */}
          {hoveredNodeId && (
            <div className="absolute top-4 right-4 bg-[#0a0a0a]/95 border border-white/15 px-3 py-1.5 rounded-sm text-left font-mono z-20 pointer-events-none transition-all duration-300">
              <div className="text-[8px] text-white/45 uppercase tracking-wider">TARGET HIGHLIGHT NODE</div>
              <div className="text-[11px] font-bold text-red-500 uppercase truncate max-w-[180px]">
                {graphContent.nodes.find(n => n.id === hoveredNodeId)?.label}
              </div>
            </div>
          )}

          {/* INTERACTIVE VECTOR CANVAS (SVG) */}
          <div className="flex-1 w-full flex items-center justify-center">
            <svg
              viewBox="0 0 800 480"
              className="w-full h-full min-h-[440px] select-none"
            >
              {/* Patterns & Defs */}
              <defs>
                <pattern id="network-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.015)" strokeWidth="1"/>
                </pattern>
                
                {/* Cyber Glow Target Filter */}
                <filter id="cyber-glow-node" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                
                <filter id="intense-neon-sweep" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Infinite Matrix grid layer */}
              <rect width="100%" height="100%" fill="url(#network-grid)" />

              {/* Edge Connection Lines */}
              <g id="edges-layer">
                {graphContent.edges.map((edge, i) => {
                  const source = graphContent.nodes.find(n => n.id === edge.sourceId);
                  const target = graphContent.nodes.find(n => n.id === edge.targetId);
                  
                  if (!source || !target) return null;

                  // Highlighting criteria
                  const hasSelection = !!selectedNodeId || !!hoveredNodeId;
                  const isHighlighted = highlightedData.edgeIds.has(i);

                  // apply filters
                  if (activeFilterType !== 'all') {
                    if (source.type !== activeFilterType && target.type !== activeFilterType) {
                      return null; // hide irrelevant
                    }
                  }

                  return (
                    <line
                      key={`edge-${i}`}
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={isHighlighted ? '#ef4444' : hasSelection ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.1)'}
                      strokeWidth={isHighlighted ? 2.2 : 1}
                      strokeDasharray={edge.type === 'accused-by' ? '2,3' : undefined}
                      className="transition-all duration-300"
                    />
                  );
                })}
              </g>

              {/* Interactive Node Bubbles */}
              <g id="nodes-layer">
                {graphContent.nodes.map((node) => {
                  // apply filters
                  if (activeFilterType !== 'all' && node.type !== activeFilterType) return null;

                  const isSelected = selectedNodeId === node.id;
                  const isHovered = hoveredNodeId === node.id;
                  const hasSelection = !!selectedNodeId || !!hoveredNodeId;
                  const inNetwork = highlightedData.nodeIds.has(node.id);

                  // Determine colors based on types and states
                  let fill = '#0a0a0a';
                  let stroke = 'rgba(255,255,255,0.3)';
                  
                  if (node.type === 'ministry') {
                    stroke = node.riskScore > 65 ? '#ef4444' : '#eab308';
                    fill = isSelected || isHovered ? stroke : 'rgba(20,20,20,0.95)';
                  } else if (node.type === 'person') {
                    stroke = '#a855f7';
                    fill = isSelected || isHovered ? stroke : 'rgba(20,20,20,0.95)';
                  } else {
                    stroke = '#10b981';
                    fill = isSelected || isHovered ? stroke : 'rgba(10,10,10,0.95)';
                  }

                  // Fade out unselected if filter highlighted active
                  const opacity = hasSelection ? (inNetwork ? 1.0 : 0.15) : 0.95;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      className="cursor-pointer transition-all duration-300 select-none group"
                      onClick={() => handleNodeClick(node)}
                      onMouseEnter={() => handleNodeHover(node)}
                      onMouseLeave={() => handleNodeHover(null)}
                      style={{ opacity }}
                    >
                      {/* Interactive Radar Ring Glow when hovered/selected */}
                      {(isSelected || isHovered) && (
                        <circle
                          r={node.size + 10}
                          fill="none"
                          stroke={stroke}
                          strokeWidth="1"
                          strokeDasharray="4,4"
                          className="animate-spin"
                          style={{ transformOrigin: 'center', filter: 'blur(1px)' }}
                        />
                      )}

                      {/* Actual Node Sphere */}
                      <circle
                        r={node.size}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={isSelected ? 2.5 : isHovered ? 1.8 : 1.2}
                        filter={isHovered ? 'url(#cyber-glow-node)' : undefined}
                        className="transition-all duration-300"
                      />

                      {/* Core target red dot for extreme risk score ministries */}
                      {node.type === 'ministry' && node.riskScore > 65 && !isSelected && !isHovered && (
                        <circle
                          r="3.5"
                          fill="#ef4444"
                          className="animate-ping"
                        />
                      )}

                      {/* Text Tags below node hubs */}
                      <text
                        y={node.size + 13}
                        className="font-mono text-[8px] font-bold text-center pointer-events-none fill-white/80 select-none text-shadow-md"
                        textAnchor="middle"
                        style={{ textShadow: '0px 1px 2px rgba(0,0,0,1)' }}
                      >
                        {node.label.length > 18 ? `${node.label.substring(0, 16)}..` : node.label}
                      </text>

                      {/* Status badge tags above */}
                      {(node.type === 'ministry' && node.riskScore > 75) && (
                        <text
                          y={-node.size - 5}
                          className="font-mono text-[7px] font-black fill-red-500 uppercase tracking-widest text-center pointer-events-none"
                          textAnchor="middle"
                        >
                          HIGH RISK
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>

          {/* SATELLITE USER TOOLTIPS */}
          <div className="bg-[#050505] border-t border-white/5 py-2 px-3 text-[9px] font-sans uppercase tracking-[0.12em] text-white/50 text-center select-none leading-none">
            📍 <span className="text-white">COGNITIVE COMPULSION:</span> Click any node network bubble to trace its complete judicial relationship, evidence links, and crime risk factors.
          </div>

        </div>

      </div>

      {/* DETAIL SIDEBAR PREVIEW CASE BLOCK */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        
        <div className="bg-[#080808] border border-white/10 p-5 rounded-sm shadow-2xl flex-1 flex flex-col justify-between min-h-[480px]">
          
          {selectedReportRef ? (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="font-mono text-[8px] bg-red-600 px-2 py-0.5 rounded-sm uppercase font-bold text-white shadow-sm">
                    {selectedReportRef.id}
                  </span>
                  <span className="text-[10px] text-white/40 uppercase tracking-wider font-mono">
                    {selectedReportRef.date}
                  </span>
                </div>

                <h4 className="text-sm font-black font-sans uppercase tracking-wide leading-snug text-white">
                  {selectedReportRef.title}
                </h4>

                <div className="space-y-1.5 p-3 bg-[#050505] border border-white/5 rounded-sm font-mono text-[10px]">
                  <div className="flex justify-between text-white/40 border-b border-white/5 pb-1">
                    <span>MINISTRY:</span>
                    <span className="text-white font-bold max-w-[120px] truncate">{selectedReportRef.ministry}</span>
                  </div>
                  <div className="flex justify-between text-white/40 border-b border-white/5 pb-1">
                    <span>SITE TARGET:</span>
                    <span className="text-white font-bold">{selectedReportRef.district}, BD</span>
                  </div>
                  <div className="flex justify-between text-white/40 pb-0.5">
                    <span>ACCUSED:</span>
                    <span className="text-red-500 font-bold max-w-[120px] truncate">{selectedReportRef.involvedPeople}</span>
                  </div>
                </div>

                <div className="text-[11px] leading-relaxed text-white/60 p-3 bg-[#050505]/40 border border-white/5 rounded-sm max-h-[140px] overflow-y-auto">
                  {selectedReportRef.description}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-white/40 uppercase">AI AUDITING SCORE</span>
                  <span className="text-green-500 font-bold">{selectedReportRef.aiAnalysis?.credibilityScore || 65}% TRUST</span>
                </div>
                
                <div className="w-full bg-white/5 h-1.5 rounded-sm overflow-hidden">
                  <div 
                    className="h-full bg-red-600 transition-all duration-500" 
                    style={{ width: `${selectedReportRef.aiAnalysis?.credibilityScore || 65}%` }}
                  />
                </div>

                <p className="text-[9px] text-white/40 italic leading-relaxed">
                  "{selectedReportRef.aiAnalysis?.analysisSummary || "Awaiting secondary citizen testimony review vectors."}"
                </p>
              </div>

            </div>
          ) : (
            // Default placeholder if nothing highlighted
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <Target className="w-10 h-10 text-white/10 animate-pulse mb-3" />
              <div className="text-white/70 font-sans text-xs font-bold tracking-widest uppercase mb-1">INTERCEPT VACANT</div>
              <p className="text-[10px] font-sans text-white/40 uppercase leading-relaxed">
                Click any glowing neural connection on the central tactical node board to declassify the whistleblower incident records instantly.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
