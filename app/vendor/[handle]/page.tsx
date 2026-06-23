"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowLeft,
  Share2,
  Info,
} from "lucide-react";
import Link from "next/link";
import {
  getPlatformWarning,
  formatHandleForDisplay,
  PLATFORM_CONFIG,
} from "@/lib/platform";
import type { Platform } from "@/lib/platform";

interface VendorData {
  handle: string;
  platform: string;
  trust_score: number;
  verdict: string;
  total_reviews: number;
  legit_count: number;
  scam_count: number;
  summary: string;
  sources: string[];
  advice: string[];
  red_flags: string[];
  is_suspicious: boolean;
  checked_at: string;
}

interface Review {
  id: string;
  verdict: "legit" | "scammed";
  comment: string | null;
  evidence_url: string | null;
  created_at: string;
}

function scoreColor(score: number, verdict: string) {
  if (verdict === "unverified") return "text-white/40";
  if (verdict === "flagged" || score < 40) return "text-red-400";
  if (score < 70) return "text-yellow-400";
  return "text-green-400";
}

function scoreBg(score: number, verdict: string) {
  if (verdict === "unverified") return "border-white/20";
  if (verdict === "flagged" || score < 40) return "border-red-400/50";
  if (score < 70) return "border-yellow-400/50";
  return "border-green-400/50";
}

function verdictLabel(verdict: string) {
  const map: Record<string, string> = {
    unverified: "Unverified",
    mostly_legit: "Mostly Legit",
    mixed: "Mixed Reviews",
    high_risk: "High Risk",
    flagged: "Flagged",
  };
  return map[verdict] ?? verdict;
}

