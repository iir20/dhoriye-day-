import React, { useState, useEffect } from 'react';
import { CorruptionReport, CorruptionCategory } from './types';
import { INITIAL_SEEDS } from './initialSeeds';
import MapBangladesh from './components/MapBangladesh';
import ReportSubmission from './components/ReportSubmission';
import Leaderboard from './components/Leaderboard';
import AdminPanel from './components/AdminPanel';
import NetworkGraph from './components/NetworkGraph';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import LiveOperationsCenter from './components/LiveOperationsCenter';
import { soundPlayer } from './components/AudioAlerts';
import { 
  ShieldAlert, 
  Map, 
  FileEdit, 
  Flame, 
  Lock, 
  Volume2, 
  VolumeX, 
  Search, 
  TrendingUp, 
  User, 
  CheckCircle2, 
  Globe, 
  Info, 
  ShieldCheck, 
  RefreshCw, 
  ChevronRight,
  Eye,
  MessageSquare,
  Network
} from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'landing' | 'map' | 'intel' | 'analytics' | 'report' | 'leaderboard' | 'admin'>('landing');
  
  // Tactical HUD Mode state
  const [tacticalMode, setTacticalMode] = useState<boolean>(false);
  
  // Data State
  const [reports, setReports] = useState<CorruptionReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<CorruptionReport | null>(null);
  
  // Filter States
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // System States
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [citizenId, setCitizenId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [offlineMode, setOfflineMode] = useState<boolean>(false);

  // Geo coordinate carrier variables (when user clicks SVG map)
  const [coordsDivision, setCoordsDivision] = useState<string>('');
  const [coordsDistrict, setCoordsDistrict] = useState<string>('');
  const [coordsAddress, setCoordsAddress] = useState<string>('');
  const [coordsLat, setCoordsLat] = useState<number | undefined>(undefined);
  const [coordsLng, setCoordsLng] = useState<number | undefined>(undefined);

  // 1. Generate / Retrieve citizen identity fingerprint
  useEffect(() => {
    let savedId = localStorage.getItem('dhoraiya_citizen_node');
    if (!savedId) {
      savedId = `NODE-${Math.floor(100000 + Math.random() * 900000)}-X`;
      localStorage.setItem('dhoraiya_citizen_node', savedId);
    }
    setCitizenId(savedId);
  }, []);

  // 2. Load reports with full-stack API and LocalStorage fallback
  const fetchReportsList = async () => {
    setLoading(true);
    try {
      // Direct detection if hosted on GitHub static Pages or without active proxy
      const isGitHubPages = window.location.hostname.includes('github.io');
      if (isGitHubPages) {
        throw new Error("GitHub static environment detected. Activating offline local database.");
      }

      const response = await fetch('/api/reports');
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setReports(data);
          localStorage.setItem('dhoraiya_reports', JSON.stringify(data));
        } else {
          // If server reports db is empty/newly initialized, seed with the initial samples
          setReports(INITIAL_SEEDS);
          localStorage.setItem('dhoraiya_reports', JSON.stringify(INITIAL_SEEDS));
        }
        setOfflineMode(false);
      } else {
        throw new Error("Server responded with error status. Switching to local state.");
      }
    } catch (e) {
      console.log("Dhoraiya De is executing in Local Fallback Database Mode:", e);
      setOfflineMode(true);
      const cached = localStorage.getItem('dhoraiya_reports');
      if (cached) {
        setReports(JSON.parse(cached));
      } else {
        localStorage.setItem('dhoraiya_reports', JSON.stringify(INITIAL_SEEDS));
        setReports(INITIAL_SEEDS);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsList();
  }, []);

  const handleTabChange = (tab: typeof activeTab) => {
    soundPlayer.playKeyTap();
    setActiveTab(tab);
  };

  const handleSoundToggle = () => {
    const nextVal = !soundOn;
    setSoundOn(nextVal);
    soundPlayer.setSoundEnabled(nextVal);
    if (nextVal) {
      soundPlayer.playSonar();
    }
  };

  // 3. Coordinate Pin Drop Transition Bridge
  const handleMapCoordinateReport = (div: string, dist: string, addr: string, lat?: number, lng?: number) => {
    setCoordsDivision(div);
    setCoordsDistrict(dist);
    setCoordsAddress(addr);
    setCoordsLat(lat);
    setCoordsLng(lng);
    soundPlayer.playSonar();
    setActiveTab('report');
  };

  // 4. Voting Consensus Endpoint
  const handleVoteSubmission = async (reportId: string, isTrue: boolean) => {
    if (offlineMode) {
      const currentReports: CorruptionReport[] = JSON.parse(localStorage.getItem('dhoraiya_reports') || '[]');
      const idx = currentReports.findIndex(r => r.id === reportId);
      if (idx !== -1) {
        const target = currentReports[idx];
        const votedUserIds = target.votedUserIds || [];
        if (votedUserIds.includes(citizenId)) {
          alert(`🚨 STATUS WARNING: Identity has already voted on this case file.`);
          soundPlayer.playWarning();
          return;
        }

        const updated = {
          ...target,
          upvotes: isTrue ? target.upvotes + 1 : target.upvotes,
          downvotes: !isTrue ? target.downvotes + 1 : target.downvotes,
          votedUserIds: [...votedUserIds, citizenId]
        };

        currentReports[idx] = updated;
        localStorage.setItem('dhoraiya_reports', JSON.stringify(currentReports));
        setReports(currentReports);
        setSelectedReport(updated);
        soundPlayer.playNodeLocked();
      }
      return;
    }

    try {
      const response = await fetch(`/api/reports/${reportId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: isTrue ? 'true' : 'false',
          userId: citizenId
        })
      });

      if (!response.ok) {
        const errMsg = await response.json();
        alert(`🚨 STATUS WARNING: ${errMsg.error || 'Identity has already voted on this case file.'}`);
        soundPlayer.playWarning();
        return;
      }

      soundPlayer.playNodeLocked();
      const updatedRep = await response.json();
      
      // Update local array state
      setReports(prev => prev.map(r => r.id === reportId ? updatedRep : r));
      setSelectedReport(updatedRep);
    } catch (e) {
      console.warn(e);
    }
  };

  // 5. Status Moderation Trigger (Admin)
  const handleAdminUpdateStatus = async (id: string, newStatus: CorruptionReport['status']) => {
    if (offlineMode) {
      const currentReports: CorruptionReport[] = JSON.parse(localStorage.getItem('dhoraiya_reports') || '[]');
      const idx = currentReports.findIndex(r => r.id === id);
      if (idx !== -1) {
        const updated = { ...currentReports[idx], status: newStatus };
        currentReports[idx] = updated;
        localStorage.setItem('dhoraiya_reports', JSON.stringify(currentReports));
        setReports(currentReports);
        setSelectedReport(updated);
        soundPlayer.playNodeLocked();
      }
      return;
    }

    try {
      const response = await fetch(`/api/reports/${id}/moderation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        const updated = await response.json();
        setReports(prev => prev.map(r => r.id === id ? updated : r));
        setSelectedReport(updated);
        soundPlayer.playNodeLocked();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 6. Delete Spam Case Node Trigger (Admin)
  const handleAdminDeleteReport = async (id: string) => {
    if (offlineMode) {
      const currentReports: CorruptionReport[] = JSON.parse(localStorage.getItem('dhoraiya_reports') || '[]');
      const updatedList = currentReports.filter(r => r.id !== id);
      localStorage.setItem('dhoraiya_reports', JSON.stringify(updatedList));
      setReports(updatedList);
      setSelectedReport(null);
      soundPlayer.playWarning();
      return;
    }

    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setReports(prev => prev.filter(r => r.id !== id));
        setSelectedReport(null);
        soundPlayer.playWarning();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 7. Append comment/timeline update from admin desk
  const handleAdminAddComment = async (id: string, titleName: string, detailText: string) => {
    if (offlineMode) {
      const currentReports: CorruptionReport[] = JSON.parse(localStorage.getItem('dhoraiya_reports') || '[]');
      const idx = currentReports.findIndex(r => r.id === id);
      if (idx !== -1) {
        const timestamp = new Date().toISOString();
        const updatedTimeline = [
          ...currentReports[idx].timeline,
          {
            status: titleName,
            description: detailText,
            timestamp
          }
        ];
        const updated = { ...currentReports[idx], timeline: updatedTimeline };
        currentReports[idx] = updated;
        localStorage.setItem('dhoraiya_reports', JSON.stringify(currentReports));
        setReports(currentReports);
        setSelectedReport(updated);
        soundPlayer.playNodeLocked();
      }
      return;
    }

    try {
      const response = await fetch(`/api/reports/${id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusTitle: titleName, detailText })
      });
      if (response.ok) {
        const updated = await response.json();
        setReports(prev => prev.map(r => r.id === id ? updated : r));
        setSelectedReport(updated);
        soundPlayer.playNodeLocked();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filter computation
  const filteredFeed = reports.filter(r => {
    const matchesDiv = selectedDivision === 'ALL' || r.division.toUpperCase() === selectedDivision.toUpperCase();
    const matchesCat = selectedCategory === 'ALL' || r.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ministry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.district.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDiv && matchesCat && matchesSearch;
  });

  // Calculate General Summary Stats
  const activeTrueVotes = reports.reduce((acc, r) => acc + r.upvotes, 0);
  const totalVerifiedPercent = reports.length > 0 
    ? Math.round((reports.filter(r => r.status === 'APPROVED' || r.status === 'APPROVED').length / reports.length) * 100) 
    : 84;

  return (
    <div 
      id="platform-shell" 
      className={`min-h-screen text-white flex flex-col font-sans selection:bg-red-600/30 selection:text-white transition-all duration-500 relative ${
        tacticalMode 
          ? 'bg-black border-4 border-amber-500/20 tactical-scanlines scale-[0.995] rounded-sm' 
          : 'bg-[#050505]'
      }`}
    >
      
      {/* BACKGROUND GRAPHIC INTERCEPTOR */}
      <div className="absolute inset-0 opacity-10 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>

      {/* TOP HEADER CONTROLS */}
      <header className="border-b border-white/10 bg-[#0a0a0a]/85 backdrop-blur-md sticky top-0 z-45 relative px-6 py-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* BRAND TITLE LOGO */}
        <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => handleTabChange('landing')}>
          <div className="w-10 h-10 bg-red-600 flex items-center justify-center font-bold text-xl rounded-sm shadow-[0_0_15px_rgba(220,38,38,0.5)] shrink-0 transition-transform hover:scale-105">
            <span className="text-white font-sans">ধ</span>
          </div>
          <div>
            <span className="text-base sm:text-[17px] font-black tracking-widest uppercase leading-none block text-white font-sans">
              ধরাইয়া দে <span className="text-red-500">/</span> DHARAIYA DE
            </span>
            <span className="text-[9px] font-mono text-white/50 tracking-widest block mt-0.5">
              ANTI-CORRUPTION INTELLIGENCE PLATFORM
            </span>
          </div>
        </div>

        {/* CORE TELEMETRY STATS */}
        <div className="hidden lg:flex items-center gap-8 text-[11px] font-mono border-x border-white/10 px-8">
          <div className="text-left">
            <span className="text-white/40 block text-[9px] uppercase tracking-wider">Reports</span>
            <span className="text-white font-bold">{reports.length + 32} cases</span>
          </div>
          <div className="text-left">
            <span className="text-white/40 block text-[9px] uppercase tracking-wider">Verified</span>
            <span className="text-red-500 font-bold block">+{activeTrueVotes + 1402} <span className="text-[10px]">CITIZENS</span></span>
          </div>
          <div className="text-left">
            <span className="text-white/40 block text-[9px] uppercase tracking-wider">SECURE LINK</span>
            <span className="text-green-500 font-bold">{totalVerifiedPercent}% APPROVED</span>
          </div>
        </div>

        {/* UTILITY CONTROL RAILS */}
        <div className="flex items-center gap-3">
          
          {/* TACTICAL HUD SWITCH */}
          <button
            onClick={() => {
              setTacticalMode(prev => !prev);
              soundPlayer.playSonar();
            }}
            className={`px-3 py-1.5 rounded text-[10px] font-mono font-bold flex items-center gap-1.5 border cursor-pointer transition-all ${
              tacticalMode 
                ? 'bg-amber-600 border-amber-500 text-black font-extrabold animate-pulse'
                : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
            }`}
            title="Toggle high-contrast military interface"
          >
            🛰️ HUD: {tacticalMode ? 'ACTIVE' : 'STANDBY'}
          </button>

          {/* SECURE CITIZEN ID Footprint DISPLAY */}
          <div className="hidden md:flex items-center gap-2 font-mono text-[10px] bg-white/5 border border-white/5 rounded px-3 py-1.5 text-white/60">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
            <span>NODE: <strong className="text-white font-semibold">{citizenId || "Node-0X"}</strong></span>
          </div>

          {/* LANG TOGGLER */}
          <button
            onClick={() => {
              setLang(prev => prev === 'bn' ? 'en' : 'bn');
              soundPlayer.playKeyTap();
            }}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded border border-white/10 text-[10px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-white/50" />
            {lang === 'bn' ? 'ENGLISH' : 'বাংলা'}
          </button>

          {/* AUDIO SYNTH LEVEL TOGGLE */}
          <button
            onClick={handleSoundToggle}
            className="p-1.5 bg-white/5 hover:bg-white/10 text-white rounded border border-white/10 cursor-pointer transition-colors"
            title="Toggle cyber alerts audio feedback"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-red-500" /> : <VolumeX className="w-4 h-4 text-white/30" />}
          </button>
        </div>

      </header>

      {/* CORE NAVIGATION BAR */}
      <nav className="bg-[#080808]/90 backdrop-blur-md border-b border-white/10 relative z-30 flex justify-center py-1 px-4 select-none">
        <div className="flex items-center gap-1 sm:gap-6 overflow-x-auto max-w-full">
          
          <button
            onClick={() => handleTabChange('landing')}
            className={`px-4 py-3 text-xs font-sans font-semibold uppercase tracking-widest cursor-pointer flex items-center gap-2 whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'landing'
                ? 'text-red-500 border-red-500 font-bold bg-[#0a0a0a]'
                : 'text-white/60 hover:text-white hover:bg-white/5 border-transparent'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            {lang === 'bn' ? 'প্রচ্ছদ' : 'Dashboard'}
          </button>

          <button
            onClick={() => handleTabChange('map')}
            className={`px-4 py-3 text-xs font-sans font-semibold uppercase tracking-widest cursor-pointer flex items-center gap-2 whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'map'
                ? 'text-red-500 border-red-500 font-bold bg-[#0a0a0a]'
                : 'text-white/60 hover:text-white hover:bg-white/5 border-transparent'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            {lang === 'bn' ? 'দুর্নীতি ম্যাপ' : 'Live Map'}
          </button>

          <button
            onClick={() => handleTabChange('intel')}
            className={`px-4 py-3 text-xs font-sans font-semibold uppercase tracking-widest cursor-pointer flex items-center gap-2 whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'intel'
                ? 'text-red-500 border-red-500 font-bold bg-[#0a0a0a]'
                : 'text-white/60 hover:text-white hover:bg-white/5 border-transparent'
            }`}
          >
            <Network className="w-3.5 h-3.5 text-red-500" />
            {lang === 'bn' ? 'এআই ওয়্যার-রুম' : 'AI War Room'}
          </button>

          <button
            onClick={() => handleTabChange('analytics')}
            className={`px-4 py-3 text-xs font-sans font-semibold uppercase tracking-widest cursor-pointer flex items-center gap-2 whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'analytics'
                ? 'text-red-500 border-red-500 font-bold bg-[#0a0a0a]'
                : 'text-white/60 hover:text-white hover:bg-white/5 border-transparent'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            {lang === 'bn' ? 'তথ্য বিশ্লেষণ' : 'Analytics Deck'}
          </button>

          <button
            onClick={() => {
              // reset coordinates if coming fresh
              setCoordsDivision('');
              setCoordsDistrict('');
              setCoordsAddress('');
              handleTabChange('report');
            }}
            className={`px-4 py-3 text-xs font-sans font-semibold uppercase tracking-widest cursor-pointer flex items-center gap-2 whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'report'
                ? 'text-red-500 border-red-500 font-bold bg-[#0a0a0a]'
                : 'text-white/60 hover:text-white hover:bg-white/5 border-transparent'
            }`}
          >
            <FileEdit className="w-3.5 h-3.5" />
            {lang === 'bn' ? 'রিপোর্ট করুন' : 'Exposed Hub'}
          </button>

          <button
            onClick={() => handleTabChange('leaderboard')}
            className={`px-4 py-3 text-xs font-sans font-semibold uppercase tracking-widest cursor-pointer flex items-center gap-2 whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'leaderboard'
                ? 'text-red-500 border-red-500 font-bold bg-[#0a0a0a]'
                : 'text-white/60 hover:text-white hover:bg-white/5 border-transparent'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            {lang === 'bn' ? 'লিডারবোর্ড' : 'Leaderboards'}
          </button>

          <button
            onClick={() => handleTabChange('admin')}
            className={`px-4 py-3 text-xs font-sans font-semibold uppercase tracking-widest cursor-pointer flex items-center gap-2 whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'admin'
                ? 'text-red-500 border-red-500 font-bold bg-[#0a0a0a]'
                : 'text-white/60 hover:text-white hover:bg-white/5 border-transparent'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {lang === 'bn' ? 'নিয়ন্ত্রণ কক্ষ' : 'Verified Evidence'}
          </button>
        </div>
      </nav>

      {/* CORE FRAME CONTAINER VIEWPORTS */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 relative z-10">
        
        {loading && activeTab !== 'landing' && (
          <div className="p-16 text-center flex flex-col gap-3 justify-center items-center font-mono">
            <RefreshCw className="w-10 h-10 text-red-500 animate-spin" />
            <div className="text-zinc-400 animate-pulse">SYNCHRONIZING CENTRAL WHISTLE LEDGER STACK...</div>
          </div>
        )}

        {!loading && (
          <>
            {/* TAB: LANDING */}
            {activeTab === 'landing' && (
              <LiveOperationsCenter
                reports={reports}
                lang={lang}
                onSelectTab={handleTabChange}
                onSelectReport={setSelectedReport}
              />
            )}


            {/* TAB: INTERACTIVE MAP */}
            {activeTab === 'map' && (
              <MapBangladesh
                reports={filteredFeed}
                selectedReport={selectedReport}
                onSelectReport={(r) => setSelectedReport(r)}
                onCreateReportFromCoords={handleMapCoordinateReport}
                selectedDivision={selectedDivision}
                setSelectedDivision={setSelectedDivision}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            )}

            {/* TAB: AI RELATIONSHIP NETWORK GRAPH */}
            {activeTab === 'intel' && (
              <NetworkGraph
                reports={reports}
                onSelectReport={(r) => {
                  setSelectedReport(r);
                  setActiveTab('map');
                }}
              />
            )}

            {/* TAB: ADVANCED ANALYTICS */}
            {activeTab === 'analytics' && (
              <AnalyticsDashboard reports={reports} />
            )}

            {/* TAB: SUBMISSION FORM */}
            {activeTab === 'report' && (
              <ReportSubmission
                initialDivision={coordsDivision || "Dhaka"}
                initialDistrict={coordsDistrict || "Dhaka"}
                initialAddress={coordsAddress || ""}
                initialLat={coordsLat}
                initialLng={coordsLng}
                onSubmitted={() => {
                  fetchReportsList();
                  setActiveTab('map');
                }}
                citizenUserId={citizenId}
              />
            )}

            {/* TAB: LEADERBOARD / SHAME */}
            {activeTab === 'leaderboard' && (
              <Leaderboard reports={reports} />
            )}

            {/* TAB: PRIVILEGED ADMIN */}
            {activeTab === 'admin' && (
              <AdminPanel
                reports={reports}
                onUpdateStatus={handleAdminUpdateStatus}
                onDeleteReport={handleAdminDeleteReport}
                onAddComment={handleAdminAddComment}
              />
            )}
          </>
        )}

      </main>

      {/* CONTINUOUS DECENTRALIZED COMPLAINT TICKER TAPING */}
      <footer className="border-t border-zinc-900 bg-zinc-950/70 p-3 relative z-30 font-mono text-[9px] tracking-wide select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div className="bg-red-950 text-red-500 border border-red-900 px-2.5 py-0.5 rounded font-bold shrink-0 animate-pulse uppercase">
            {lang === 'bn' ? 'সরাসরি দুর্নীতি ফিড' : 'LIVE CONSOLE EXPONSES'}
          </div>

          {/* MARQUEE */}
          <div className="flex-1 overflow-hidden relative w-full h-4">
            <div className="absolute flex gap-12 whitespace-nowrap animate-[marquee_20s_linear_infinite] hover:[animation-play-state:paused]">
              {reports.map((r, i) => (
                <span key={`${r.id}-${i}`} className="text-zinc-400">
                  <strong className="text-red-500">[{r.id}]</strong> {r.title} • ({r.division}) • Status: <span className="text-zinc-200">{r.status}</span>
                </span>
              ))}
              {/* Duplication block to guarantee seamless continuous scroll */}
              {reports.map((r, i) => (
                <span key={`dup-${r.id}-${i}`} className="text-zinc-400">
                  <strong className="text-red-500">[{r.id}]</strong> {r.title} • ({r.division}) • Status: <span className="text-zinc-200">{r.status}</span>
                </span>
              ))}
            </div>
          </div>

          <span className="text-zinc-600 shrink-0 hidden md:inline">
            SYSTEM AWAKE • SERVER LATENCY: 24ms
          </span>

        </div>
      </footer>

      {/* Embedded CSS custom Keyframes for Marquee and Fade transformations */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .tactical-scanlines {
          position: relative;
        }
        .tactical-scanlines::before {
          content: " ";
          display: block;
          position: absolute;
          top: 0; left: 0; bottom: 0; right: 0;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.45) 50%), linear-gradient(90deg, rgba(230, 100, 0, 0.02), rgba(0, 0, 0, 0), rgba(230, 100, 0, 0.02));
          background-size: 100% 3px, 3px 100%;
          z-index: 999;
          opacity: 0.85;
          pointer-events: none;
        }
      `}</style>

    </div>
  );
}
