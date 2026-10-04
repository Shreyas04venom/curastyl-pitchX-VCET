"use client";

import { useState } from "react";
import {
  ShieldCheck, FileText, Zap, Home, UploadCloud,
  CheckCircle2, AlertTriangle, Loader2, Sparkles, X,
  ExternalLink, Eye, Award, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export type VerificationDocType = "gumasta" | "electricity_bill" | "rent_agreement";

interface SalonVerificationStepProps {
  salonData: {
    name: string;
    address: string;
    area: string;
    pincode: string;
    ownerName?: string;
    phone?: string;
  };
  selectedDocType: VerificationDocType;
  onSelectDocType: (type: VerificationDocType) => void;
  file: File | null;
  filePreview: string | null;
  onFileSelect: (file: File | null, base64: string | null) => void;
  aiResult: any;
  setAiResult: (res: any) => void;
}

const DOC_TYPES = [
  {
    id: "gumasta" as VerificationDocType,
    title: "Gumasta License",
    subtitle: "Shop & Establishment Act Certificate",
    badge: "Recommended",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    icon: Award,
    desc: "Official municipal certificate issued by BMC / Maharashtra Government with the registered salon premises address.",
  },
  {
    id: "electricity_bill" as VerificationDocType,
    title: "Electricity Bill",
    subtitle: "Adani / Tata Power / BEST / MSEDCL",
    badge: "Quick",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    icon: Zap,
    desc: "Recent commercial electricity bill (within last 3 months) showing the meter address matching your salon location.",
  },
  {
    id: "rent_agreement" as VerificationDocType,
    title: "Rent Agreement",
    subtitle: "Registered Commercial Lease",
    badge: "Tenants",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    icon: Home,
    desc: "Valid commercial leave & license agreement specifying the salon premise address and authorized occupant name.",
  },
];

export default function SalonVerificationStep({
  salonData,
  selectedDocType,
  onSelectDocType,
  file,
  filePreview,
  onFileSelect,
  aiResult,
  setAiResult,
}: SalonVerificationStepProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      onFileSelect(selected, base64);
      // Reset prior analysis when new file is uploaded
      setAiResult(null);
    };
    reader.readAsDataURL(selected);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;

    if (droppedFile.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      onFileSelect(droppedFile, base64);
      setAiResult(null);
    };
    reader.readAsDataURL(droppedFile);
  };

  const runAiVerification = async () => {
    if (!file || !filePreview) {
      toast.error("Please upload your document first");
      return;
    }

    if (!salonData.name || !salonData.address) {
      toast.error("Please provide salon name and address in previous steps first");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(10);
    setAnalysisStage("Uploading document to encrypted compliance vault...");

    // Smooth simulated stages while awaiting Gemini vision
    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev < 30) {
          setAnalysisStage("Scanning document structure with Gemini Vision OCR...");
          return prev + 15;
        } else if (prev < 65) {
          setAnalysisStage("Extracting registered establishment address & authority seals...");
          return prev + 12;
        } else if (prev < 85) {
          setAnalysisStage(`Cross-referencing address with "${salonData.area}, Mumbai"...`);
          return prev + 8;
        }
        return prev;
      });
    }, 450);

    try {
      const res = await fetch("/api/salon/verify-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: filePreview,
          documentType: selectedDocType,
          salonData: {
            name: salonData.name,
            address: salonData.address,
            area: salonData.area,
            pincode: salonData.pincode,
            ownerName: salonData.ownerName,
            phone: salonData.phone,
          },
        }),
      });

      clearInterval(interval);
      setAnalysisProgress(100);
      setAnalysisStage("Analysis complete!");

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");

      if (data.analysis) {
        setAiResult(data.analysis);
        if (data.analysis.is_verified) {
          toast.success("Address proof verified successfully! 🎉");
        } else {
          toast("Document submitted. Queued for manual admin review.", { icon: "ℹ️" });
        }
      }
    } catch (err: any) {
      clearInterval(interval);
      console.error("AI Verification error:", err);
      toast.error(err.message || "Could not analyze document. Please check the file and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const removeFile = () => {
    onFileSelect(null, null);
    setAiResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-semibold text-white">Salon Ownership & Address Verification</h2>
        </div>
        <p className="text-white/60 text-xs sm:text-sm">
          To protect clients and ensure only authentic salon owners list on CuraStyl, upload{" "}
          <strong className="text-purple-300">1 valid address proof</strong>. Our AI will analyze
          and cross-verify the address in 1–2 minutes.
        </p>
      </div>

      {/* Document Type Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-white/70">
          Select Document Type to Upload <span className="text-purple-400">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DOC_TYPES.map((doc) => {
            const Icon = doc.icon;
            const isSelected = selectedDocType === doc.id;
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => {
                  onSelectDocType(doc.id);
                  if (aiResult) setAiResult(null);
                }}
                className={cn(
                  "p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between relative",
                  isSelected
                    ? "border-purple-400 bg-purple-500/15 shadow-lg shadow-purple-500/10"
                    : "border-white/10 hover:border-purple-500/30 bg-white/2"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center",
                      isSelected ? "bg-purple-500 text-white" : "bg-white/10 text-white/60"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full border font-semibold",
                      doc.badgeColor
                    )}
                  >
                    {doc.badge}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{doc.title}</h4>
                  <p className="text-[11px] text-white/50">{doc.subtitle}</p>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Address Info Card */}
      <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-white/70 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-purple-300 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Registered Salon Premise to Match:</span>
          <p className="text-purple-200/90 mt-0.5">
            "{salonData.address || `${salonData.area}, Mumbai`}"
          </p>
          <p className="text-[10px] text-white/40 mt-1">
            *The document address must correspond to this physical shop location in {salonData.area || "Mumbai"}.
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      {!file ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="relative border-2 border-dashed border-purple-500/30 hover:border-purple-500/60 rounded-2xl p-8 text-center bg-white/2 hover:bg-purple-500/5 transition-all cursor-pointer group"
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            id="verification-doc-input"
          />
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
              <UploadCloud className="w-7 h-7 text-purple-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                Drag & Drop or <span className="text-purple-400 underline">Browse File</span>
              </p>
              <p className="text-xs text-white/40 mt-1">
                Supports JPG, PNG, WEBP or PDF (Max 10MB)
              </p>
            </div>
            <div className="text-[11px] text-white/40 flex items-center gap-2">
              <span>🔒 256-bit encrypted</span>
              <span>•</span>
              <span>Only used for verification</span>
            </div>
          </div>
        </div>
      ) : (
        /* Uploaded File Preview */
        <div className="p-4 rounded-2xl bg-white/5 border border-purple-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {filePreview && file.type.startsWith("image/") ? (
                <img
                  src={filePreview}
                  alt="Document Preview"
                  className="w-16 h-16 object-cover rounded-xl border border-white/20"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-purple-300" />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-white truncate max-w-xs">{file.name}</p>
                <p className="text-xs text-white/50">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ready for AI Analysis
                </span>
              </div>
            </div>

            <button
              onClick={removeFile}
              className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-300 transition-colors"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Trigger Scan Button */}
          {!aiResult && !isAnalyzing && (
            <Button
              type="button"
              onClick={runAiVerification}
              className="w-full gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium py-2.5 rounded-xl shadow-lg shadow-purple-500/20"
            >
              <Sparkles className="w-4 h-4 animate-pulse" /> Run AI Verification Scan (1–2 Min)
            </Button>
          )}

          {/* Scanning Progress Animation */}
          {isAnalyzing && (
            <div className="p-4 rounded-xl bg-[#1a0e30] border border-purple-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-purple-300 font-semibold flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> {analysisStage}
                </span>
                <span className="text-white/60 font-mono">{analysisProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-white/40 italic">
                Gemini Vision OCR is inspecting the address, stamps, and issuing authority...
              </p>
            </div>
          )}
        </div>
      )}

      {/* AI Analysis Result Report Card */}
      {aiResult && (() => {
        const matchScore = typeof aiResult.address_match_score === "number" ? aiResult.address_match_score : 0;
        const isVerified = Boolean(aiResult.is_verified && matchScore >= 70);

        return (
          <div
            className={cn(
              "p-5 rounded-2xl border space-y-4 animate-in fade-in-50 duration-300",
              isVerified
                ? "bg-emerald-950/30 border-emerald-500/40"
                : "bg-red-950/30 border-red-500/40"
            )}
          >
            {/* Header Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    isVerified ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                  )}
                >
                  {isVerified ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <AlertTriangle className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {isVerified ? "Address Proof Verified by CuraStyl AI" : "Verification Failed – Address Mismatch"}
                    <span
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                        isVerified
                          ? "bg-emerald-500 text-white"
                          : "bg-red-500/30 text-red-300 border border-red-500/40"
                      )}
                    >
                      {matchScore}% Match
                    </span>
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    Detected: <strong className="text-white">{aiResult.document_detected_type}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Pass/Fail Status Banner */}
            {isVerified ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Verification Passed!</strong> Address matches registered salon premise. Click <strong>Continue</strong> to select your plan.
                </span>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-red-300">Cannot Continue with this Document:</span>
                    <p className="text-[11px] text-red-200/80 mt-0.5">
                      The document does not match your salon in {salonData.area || "Mumbai"}. You must upload a genuine address proof for this salon to continue.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/40 text-xs font-medium transition-colors"
                >
                  Upload Another Document
                </button>
              </div>
            )}

            {/* Details breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                <span className="text-white/40 text-[10px] uppercase font-semibold">Extracted Address</span>
                <p className="text-white font-medium">{aiResult.extracted_address || "Address detected in document"}</p>
                {aiResult.extracted_pincode && (
                  <p className="text-white/50 text-[10px]">Pincode: {aiResult.extracted_pincode}</p>
                )}
              </div>

              <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
                <span className="text-white/40 text-[10px] uppercase font-semibold">Issuing Authority / Consumer</span>
                <p className="text-white font-medium">{aiResult.issuing_authority || "Authority"}</p>
                <p className="text-white/50 text-[10px]">Entity: {aiResult.extracted_entity_name || salonData.name}</p>
              </div>
            </div>

            {/* Key Findings */}
            {aiResult.key_findings && (
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-semibold text-white/80">AI Verification Findings:</span>
                <div className="space-y-1">
                  {aiResult.key_findings.map((f: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-white/70">
                      {isVerified ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      )}
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            {aiResult.analysis_summary && (
              <p className="text-xs text-white/70 bg-white/5 p-3 rounded-xl border border-white/5 italic">
                "{aiResult.analysis_summary}"
              </p>
            )}
          </div>
        );
      })()}
    </div>
  );
}
