import React, { useState, useEffect, useRef } from 'react';
import { CorruptionReport } from '../types';
import { soundPlayer } from './AudioAlerts';
import { MapPin, ShieldAlert, Sparkles, AlertCircle, Eye, SlidersHorizontal, Layers, CheckCircle2, Globe } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapBangladeshProps {
  reports: CorruptionReport[];
  selectedReport: CorruptionReport | null;
  onSelectReport: (report: CorruptionReport) => void;
  onCreateReportFromCoords: (division: string, district: string, address: string, lat?: number, lng?: number) => void;
  selectedDivision: string;
  setSelectedDivision: (div: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}

// Bangladesh Divisions Geographic Center Coordinate mapping
const DIVISION_COORDS: Record<string, { lat: number; lng: number }> = {
  "Dhaka": { lat: 23.8103, lng: 90.4125 },
  "Chittagong": { lat: 22.3569, lng: 91.7832 },
  "Sylhet": { lat: 24.8949, lng: 91.8687 },
  "Khulna": { lat: 22.8456, lng: 89.5403 },
  "Rajshahi": { lat: 24.3745, lng: 88.6042 },
  "Rangpur": { lat: 25.7558, lng: 89.2447 },
  "Barisal": { lat: 22.7010, lng: 90.3535 },
  "Mymensingh": { lat: 24.7471, lng: 90.4031 }
};

// Extremely precise District center coords lookup dictionary mapping for all 64 districts
const DISTRICT_COORDS: Record<string, { lat: number; lng: number }> = {
  "Dhaka": { lat: 23.8103, lng: 90.4125 },
  "Gazipur": { lat: 23.9999, lng: 90.4203 },
  "Narayanganj": { lat: 23.6238, lng: 90.5000 },
  "Tangail": { lat: 24.2513, lng: 89.9167 },
  "Faridpur": { lat: 23.6074, lng: 89.8430 },
  "Manikganj": { lat: 23.8617, lng: 90.0050 },
  "Munshiganj": { lat: 23.5422, lng: 90.5305 },
  "Rajbari": { lat: 23.7574, lng: 89.6444 },
  "Madaripur": { lat: 23.1648, lng: 90.1896 },
  "Gopalganj": { lat: 23.0074, lng: 89.8182 },
  "Shariatpur": { lat: 23.2423, lng: 90.3412 },
  "Narsingdi": { lat: 23.9228, lng: 90.7177 },
  "Kishoreganj": { lat: 24.4392, lng: 90.7818 },
  "Chittagong": { lat: 22.3569, lng: 91.7832 },
  "Cox's Bazar": { lat: 21.4272, lng: 92.0058 },
  "Comilla": { lat: 23.4682, lng: 91.1785 },
  "Feni": { lat: 23.0159, lng: 91.3976 },
  "Noakhali": { lat: 22.8696, lng: 91.0991 },
  "Chandpur": { lat: 23.2321, lng: 90.6631 },
  "Brahmanbaria": { lat: 23.9571, lng: 91.1119 },
  "Rangamati": { lat: 22.6556, lng: 92.1794 },
  "Khagrachari": { lat: 23.1197, lng: 91.9847 },
  "Bandarban": { lat: 22.1953, lng: 92.2184 },
  "Lakshmipur": { lat: 22.9426, lng: 90.8411 },
  "Sylhet": { lat: 24.8949, lng: 91.8687 },
  "Moulvibazar": { lat: 24.4829, lng: 91.7680 },
  "Habiganj": { lat: 24.3745, lng: 91.4111 },
  "Sunamganj": { lat: 25.0715, lng: 91.4032 },
  "Khulna": { lat: 22.8456, lng: 89.5403 },
  "Jessore": { lat: 23.1634, lng: 89.2182 },
  "Satkhira": { lat: 22.7185, lng: 89.0705 },
  "Bagerhat": { lat: 22.6516, lng: 89.7859 },
  "Kushtia": { lat: 23.9013, lng: 89.1205 },
  "Meherpur": { lat: 23.7623, lng: 88.6318 },
  "Chuadanga": { lat: 23.6420, lng: 88.8471 },
  "Magura": { lat: 23.4873, lng: 89.4199 },
  "Jhenaidah": { lat: 23.5448, lng: 89.1726 },
  "Narail": { lat: 23.1725, lng: 89.5126 },
  "Barisal": { lat: 22.7010, lng: 90.3535 },
  "Barguna": { lat: 22.1500, lng: 90.1333 },
  "Bhola": { lat: 22.6875, lng: 90.6441 },
  "Jhalokati": { lat: 22.6406, lng: 90.1989 },
  "Patuakhali": { lat: 22.3533, lng: 90.3347 },
  "Pirojpur": { lat: 22.5791, lng: 89.9753 },
  "Rajshahi": { lat: 24.3745, lng: 88.6042 },
  "Bogra": { lat: 24.8466, lng: 89.3730 },
  "Pabna": { lat: 24.0063, lng: 89.2314 },
  "Naogaon": { lat: 24.7936, lng: 88.9318 },
  "Natore": { lat: 24.4102, lng: 88.9546 },
  "Chapai Nawabganj": { lat: 24.5960, lng: 88.2711 },
  "Joypurhat": { lat: 25.0947, lng: 89.0203 },
  "Sirajganj": { lat: 24.4578, lng: 89.7081 },
  "Rangpur": { lat: 25.7558, lng: 89.2447 },
  "Dinajpur": { lat: 25.6217, lng: 88.6354 },
  "Kurigram": { lat: 25.8072, lng: 89.6295 },
  "Gaibandha": { lat: 25.3297, lng: 89.5430 },
  "Nilphamari": { lat: 25.9317, lng: 88.8473 },
  "Panchagarh": { lat: 26.3344, lng: 88.5617 },
  "Thakurgaon": { lat: 26.0418, lng: 88.4283 },
  "Lalmonirhat": { lat: 25.9165, lng: 89.4494 },
  "Mymensingh": { lat: 24.7471, lng: 90.4031 },
  "Sherpur": { lat: 25.0189, lng: 90.0175 },
  "Jamalpur": { lat: 24.9375, lng: 89.9377 },
  "Netrokona": { lat: 24.8780, lng: 90.7275 }
};

interface DivisionShape {
  id: string;
  name: string;
  banglaName: string;
  districts: string[];
}

const REGIONAL_DIVISIONS: DivisionShape[] = [
  {
    id: "dhaka",
    name: "Dhaka",
    banglaName: "ঢাকা",
    districts: ["Dhaka", "Gazipur", "Narayanganj", "Tangail", "Faridpur", "Manikganj", "Munshiganj", "Rajbari", "Madaripur", "Gopalganj", "Shariatpur", "Narsingdi", "Kishoreganj"]
  },
  {
    id: "chittagong",
    name: "Chittagong",
    banglaName: "চট্টগ্রাম",
    districts: ["Chittagong", "Cox's Bazar", "Comilla", "Feni", "Noakhali", "Chandpur", "Brahmanbaria", "Rangamati", "Khagrachari", "Bandarban", "Lakshmipur"]
  },
  {
    id: "sylhet",
    name: "Sylhet",
    banglaName: "সিলেট",
    districts: ["Sylhet", "Moulvibazar", "Habiganj", "Sunamganj"]
  },
  {
    id: "khulna",
    name: "Khulna",
    banglaName: "খুলনা",
    districts: ["Khulna", "Jessore", "Satkhira", "Bagerhat", "Kushtia", "Meherpur", "Chuadanga", "Magura", "Jhenaidah", "Narail"]
  },
  {
    id: "rajshahi",
    name: "Rajshahi",
    banglaName: "রাজশাহী",
    districts: ["Rajshahi", "Bogra", "Pabna", "Naogaon", "Natore", "Chapai Nawabganj", "Joypurhat", "Sirajganj"]
  },
  {
    id: "rangpur",
    name: "Rangpur",
    banglaName: "রংপুর",
    districts: ["Rangpur", "Dinajpur", "Kurigram", "Gaibandha", "Nilphamari", "Panchagarh", "Thakurgaon", "Lalmonirhat"]
  },
  {
    id: "barisal",
    name: "Barisal",
    banglaName: "বরিশাল",
    districts: ["Barisal", "Barguna", "Bhola", "Jhalokati", "Patuakhali", "Pirojpur"]
  },
  {
    id: "mymensingh",
    name: "Mymensingh",
    banglaName: "ময়মনসিংহ",
    districts: ["Mymensingh", "Sherpur", "Jamalpur", "Netrokona"]
  }
];

// Helper to lookup coordinates for reports with jitter support to avoid stacked pins
const getReportCoordinates = (r: CorruptionReport): { lat: number; lng: number } => {
  if (typeof r.lat === "number" && typeof r.lng === "number") {
    return { lat: r.lat, lng: r.lng };
  }
  
  const base = DISTRICT_COORDS[r.district] || DIVISION_COORDS[r.division] || { lat: 23.6850, lng: 90.3563 };
  
  // Deterministic little geojitter using Report ID to separate reports on the exact same district center
  let hash = 0;
  for (let i = 0; i < r.id.length; i++) {
    hash = r.id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const latOffset = ((Math.abs(hash) % 100) - 50) / 1100; // max ~0.04 degrees (~4km)
  const lngOffset = ((Math.abs(hash * 17) % 100) - 50) / 1100;
  
  return { lat: base.lat + latOffset, lng: base.lng + lngOffset };
};

// Distance check to find nearest division name from lat/lng clicked
const getNearestDivision = (lat: number, lng: number): string => {
  let nearestDiv = "Dhaka";
  let minDist = Infinity;
  for (const [divName, coords] of Object.entries(DIVISION_COORDS)) {
    const dist = Math.sqrt(Math.pow(coords.lat - lat, 2) + Math.pow(coords.lng - lng, 2));
    if (dist < minDist) {
      minDist = dist;
      nearestDiv = divName;
    }
  }
  return nearestDiv;
};

export default function MapBangladesh({
  reports,
  selectedReport,
  onSelectReport,
  onCreateReportFromCoords,
  selectedDivision,
  setSelectedDivision,
  selectedCategory,
  setSelectedCategory
}: MapBangladeshProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const draftMarkerRef = useRef<L.Marker | null>(null);

  const [mapClickedCoords, setMapClickedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedSubDistrict, setSelectedSubDistrict] = useState<string>("");

  // Filter reports
  const filteredReports = reports.filter(r => {
    const matchesDiv = selectedDivision === "ALL" || r.division.toUpperCase() === selectedDivision.toUpperCase();
    const matchesCat = selectedCategory === "ALL" || r.category === selectedCategory;
    return matchesDiv && matchesCat;
  });

  // Calculate division heat index
  const getDivisionCount = (divName: string) => {
    return reports.filter(r => r.division.toLowerCase() === divName.toLowerCase()).length;
  };

  const getDivisionSeverity = (divName: string) => {
    const divisionReports = reports.filter(r => r.division.toLowerCase() === divName.toLowerCase());
    if (divisionReports.length === 0) return "NONE";
    const hasExtreme = divisionReports.some(r => r.aiAnalysis?.priority === 'EXTREME');
    const hasHigh = divisionReports.some(r => r.aiAnalysis?.priority === 'HIGH');
    if (hasExtreme) return "EXTREME";
    if (hasHigh) return "HIGH";
    return "MEDIUM";
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create Map
    const mapInstance = L.map(mapContainerRef.current, {
      center: [23.6850, 90.3563],
      zoom: 7,
      maxBounds: L.latLngBounds([19.5, 87.0], [27.0, 93.0]),
      attributionControl: true,
      zoomControl: true
    });

    // Elegant CartoDB Dark Matter Tiles (Totally free & Gorgeous dark/neon cyber aesthetic)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://carto.com/attributions">CartoDB</a>'
    }).addTo(mapInstance);

    // Create LayerGroup for dynamic markers refresh
    const markersGroup = L.layerGroup().addTo(mapInstance);
    markersGroupRef.current = markersGroup;

    // Map click dynamic coordinator selection listener
    mapInstance.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      soundPlayer.playKeyTap();
      setMapClickedCoords({ lat, lng });

      const nearestDivName = getNearestDivision(lat, lng);
      setSelectedDivision(nearestDivName);

      const districts = REGIONAL_DIVISIONS.find(r => r.name === nearestDivName)?.districts || ["Dhaka"];
      setSelectedSubDistrict(districts[0]);
    });

    mapRef.current = mapInstance;

    // Handle initial component unmount cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Sync / FLY center coordinate position based on division filters
  useEffect(() => {
    if (!mapRef.current) return;
    if (selectedDivision && selectedDivision !== "ALL") {
      const targetCoords = DIVISION_COORDS[selectedDivision];
      if (targetCoords) {
        mapRef.current.flyTo([targetCoords.lat, targetCoords.lng], 9, {
          animate: true,
          duration: 1.2
        });
      }
    } else {
      mapRef.current.flyTo([23.6850, 90.3563], 7, {
        animate: true,
        duration: 1.0
      });
    }
  }, [selectedDivision]);

  // Redraw Report Pins when filtered items list updates
  useEffect(() => {
    if (!mapRef.current || !markersGroupRef.current) return;
    
    // Clear old markers
    markersGroupRef.current.clearLayers();

    filteredReports.forEach((r) => {
      const coords = getReportCoordinates(r);
      const priority = r.aiAnalysis?.priority || "MEDIUM";

      // Color code based on severity priority metric status
      const pinColorClass = 
        priority === "EXTREME" ? "bg-red-500 ring-red-500/20" : 
        priority === "HIGH" ? "bg-amber-500 ring-amber-500/20" : "bg-cyan-500 ring-cyan-500/20";

      const pinGlowClass = 
        priority === "EXTREME" ? "shadow-[0_0_12px_#ef4444]" : 
        priority === "HIGH" ? "shadow-[0_0_10px_#f59e0b]" : "shadow-[0_0_8px_#06b6d4]";

      const isSelected = selectedReport?.id === r.id;

      // Custom div wrapper icon to allow tailwind CSS animations, pulsing, and precise icons
      const customIcon = L.divIcon({
        html: `
          <div class="relative group cursor-pointer flex items-center justify-center">
            <span class="absolute pointer-events-none inline-flex h-6 w-6 rounded-full bg-white/5 opacity-75 animate-ping"></span>
            <div class="p-1.5 rounded-full border border-zinc-950/40 relative z-10 transition-all duration-300 transform ${isSelected ? 'scale-125 ring-4 ring-white/40' : 'hover:scale-110'} ${pinColorClass} ${pinGlowClass}">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <!-- Marker Info label shown briefly on hover -->
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#020202]/95 border border-white/10 px-2 py-1 rounded text-[8px] font-mono text-white whitespace-nowrap opacity-0 max-w-xs group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
              [${r.id}] ${r.title.slice(0, 20)}...
            </div>
          </div>
        `,
        className: 'custom-leaflet-pin',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([coords.lat, coords.lng], { icon: customIcon });
      
      marker.on('click', () => {
        soundPlayer.playSonar();
        onSelectReport(r);
      });

      markersGroupRef.current?.addLayer(marker);
    });

  }, [filteredReports, selectedReport]);

  // Draw Prospect Draft Pin when map is clicked to lock coordinates
  useEffect(() => {
    if (!mapRef.current) return;

    if (draftMarkerRef.current) {
      draftMarkerRef.current.remove();
      draftMarkerRef.current = null;
    }

    if (mapClickedCoords) {
      const draftIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center animate-bounce">
            <div class="p-2 bg-emerald-500 rounded-full shadow-lg shadow-emerald-950/50 ring-4 ring-emerald-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
          </div>
        `,
        className: 'draft-leaflet-pin',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      const dm = L.marker([mapClickedCoords.lat, mapClickedCoords.lng], { icon: draftIcon }).addTo(mapRef.current);
      draftMarkerRef.current = dm;
    }
  }, [mapClickedCoords]);

  const handleRegisterPinClick = () => {
    if (!mapClickedCoords) return;
    const nearestDivName = selectedDivision !== "ALL" ? selectedDivision : getNearestDivision(mapClickedCoords.lat, mapClickedCoords.lng);
    const divisionObj = REGIONAL_DIVISIONS.find(d => d.name.toLowerCase() === nearestDivName.toLowerCase()) || REGIONAL_DIVISIONS[0];
    const districtName = selectedSubDistrict || divisionObj.districts[0];
    const defaultAddress = `Geo-Intercept Coords: [LAT:${mapClickedCoords.lat.toFixed(5)}, LNG:${mapClickedCoords.lng.toFixed(5)}] in ${districtName}, ${divisionObj.name}`;
    
    soundPlayer.playSonar();
    onCreateReportFromCoords(divisionObj.name, districtName, defaultAddress, mapClickedCoords.lat, mapClickedCoords.lng);
    setMapClickedCoords(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-140px)] text-white animate-fade-in w-full">
      
      {/* LEFT: MAP FILTERS & CONSOLE STATS */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        
        {/* HEATMAP LEGEND & CONTROLS */}
        <div className="bg-[#080808]/90 border border-white/10 p-4 rounded-sm shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600 animate-pulse"></div>
          
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal className="w-5 h-5 text-red-500 font-mono" />
            <span className="font-sans text-[10px] font-bold tracking-widest text-white uppercase">MAP INTEL FILTERS</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-white/40 font-mono text-[9px] uppercase tracking-wider mb-1">Division Segment</label>
              <select
                value={selectedDivision}
                onChange={(e) => {
                  setSelectedDivision(e.target.value);
                  setSelectedSubDistrict("");
                  soundPlayer.playKeyTap();
                }}
                className="w-full bg-[#050505] border border-white/10 rounded-sm px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-red-500"
              >
                <option value="ALL">ALL DIVISIONS (সমগ্র বাংলাদেশ)</option>
                {REGIONAL_DIVISIONS.map(div => (
                  <option key={div.id} value={div.name}>{div.name} / {div.banglaName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white/40 font-mono text-[9px] uppercase tracking-wider mb-1">Corruption Classification</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  soundPlayer.playKeyTap();
                }}
                className="w-full bg-[#050505] border border-white/10 rounded-sm px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-red-500"
              >
                <option value="ALL">ALL TYPES (সকল প্রকার দুর্নীতি)</option>
                <option value="Bribery">Bribery (ঘুষ গ্রহণ)</option>
                <option value="Embezzlement">Embezzlement (অর্থ আত্মসাৎ)</option>
                <option value="Extortion">Extortion (চাঁদাবাজি)</option>
                <option value="Nepotism">Nepotism (স্বজনপ্রীতি)</option>
                <option value="Power Abuse">Power Abuse (ক্ষমতার অপব্যবহার)</option>
                <option value="Procurement Fraud">Procurement Fraud (সরকারি ক্রয়ে জালিয়াতি)</option>
              </select>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-white/10 space-y-2">
            <div className="text-[9px] text-white/40 font-mono uppercase tracking-wider">Severity Heat Index</div>
            <div className="flex gap-2 items-center text-xs">
              <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse"></span>
              <span className="font-mono text-[10px] text-white/60">EXTREME DANGER (সর্বোচ্চ হুমকি)</span>
            </div>
            <div className="flex gap-2 items-center text-xs">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
              <span className="font-mono text-[10px] text-white/60">HIGH OUTRAGE</span>
            </div>
            <div className="flex gap-2 items-center text-xs">
              <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full"></span>
              <span className="font-mono text-[10px] text-white/60">MEDIUM ACTIVE FEED</span>
            </div>
          </div>
        </div>

        {/* REGIONAL STATS & CRITICAL HOTSPOTS */}
        <div className="bg-[#080808]/90 border border-white/10 p-4 rounded-sm shadow-2xl flex-1 flex flex-col gap-3 min-h-[250px]">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-white/45" />
              <h4 className="font-sans text-[10px] font-bold text-white/75 uppercase tracking-widest">REGIONAL METRICS</h4>
            </div>
            <span className="text-[9px] font-mono bg-red-600 text-white px-2 py-0.5 rounded-sm animate-pulse tracking-wider">
              LIVE RADAR
            </span>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[300px] pr-1 flex-1 font-mono text-[11px]">
            {REGIONAL_DIVISIONS.map(div => {
              const count = getDivisionCount(div.name);
              const severity = getDivisionSeverity(div.name);
              return (
                <div
                  key={div.id}
                  onClick={() => {
                    setSelectedDivision(div.name);
                    soundPlayer.playSonar();
                  }}
                  className={`p-2.5 rounded-sm border cursor-pointer transition-all duration-300 ${
                    selectedDivision === div.name
                      ? 'bg-red-600/10 border-red-500 shadow-md shadow-red-950/30'
                      : 'bg-white/5 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white">{div.name} ({div.banglaName})</span>
                    <span className="bg-white/10 text-white/80 px-2 py-0.5 text-[9px] rounded-sm border border-white/10 font-bold">
                      {count} {count === 1 ? 'case' : 'cases'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-white/40">
                    <span>SEVERITY STATUS</span>
                    <span className={`font-bold ${
                      severity === 'EXTREME' ? 'text-red-500' : severity === 'HIGH' ? 'text-amber-500' : severity === 'MEDIUM' ? 'text-[#06b6d4]' : 'text-zinc-600'
                    }`}>{severity}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SATELLITE GPS ADMONITION */}
          <div className="bg-white/5 border border-white/10 rounded-sm p-3 text-[10px] text-white/50 font-sans leading-relaxed mt-auto uppercase tracking-wide">
            <span className="text-red-500 font-bold">💡 MAP TELEPORT: </span>
            Click anywhere on the Open-Source Cyber map to lock custom coordinates, select standard district parameters, and lodge whistleblowing reports instantly.
          </div>
        </div>

      </div>

      {/* CENTER: THE INTERACTIVE GRAPHIC REAL LEAFLET MAP CONTAINER */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="bg-[#080808]/90 border border-white/10 p-2 rounded-sm shadow-2xl flex-1 flex flex-col relative min-h-[500px] overflow-hidden">
          
          {/* MAP WATERMARK OVERLAY */}
          <div className="absolute top-4 left-4 font-mono select-none pointer-events-none opacity-50 z-50 bg-[#020202]/90 border border-white/10 p-2 rounded-sm">
            <div className="text-[10px] text-red-500 tracking-wider font-bold flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-red-500 animate-spin" />
              SATELLITE INTEL CELL ACTIVE
            </div>
            <div className="text-[9px] text-zinc-500">BD CYBER INTEL GRID NETWORK</div>
          </div>

          {/* Map canvas anchor */}
          <div ref={mapContainerRef} className="w-full h-full flex-1 relative min-h-[480px] rounded-sm border border-white/5 z-0" />

          {/* REPORT FROM COORDINATES POPUP PANEL OVERLAY */}
          {mapClickedCoords && (
            <div className="absolute bottom-4 left-4 right-4 bg-[#0a0a0a]/95 border border-green-500/30 p-3.5 rounded-sm shadow-2xl flex flex-col gap-2 z-[1000] font-mono animate-fade-in text-xs">
              <div className="flex justify-between items-center text-green-400 text-[9px] tracking-widest uppercase font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  GEOSPATIAL INTERCEPT ACTIVE
                </div>
                <span>LAT: {mapClickedCoords.lat.toFixed(5)} // LNG: {mapClickedCoords.lng.toFixed(5)}</span>
              </div>

              <div className="text-zinc-300">
                Nearest Division: <span className="text-white font-bold">{selectedDivision}</span>. 
                <div className="mt-1.5 flex items-center">
                  Select Target District:
                  <select 
                    value={selectedSubDistrict}
                    onChange={(e) => setSelectedSubDistrict(e.target.value)}
                    className="ml-2 bg-[#050505] text-white border border-white/10 text-[11px] rounded-sm p-1 px-2 focus:outline-none focus:border-green-500"
                  >
                    {(REGIONAL_DIVISIONS.find(d => d.name === selectedDivision)?.districts || ["Dhaka"]).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setMapClickedCoords(null)}
                  className="px-3 py-1 bg-white/5 border border-white/10 hover:border-white/20 text-white/50 hover:text-white rounded-sm cursor-pointer transition-colors text-[10px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRegisterPinClick}
                  className="px-4 py-1 bg-green-600 hover:bg-green-700 text-[#000] font-sans font-black rounded-sm tracking-wider cursor-pointer flex items-center gap-1.5 text-[10px] uppercase transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  FILE REPORT FROM HERE
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* RIGHT: SELECT CASE DETAILS PREVIEW */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        
        {/* ACTIVE SELECTOR WRAPPER */}
        <div className="bg-[#080808]/90 border border-white/10 p-5 rounded-sm shadow-2xl flex-1 flex flex-col relative min-h-[500px]">
          {selectedReport ? (
            <div className="flex flex-col gap-4 h-full text-left">
              
              {/* HEADER BADGE */}
              <div className="flex justify-between items-start border-b border-white/10 pb-3">
                <div>
                  <span className="font-mono text-[9px] bg-red-600 text-white px-2.5 py-0.5 rounded-sm uppercase font-bold tracking-wider">
                    ID: {selectedReport.id}
                  </span>
                  <p className="font-mono text-[9px] text-white/40 mt-1 uppercase tracking-wider">
                    Filed on {selectedReport.date} in {selectedReport.division}
                  </p>
                </div>
                
                {/* STATUS BAR */}
                <span className={`font-mono text-[9px] px-2 py-0.5 rounded-sm uppercase border font-bold ${
                  selectedReport.status === 'APPROVED' ? 'bg-green-600/10 text-green-400 border-green-500/20' :
                  selectedReport.status === 'AI_VERIFIED' ? 'bg-cyan-600/10 text-cyan-400 border-cyan-500/20' :
                  selectedReport.status === 'UNDER_INVESTIGATION' ? 'bg-amber-600/10 text-amber-400 border-amber-500/20' :
                  'bg-white/5 text-white/40 border-white/10'
                }`}>
                  {selectedReport.status.replace('_', ' ')}
                </span>
              </div>

              {/* CORE METALS */}
              <div className="space-y-1">
                <h4 className="text-white font-sans font-black text-sm uppercase tracking-wide leading-snug">
                  {selectedReport.title}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-red-500 font-mono mt-1 font-bold">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Category: {selectedReport.category}</span>
                </div>
              </div>

              {/* REPORT METRICS GRID */}
              <div className="grid grid-cols-2 gap-2 bg-[#050505] border border-white/10 rounded-sm p-3 text-xs font-mono">
                <div>
                  <span className="text-[9px] text-white/40 uppercase tracking-widest block">Ministry involved</span>
                  <span className="text-white font-semibold truncate block mt-0.5">{selectedReport.ministry || "Unspecified"}</span>
                </div>
                <div>
                  <span className="text-[9px] text-white/40 uppercase tracking-widest block">Specific Site</span>
                  <span className="text-white font-semibold truncate block mt-0.5">{selectedReport.district}, BD</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-white/5 mt-1">
                  <span className="text-[9px] text-white/40 uppercase tracking-widest block">Accused / Target</span>
                  <span className="text-red-500 font-bold truncate block mt-0.5">{selectedReport.involvedPeople || "Not disclosed"}</span>
                </div>
              </div>

              {/* DESCRIPTION PANEL */}
              <div className="flex-1 overflow-y-auto max-h-[160px] bg-[#050505] border border-white/5 rounded-sm p-3.5 text-xs leading-relaxed text-white/70 font-sans">
                {selectedReport.description}
              </div>

              {/* AI VERIFICATION MATRIX */}
              {selectedReport.aiAnalysis && (
                <div className="bg-[#050505] border border-white/10 rounded-sm p-3.5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-800/5 blur-xl rounded-full"></div>
                  
                  <div className="flex justify-between items-center mb-1 font-mono">
                    <span className="text-[9px] font-bold text-red-500 tracking-wider flex items-center gap-1 uppercase">
                      <Sparkles className="w-3 h-3 text-red-400" />
                      AI AUDITING STATS
                    </span>
                    <span className="text-[9px] text-white/40">
                      Score: <span className="text-white font-bold">{selectedReport.aiAnalysis.credibilityScore}%</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-2 text-center text-xs font-mono">
                    <div className="bg-white/5 border border-white/5 p-1.5 rounded-sm">
                      <div className="text-[8px] text-white/40 uppercase">SPAM LOGIC</div>
                      <div className={`font-bold text-xs ${selectedReport.aiAnalysis.spamConfidence > 40 ? 'text-red-500' : 'text-green-500'}`}>
                        {selectedReport.aiAnalysis.spamConfidence}%
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-1.5 rounded-sm">
                      <div className="text-[8px] text-white/40 uppercase">TRUST VALUE</div>
                      <div className="font-bold text-xs text-green-400">
                        {selectedReport.aiAnalysis.credibilityScore}%
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-1.5 rounded-sm">
                      <div className="text-[8px] text-white/40 uppercase">PRIORITY</div>
                      <div className="font-bold text-[9px] text-red-500">
                        {selectedReport.aiAnalysis.priority}
                      </div>
                    </div>
                  </div>

                  <p className="mt-2.5 text-[10px] text-white/50 font-sans italic leading-relaxed">
                    AI Assessment Summary: "{selectedReport.aiAnalysis.analysisSummary}"
                  </p>
                </div>
              )}

              {/* EVIDENCE UPLOAD VIEW */}
              {selectedReport.evidence && selectedReport.evidence.length > 0 && (
                <div>
                  <span className="text-[9px] font-sans font-bold text-white/50 uppercase tracking-widest block mb-1.5">Submitted Leak Evidence</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.evidence.map((ev, i) => (
                      <a
                        key={i}
                        href={ev.contentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 bg-white/5 border border-white/10 hover:border-white/20 rounded-sm p-2 text-[10px] font-mono text-white/80 w-full truncate transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-red-500" />
                        <span className="truncate">{ev.name} ({Math.round(ev.size/1024)} KB)</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* TIMELINE TRACK */}
              <div className="border-t border-white/10 pt-3">
                <span className="text-[9px] font-sans font-bold text-white/50 uppercase tracking-widest block mb-2">INTEGRITY BLOCK TIMELINE</span>
                <div className="space-y-2 max-h-[110px] overflow-y-auto font-mono text-[10px]">
                  {selectedReport.timeline.map((item, idx) => (
                    <div key={idx} className="flex gap-2.5">
                      <div className="flex flex-col items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                        <div className="w-0.5 h-full bg-white/5"></div>
                      </div>
                      <div className="pb-1.5">
                        <div className="font-bold text-white uppercase tracking-wider text-[9px]">{item.status}</div>
                        <div className="text-white/40 text-[9px]">{item.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center font-sans text-xs text-white/50 p-6 h-full">
              <AlertCircle className="w-10 h-10 text-white/20 animate-pulse mb-3" />
              <div className="text-white/80 font-bold uppercase tracking-widest mb-1.5 text-[10px]">NO ARCHIVE PIN SELECTED</div>
              <p className="leading-relaxed text-zinc-400">Click any interactive coordinate pin on the glowing satellite Bangladesh Open-source Map to examine official whistled incidents, AI auditing vectors, leaks data, and secure timeline verification metrics.</p>
              <div className="mt-4 text-[9px] uppercase tracking-wider leading-relaxed border-t border-white/5 pt-3.5 text-white/30 w-full font-mono">
                DHARAIYA DE INTELLIGENCE RADAR TERMINAL • OPERATING STATE SECURE
              </div>
            </div>
          )}
        </div>
        
      </div>

    </div>
  );
}
