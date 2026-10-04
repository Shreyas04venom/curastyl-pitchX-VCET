"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  X, Search, Sparkles, MapPin, CheckCircle2,
  Building2, Phone, Clock, Scissors, Loader2, ArrowRight,
  Navigation2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MUMBAI_AREAS } from "@/lib/utils";

// Dynamically import InteractiveMap without SSR
const InteractiveMap = dynamic(
  () => import("@/components/shared/InteractiveMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-48 sm:h-56 rounded-2xl bg-[#160b29] flex flex-col items-center justify-center border border-purple-500/20 text-purple-300 gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
        <span className="text-xs text-purple-300/70">Loading Mumbai Map...</span>
      </div>
    ),
  }
) as React.ComponentType<{
  center: { lat: number; lng: number };
  onMarkerDrag: (lat: number, lng: number) => void;
  className?: string;
}>;

const AREA_COORDINATES: Record<string, { lat: number; lng: number; pincode: string }> = {
  "Bandra": { lat: 19.0596, lng: 72.8295, pincode: "400050" },
  "Bandra West": { lat: 19.0596, lng: 72.8295, pincode: "400050" },
  "Andheri": { lat: 19.1136, lng: 72.8697, pincode: "400053" },
  "Powai": { lat: 19.1176, lng: 72.9060, pincode: "400076" },
  "Juhu": { lat: 19.0988, lng: 72.8264, pincode: "400049" },
  "Versova": { lat: 19.1319, lng: 72.8147, pincode: "400061" },
  "Malad": { lat: 19.1860, lng: 72.8485, pincode: "400064" },
  "Borivali": { lat: 19.2288, lng: 72.8541, pincode: "400092" },
  "Dadar": { lat: 19.0178, lng: 72.8478, pincode: "400028" },
  "Worli": { lat: 19.0134, lng: 72.8154, pincode: "400018" },
  "Lower Parel": { lat: 18.9953, lng: 72.8286, pincode: "400013" },
  "Colaba": { lat: 18.9067, lng: 72.8147, pincode: "400005" },
  "Fort": { lat: 18.9345, lng: 72.8370, pincode: "400001" },
  "Churchgate": { lat: 18.9322, lng: 72.8264, pincode: "400020" },
  "Santacruz": { lat: 19.0843, lng: 72.8360, pincode: "400054" },
  "Vile Parle": { lat: 19.0997, lng: 72.8438, pincode: "400057" },
  "Kurla": { lat: 19.0726, lng: 72.8845, pincode: "400070" },
  "Chembur": { lat: 19.0522, lng: 72.8994, pincode: "400071" },
  "Ghatkopar": { lat: 19.0856, lng: 72.9082, pincode: "400086" },
  "Mulund": { lat: 19.1726, lng: 72.9565, pincode: "400080" },
  "Thane": { lat: 19.2183, lng: 72.9781, pincode: "400601" },
  "Navi Mumbai": { lat: 19.0330, lng: 73.0297, pincode: "400703" },
};

interface MapAutoFillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: {
    name: string;
    tagline: string;
    description: string;
    category: "unisex" | "women" | "men";
    address: string;
    area: string;
    pincode: string;
    lat: number;
    lng: number;
    phone: string;
    services: string[];
    amenities: string[];
  }) => void;
  initialName?: string;
  initialArea?: string;
}