function verdictIcon(verdict: string) {
  if (verdict === "mostly_legit")
    return <CheckCircle size={14} className="text-green-400" />;
  if (verdict === "unverified")
    return <Clock size={14} className="text-white/40" />;
  return <AlertTriangle size={14} className="text-red-400" />;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export default function VendorPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const handle = params.handle as string;
  const platform = (searchParams.get("platform") ?? "instagram") as Platform;

  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [verdict, setVerdict] = useState<"legit" | "scammed" | "">("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const platformConfig = PLATFORM_CONFIG[platform];
  const platformWarning = getPlatformWarning(platform);
  const displayHandle = formatHandleForDisplay(handle, platform);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [vendorRes, reviewsRes] = await Promise.all([
          fetch(`/api/vendor/${handle}?platform=${platform}`),
          fetch(`/api/vendor/${handle}/reviews`),
        ]);

        const vendorData = await vendorRes.json();
        const reviewsData = await reviewsRes.json();

        if (!vendorRes.ok) throw new Error(vendorData.error);
        setVendor(vendorData);
        setReviews(reviewsData.reviews ?? []);
      } catch (err: any) {
        setError(err.message ?? "Failed to load vendor.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [handle, platform]);

  const submitReview = async () => {
    if (!verdict) {
      setSubmitError("Please select Legit or Scammed.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch(`/api/vendor/${handle}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verdict, comment, platform }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSubmitted(true);
      setVerdict("");
      setComment("");

      const [vendorRes, reviewsRes] = await Promise.all([
        fetch(`/api/vendor/${handle}?platform=${platform}`),
        fetch(`/api/vendor/${handle}/reviews`),
      ]);
      setVendor(await vendorRes.json());
      setReviews((await reviewsRes.json()).reviews ?? []);
    } catch (err: any) {
      setSubmitError(err.message ?? "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const share = () => {
    const text = `I just checked ${displayHandle} on Vendorfy — trust score ${vendor?.trust_score ?? "?"}/100 (${verdictLabel(vendor?.verdict ?? "")}) Vendorfy.ng/vendor/${handle}?platform=${platform}`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Checking vendor...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
        <div className="text-center">
          <AlertTriangle size={32} className="text-red-400 mx-auto mb-4" />
          <p className="text-white/60">{error}</p>
          <Link
            href="/"
            className="text-green-400 text-sm mt-4 inline-block hover:underline"
          >
            Go back
          </Link>
        </div>
      </main>
    );
  }

  if (!vendor) return null;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <Link
          href="/"
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
        <div className="flex items-center gap-2">
          <Shield className="text-green-400" size={18} />
          <span className="font-bold text-sm">Vendorfy</span>
        </div>
        <button
          onClick={share}
          className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm"
        >
          <Share2 size={16} />
          Share
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6">

        {/* Platform warning banner */}
        <div className="flex items-start gap-3 bg-yellow-400/5 border border-yellow-400/20 rounded-xl px-4 py-3">
          <Info size={15} className="text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="flex flex-col gap-0.5">
            <span className={`text-xs font-semibold ${platformConfig.color}`}>
              {platformConfig.label}
            </span>
            <p className="text-white/40 text-xs leading-relaxed">
              {platformWarning}
            </p>
          </div>
        </div>

        {/* Score card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
          {/* Score circle */}
          <div
            className={`w-28 h-28 rounded-full border-4 ${scoreBg(
              vendor.trust_score,
              vendor.verdict
            )} flex flex-col items-center justify-center flex-shrink-0`}
          >
            <span
              className={`text-3xl font-bold ${scoreColor(
                vendor.trust_score,
                vendor.verdict
              )}`}
            >
              {vendor.verdict === "unverified" ? "?" : vendor.trust_score}
            </span>
            <span className="text-white/30 text-xs">/100</span>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-2 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              {verdictIcon(vendor.verdict)}
              <span
                className={`text-sm font-semibold ${scoreColor(
                  vendor.trust_score,
                  vendor.verdict
                )}`}
              >
                {verdictLabel(vendor.verdict)}
              </span>
            </div>
            <h1 className="text-2xl font-bold">{displayHandle}</h1>
            <span
              className={`text-xs font-semibold ${platformConfig.color} w-fit mx-auto sm:mx-0`}
            >
              {platformConfig.label}
            </span>
            <div className="flex items-center gap-4 justify-center sm:justify-start text-xs text-white/40 mt-1">
              <span>{vendor.total_reviews} review{vendor.total_reviews !== 1 ? "s" : ""}</span>
              <span className="text-green-400">{vendor.legit_count} legit</span>
              <span className="text-red-400">{vendor.scam_count} scammed</span>
            </div>
          </div>
        </div>

        {/* Summary */}
        {vendor.summary && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">
              Summary
            </h2>
            <p className="text-white/70 text-sm leading-relaxed">{vendor.summary}</p>
          </div>
        )}

        {/* Sources */}
        {vendor.sources.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">
              What the data shows
            </h2>
            <ul className="flex flex-col gap-2">
              {vendor.sources.map((source, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                  <span className="text-green-400 mt-0.5">•</span>
                  {source}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Advice */}
        {vendor.advice.length > 0 && (
          <div className="bg-white/5 border border-yellow-400/20 rounded-2xl p-5">
            <h2 className="text-xs font-semibold text-yellow-400/70 uppercase tracking-widest mb-3">
              Our advice
            </h2>
            <ul className="flex flex-col gap-2">
              {vendor.advice.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                  <span className="text-yellow-400 mt-0.5">→</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Red flags */}
        {vendor.red_flags.length > 0 && (
          <div className="bg-red-400/5 border border-red-400/20 rounded-2xl p-5">
            <h2 className="text-xs font-semibold text-red-400/70 uppercase tracking-widest mb-3">
              Automated red flags
            </h2>
            <ul className="flex flex-col gap-2">
              {vendor.red_flags.map((flag, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                  <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                  {flag}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Reviews */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">
            Community Reviews ({reviews.length})
          </h2>

          {reviews.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
              <p className="text-white/30 text-sm">
                No reviews yet. Be the first to review this vendor.
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {review.verdict === "legit" ? (
                      <CheckCircle size={14} className="text-green-400" />
                    ) : (
                      <AlertTriangle size={14} className="text-red-400" />
                    )}
                    <span
                      className={`text-sm font-semibold capitalize ${
                        review.verdict === "legit"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {review.verdict}
                    </span>
                  </div>
                  <span className="text-white/30 text-xs">
                    {timeAgo(review.created_at)}
                  </span>
                </div>
        {review.comment && (
  <p className="text-white/60 text-sm leading-relaxed break-all line-clamp-4">
    {review.comment}
  </p>
)}
                {review.evidence_url && (
                  <a
                    href={review.evidence_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 text-xs hover:underline"
                  >
                    View evidence
                  </a>
                )}
              </div>
            ))
          )}
        </div>

        {/* Submit review */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">
            Submit a Review
          </h2>

          {submitted ? (
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle size={16} />
              Review submitted — thank you for keeping the community safe.
            </div>
          ) : (
            <>
              <div className="flex gap-3">
                <button
                  onClick={() => setVerdict("legit")}
                  className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                    verdict === "legit"
                      ? "bg-green-400/10 border-green-400 text-green-400"
                      : "border-white/10 text-white/40 hover:border-white/20"
                  }`}
                >
                  <CheckCircle size={14} />
                  Legit
                </button>
                <button
                  onClick={() => setVerdict("scammed")}
                  className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                    verdict === "scammed"
                      ? "bg-red-400/10 border-red-400 text-red-400"
                      : "border-white/10 text-white/40 hover:border-white/20"
                  }`}
                >
                  <AlertTriangle size={14} />
                  Scammed
                </button>
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Describe your experience (optional, max 500 chars)..."
                maxLength={500}
                rows={3}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors resize-none"
              />

              {submitError && (
                <p className="text-red-400 text-sm">{submitError}</p>
              )}

              <button
                onClick={submitReview}
                disabled={submitting}
                className="bg-green-400 hover:bg-green-300 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>

              <p className="text-white/20 text-xs text-center">
                Reviews reflect your personal experience. False reports may be removed.
                Submissions are anonymous.
              </p>
            </>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-white/20 text-xs text-center leading-relaxed pb-4">
          Trust scores are based on community-submitted reviews and automated analysis.
          Vendorfy does not independently verify claims made in reviews.
          All reviews represent the opinions of individual community members.
        </p>

      </div>
    </main>
  );
}
