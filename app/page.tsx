"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Shield, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { validateHandle, PLATFORM_CONFIG } from "@/lib/platform";
import type { Platform } from "@/lib/platform";

const PLATFORMS: Platform[] = ["instagram", "tiktok", "whatsapp", "twitter"];

export default function Home() {
  const router = useRouter();
  const [handle, setHandle] = useState("");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const config = PLATFORM_CONFIG[platform];

  const handleSearch = () => {
    const validation = validateHandle(handle, platform);
    if (!validation.valid) {
      setError(validation.error ?? "Invalid handle.");
      return;
    }
    setError("");
    setLoading(true);
    router.push(`/vendor/${validation.formatted}?platform=${platform}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Shield className="text-green-400" size={22} />
          <span className="font-bold text-lg tracking-tight">CheckVendor</span>
        </div>
        <a
          href="/docs"
          className="text-sm text-white/50 hover:text-white transition-colors"
        >
          API Docs
        </a>
      </nav>

      {/* Hero */}
      <div className="flex flex-col items-center justify-center flex-1 px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-green-400/10 border border-green-400/20 text-green-400 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          Community-powered vendor trust
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-4 max-w-3xl">
          Check any vendor
          <span className="text-green-400"> before you pay.</span>
        </h1>

        <p className="text-white/50 text-lg max-w-xl mb-12">
          Search any Instagram, TikTok, WhatsApp or Twitter vendor.
          See real community reviews and trust scores before you send that money.
        </p>

        {/* Search box */}
        <div className="w-full max-w-xl">

          {/* Platform tabs */}
          <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 mb-3">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPlatform(p);
                  setHandle("");
                  setError("");
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  platform === p
                    ? "bg-white/10 text-white"
                    : "text-white/30 hover:text-white/60"
                }`}
              >
                {PLATFORM_CONFIG[p].label}
              </button>
            ))}
          </div>

          {/* Handle input */}
          <div className={`flex items-center gap-3 bg-white/5 border rounded-xl px-4 mb-3 transition-colors focus-within:border-white/30 ${
            error ? "border-red-400/50" : "border-white/10"
          }`}>
            {config.prefix && (
              <span className="text-white/30 text-sm">{config.prefix}</span>
            )}
            <input
              type={platform === "whatsapp" ? "tel" : "text"}
              value={handle}
              onChange={(e) => {
                setHandle(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              placeholder={config.placeholder}
              className="flex-1 bg-transparent py-3.5 text-white placeholder-white/30 outline-none text-sm"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm mb-3 text-left">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}

          {/* Format hint */}
          {!error && (
            <p className="text-white/20 text-xs text-left mb-3">
              {platform === "whatsapp"
                ? "Enter a phone number e.g. 08012345678 or +2348012345678"
                : `Enter handle without @ e.g. ${config.example}`}
            </p>
          )}

          <button
            onClick={handleSearch}
            disabled={loading || !handle.trim()}
            className="w-full bg-green-400 hover:bg-green-300 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Search size={16} />
            {loading ? "Searching..." : "Check Vendor"}
          </button>
        </div>

        {/* Example searches */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <span className="text-white/20 text-xs">Try:</span>
          {[
            { handle: "zeeluxury_ng", platform: "instagram" as Platform },
            { handle: "fashionbyamaka", platform: "tiktok" as Platform },
            { handle: "08012345678", platform: "whatsapp" as Platform },
          ].map((ex) => (
            <button
              key={ex.handle}
              onClick={() => {
                setHandle(ex.handle);
                setPlatform(ex.platform);
                setError("");
              }}
              className="text-xs text-white/30 hover:text-white/60 border border-white/10 hover:border-white/20 px-3 py-1 rounded-full transition-colors"
            >
              {ex.platform === "whatsapp" ? "" : "@"}{ex.handle}
              <span className="text-white/20 ml-1">
                {PLATFORM_CONFIG[ex.platform].label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="border-t border-white/10 px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-white/30 text-xs font-medium uppercase tracking-widest mb-12">
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: <Search size={20} className="text-green-400" />,
                title: "Search any vendor",
                desc: "Paste any Instagram, TikTok, WhatsApp, or Twitter handle — no account needed.",
              },
              {
                icon: <Shield size={20} className="text-green-400" />,
                title: "See community reviews",
                desc: "Real reports from real buyers. Trust scores built from verified community feedback.",
              },
              {
                icon: <CheckCircle size={20} className="text-green-400" />,
                title: "Transact with confidence",
                desc: "Make informed decisions before sending money. Flag bad vendors to protect others.",
              },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-400/10 border border-green-400/20 flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-sm">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Supported platforms */}
      <div className="border-t border-white/10 px-6 py-10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-white/20 text-xs uppercase tracking-widest mb-6">
            Supported platforms
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {PLATFORMS.map((p) => (
              <div
                key={p}
                className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2"
              >
                <span className={`text-xs font-semibold ${PLATFORM_CONFIG[p].color}`}>
                  {PLATFORM_CONFIG[p].label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 px-6 py-6 text-center">
        <p className="text-white/20 text-xs">
          CheckVendor — Community reviews reflect the opinions of individual users, not CheckVendor.
          All scores are based on submitted community data.{" "}
          <a href="/docs" className="underline hover:text-white/40 transition-colors">
            API access
          </a>
        </p>
        <p className="text-white/20 text-xs">
  CheckVendor — Community reviews reflect the opinions of individual users, not CheckVendor.{" "}
  <a href="/docs" className="underline hover:text-white/40 transition-colors">
    API access
  </a>
  {" · "}
  <a href="/privacy" className="underline hover:text-white/40 transition-colors">
    Privacy Policy
  </a>
</p>
      </div>

    </main>
  );
}