export default function MapAutoFillModal({
  isOpen,
  onClose,
  onApply,
  initialName = "",
  initialArea = "Bandra",
}: MapAutoFillModalProps) {
  const [salonQuery, setSalonQuery] = useState(initialName);
  const [selectedArea, setSelectedArea] = useState(initialArea || "Bandra");
  const [isSearching, setIsSearching] = useState(false);
  const [previewData, setPreviewData] = useState<any | null>(null);

  // Map state
  const initialCoord = AREA_COORDINATES[initialArea] || AREA_COORDINATES["Bandra"];
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: initialCoord.lat,
    lng: initialCoord.lng,
  });
  const [pinAddress, setPinAddress] = useState<string>("");

  if (!isOpen) return null;

  const handleAreaChange = (newArea: string) => {
    setSelectedArea(newArea);
    // Find matching coordinates
    const directMatch = AREA_COORDINATES[newArea];
    if (directMatch) {
      setMapCenter({ lat: directMatch.lat, lng: directMatch.lng });
      setPinAddress(`${newArea}, Mumbai - ${directMatch.pincode}`);
      return;
    }

    const partialMatch = Object.keys(AREA_COORDINATES).find(k => 
      newArea.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(newArea.toLowerCase())
    );
    if (partialMatch) {
      const areaData = AREA_COORDINATES[partialMatch];
      setMapCenter({ lat: areaData.lat, lng: areaData.lng });
      setPinAddress(`${newArea}, Mumbai - ${areaData.pincode}`);
    }
  };

  const handleMarkerDrag = async (newLat: number, newLng: number) => {
    setMapCenter({ lat: newLat, lng: newLng });

    // Mathematical closest area as immediate fallback so field updates instantly
    let closestArea = selectedArea;
    let minD = Infinity;
    for (const [name, coord] of Object.entries(AREA_COORDINATES)) {
      const d = Math.hypot(newLat - coord.lat, newLng - coord.lng);
      if (d < minD) {
        minD = d;
        closestArea = name;
      }
    }
    setSelectedArea(closestArea);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}&zoom=18&addressdetails=1`
      );
      const data = await res.json();
      if (data && data.display_name) {
        // Filter out administrative ward/zone codes like "H/W Ward", "Mumbai Zone 3", pincodes, country
        const rawParts = data.display_name.split(",").map((p: string) => p.trim());
        const cleanParts = rawParts.filter((p: string) => {
          const lower = p.toLowerCase();
          if (lower.includes("ward")) return false; // filters "H/W Ward"
          if (lower.includes("zone")) return false; // filters "Mumbai Zone 3"
          if (lower === "maharashtra") return false;
          if (lower === "india") return false;
          if (/^\d{6}$/.test(p)) return false;
          return true;
        });

        const locationName = (cleanParts.length > 0 ? cleanParts.slice(0, 3).join(", ") : rawParts.slice(0, 2).join(", "));
        
        // Synchronize both downside and upperside to the exact same clean readable location
        setPinAddress(locationName);
        setSelectedArea(locationName);
      }
    } catch {
      // already updated closestArea
    }
  };

  const handleSearch = async () => {
    if (!salonQuery.trim()) return;

    setIsSearching(true);
    setPreviewData(null);

    try {
      // 1. Query OpenStreetMap Nominatim for Mumbai area / place
      const searchQuery = `${salonQuery.trim()}, ${selectedArea}, Mumbai, Maharashtra`;
      let geoData: any = null;

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery
          )}&limit=1&countrycodes=in&viewbox=72.7,18.8,73.1,19.3&bounded=1&addressdetails=1`
        );
        const results = await res.json();
        if (results && results.length > 0) {
          geoData = results[0];
        }
      } catch (err) {
        console.warn("OSM search fallback triggered:", err);
      }

      // If specific place wasn't found, search by area center to get coordinates
      if (!geoData) {
        try {
          const areaRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              `${selectedArea}, Mumbai`
            )}&limit=1&countrycodes=in&addressdetails=1`
          );
          const areaResults = await areaRes.json();
          if (areaResults && areaResults.length > 0) {
            geoData = areaResults[0];
          }
        } catch {
          // ignore
        }
      }

      const fallback = AREA_COORDINATES[selectedArea] || AREA_COORDINATES["Bandra"];
      const lat = geoData ? parseFloat(geoData.lat) : mapCenter.lat || fallback.lat;
      const lng = geoData ? parseFloat(geoData.lon) : mapCenter.lng || fallback.lng;
      
      // Update map center immediately
      setMapCenter({ lat, lng });

      const detectedPincode =
        geoData?.address?.postcode ||
        geoData?.address?.postal_code ||
        fallback.pincode;

      let finalArea = selectedArea;
      if (geoData?.display_name) {
        const rawParts = geoData.display_name.split(",").map((p: string) => p.trim());
        const cleanParts = rawParts.filter((p: string) => {
          const lower = p.toLowerCase();
          if (lower.includes("ward")) return false;
          if (lower.includes("zone")) return false;
          if (lower === "maharashtra") return false;
          if (lower === "india") return false;
          if (/^\d{6}$/.test(p)) return false;
          return true;
        });

        const locationName = (cleanParts.length > 0 ? cleanParts.slice(0, 3).join(", ") : rawParts.slice(0, 2).join(", "));
        if (locationName) {
          finalArea = locationName;
          setSelectedArea(locationName);
          setPinAddress(locationName);
        }
      }

      const formattedAddress = `${finalArea}, Mumbai - ${detectedPincode}`;

      // Smart category detection
      const lower = salonQuery.toLowerCase();
      let category: "unisex" | "women" | "men" = "unisex";
      if (lower.includes("men") || lower.includes("barber") || lower.includes("gentlemen")) {
        category = "men";
      } else if (lower.includes("women") || lower.includes("beauty parlour") || lower.includes("ladies")) {
        category = "women";
      }

      // Smart Tagline & Description
      const tagline = `Premium Hair & Beauty Experience in ${finalArea}`;
      const description = `Welcome to ${salonQuery.trim()}, your go-to destination for world-class grooming and beauty care in ${finalArea}, Mumbai. Our certified stylists and therapists use top-tier international products to deliver precision haircuts, hair spa, rejuvenating facials, and complete aesthetic care tailored to you.`;

      const generated = {
        name: salonQuery.trim(),
        tagline,
        description,
        category,
        address: formattedAddress,
        area: finalArea,
        pincode: detectedPincode,
        lat,
        lng,
        phone: "+91 98200 12345",
        services: ["Haircut", "Hair Color", "Hair Treatment", "Facial", "Spa", "Manicure"],
        amenities: ["Air Conditioned", "WiFi", "Card Payment", "Parking", "Refreshments"],
      };

      setPreviewData(generated);
    } catch (err) {
      console.error("Auto-fill error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleApply = () => {
    if (!previewData) return;
    onApply(previewData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#140b24] border border-purple-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-purple-900/40 text-white max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 shrink-0">
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Map Auto-Fill Assistant
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-semibold">
                AI Powered
              </span>
            </h2>
            <p className="text-xs text-white/60">
              Provide salon name & pin your location on the map to auto-complete all details
            </p>
          </div>
        </div>

        {/* Inputs & Interactive Map Container */}
        <div className="space-y-4 p-4 rounded-2xl bg-white/5 border border-white/10 mb-5">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Salon Name or Brand <span className="text-purple-400">*</span>
            </label>
            <Input
              placeholder="e.g. Looks Salon, BBLUNT, Glam Studio"
              value={salonQuery}
              onChange={(e) => setSalonQuery(e.target.value)}
              className="bg-white/5 border-purple-500/30 text-white placeholder:text-white/30"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-white/70">
                Locality / Area in Mumbai <span className="text-purple-400">*</span>
              </label>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Pin Synced
              </span>
            </div>
            <div className="relative">
              <Input
                type="text"
                list="mumbai-areas-list"
                value={selectedArea}
                onChange={(e) => handleAreaChange(e.target.value)}
                placeholder="Type or pick locality (e.g. Bandra, Andheri, Juhu...)"
                className="w-full bg-[#1b0e31] border border-purple-500/30 text-white placeholder:text-white/30 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-purple-400"
              />
              <datalist id="mumbai-areas-list">
                {MUMBAI_AREAS.map((a) => (
                  <option key={a} value={a} />
                ))}
              </datalist>
            </div>
            <p className="text-[10px] text-white/40 mt-1">
              Drag the map marker or type to automatically update this locality.
            </p>
          </div>

          {/* ── Interactive Map Section ──────────────────────────────── */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-white/80 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-pink-400" />
                Live Map & Pin Location
              </span>
              <span className="text-[11px] text-purple-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Drag marker to adjust
              </span>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-purple-500/30 shadow-lg">
              <InteractiveMap
                center={mapCenter}
                onMarkerDrag={handleMarkerDrag}
                className="w-full h-48 sm:h-52 rounded-2xl"
              />

              {/* Coordinates & Location Floating Chip */}
              <div className="absolute bottom-2 left-2 right-2 bg-[#120724]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center justify-between text-[11px] text-white/90 z-[400] shadow-md">
                <div className="flex items-center gap-1.5 truncate mr-2">
                  <Navigation2 className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  <span className="truncate">
                    {pinAddress || `${selectedArea}, Mumbai`}
                  </span>
                </div>
                <div className="text-purple-300 font-mono text-[10px] shrink-0">
                  {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSearch}
            disabled={!salonQuery.trim() || isSearching}
            className="w-full gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium py-2.5 rounded-xl shadow-md shadow-purple-500/20"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Fetching Details from Map...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" /> Fetch & Auto-Complete Salon Info
              </>
            )}
          </Button>
        </div>

        {/* Preview of auto-filled data */}
        {previewData && (
          <div className="space-y-4 animate-in fade-in-50 duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Details Ready to Auto-Fill
              </h3>
              <span className="text-[11px] text-white/50">
                Lat: {previewData.lat.toFixed(4)}, Lng: {previewData.lng.toFixed(4)}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-3 text-xs">
              <div className="flex items-start gap-2">
                <Building2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">{previewData.name}</span>
                  <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 capitalize">
                    {previewData.category}
                  </span>
                  <p className="text-white/60 text-[11px] mt-0.5">{previewData.tagline}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white/90">{previewData.address}</p>
                  <p className="text-white/40 text-[10px] mt-0.5">
                    Area: <strong className="text-white/70">{previewData.area}</strong> | Pincode:{" "}
                    <strong className="text-white/70">{previewData.pincode}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-white/70">
                <Scissors className="w-4 h-4 text-purple-400 shrink-0" />
                <span>
                  Auto-configured <strong>{previewData.services.length} popular services</strong> & standard operating hours (10:00 - 20:30)
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                You can review, tweak, and edit all auto-filled fields manually across each step.
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="glass"
                onClick={onClose}
                className="flex-1 text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleApply}
                className="flex-1 gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-medium text-xs shadow-lg shadow-emerald-500/20"
              >
                Apply All Details <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
