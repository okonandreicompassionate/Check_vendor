 "use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, ArrowLeft, Copy, CheckCircle } from "lucide-react";

function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <span className="text-white/30 text-xs">{lang}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-white/30 hover:text-white transition-colors text-xs"
        >
          {copied ? (
            <CheckCircle size={12} className="text-green-400" />
          ) : (
            <Copy size={12} />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="px-4 py-4 text-sm text-white/70 overflow-x-auto whitespace-pre-wrap">
        {code}
      </pre>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function DocsPage() {
  const [email, setEmail] = useState("");
  const [bizName, setBizName] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [keyError, setKeyError] = useState("");

  const requestKey = async () => {
    if (!email || !bizName) {
      setKeyError("Please fill in both fields.");
      return;
    }
    setRequesting(true);
    setKeyError("");

    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          business_name: bizName,
          tier: "free",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setApiKey(data.api_key);
    } catch (err: any) {
      setKeyError(err.message ?? "Something went wrong.");
    } finally {
      setRequesting(false);
    }
  };

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
          <span className="font-bold text-sm">Vendorfy API</span>
        </div>
        <div className="w-16" />
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col gap-12">

        {/* Header */}
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold">API Reference</h1>
          <p className="text-white/50 text-sm leading-relaxed">
            Embed vendor trust scores directly in your checkout flow, lending platform,
            or marketplace. One API call returns a full trust score, summary, and advice.
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {["REST", "JSON", "No SDK needed"].map((tag) => (
              <span
                key={tag}
                className="text-xs bg-white/5 border border-white/10 px-3 py-1 rounded-full text-white/40"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Base URL */}
        <Section title="Base URL">
          <CodeBlock code="https://Vendorfy.ng/api" lang="text" />
        </Section>

        {/* Authentication */}
        <Section title="Authentication">
          <p className="text-white/50 text-sm leading-relaxed">
            Pass your API key in the Authorization header. Free tier allows 100
            lookups/month with no key (identified by IP).
          </p>
          <CodeBlock
            code={`Authorization: Bearer YOUR_API_KEY`}
            lang="http"
          />
        </Section>

        {/* Endpoints */}
        <Section title="Endpoints">

          {/* GET vendor */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold bg-green-400/10 text-green-400 border border-green-400/20 px-2 py-1 rounded-lg">
                GET
              </span>
              <code className="text-sm text-white/70">/api/vendor/:handle</code>
            </div>
            <p className="text-white/40 text-sm">
              Returns trust score, verdict, summary, sources, and advice for a vendor.
              Creates the vendor record automatically if it doesn't exist yet.
            </p>

            <div className="flex flex-col gap-2">
              <p className="text-xs text-white/30 uppercase tracking-widest">Example request</p>
              <CodeBlock
                code={`curl https://Vendorfy.ng/api/vendor/zeeluxury_ng \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                lang="bash"
              />
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-xs text-white/30 uppercase tracking-widest">Example response</p>
              <CodeBlock
                code={JSON.stringify(
                  {
                    handle: "zeeluxury_ng",
                    platform: "instagram",
                    trust_score: 73,
                    verdict: "mostly_legit",
                    total_reviews: 24,
                    legit_count: 20,
                    scam_count: 4,
                    summary:
                      "Based on 24 community reviews, this vendor has a generally positive reputation. 20 reviewers reported a positive experience, while 4 reported a negative one.",
                    sources: [
                      "24 community reviews submitted on Vendorfy.",
                      "20 reviewers reported a positive transaction.",
                      "4 reviewers reported a negative experience.",
                    ],
                    advice: [
                      "Community reports suggest this vendor has a positive track record.",
                      "As with any online transaction, consider using a secure payment method.",
                    ],
                    red_flags: [],
                    is_suspicious: false,
                    checked_at: "2026-06-19T10:00:00Z",
                  },
                  null,
                  2
                )}
                lang="json"
              />
            </div>
          </div>

          {/* POST report */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold bg-blue-400/10 text-blue-400 border border-blue-400/20 px-2 py-1 rounded-lg">
                POST
              </span>
              <code className="text-sm text-white/70">/api/vendor/:handle/report</code>
            </div>
            <p className="text-white/40 text-sm">
              Submit a community review for a vendor. No API key required — open to all.
            </p>

            <div className="flex flex-col gap-2">
              <p className="text-xs text-white/30 uppercase tracking-widest">Request body</p>
              <CodeBlock
                code={JSON.stringify(
                  {
                    verdict: "legit | scammed",
                    comment: "string (optional, max 500 chars)",
                    platform: "instagram | whatsapp | twitter | tiktok",
                    evidence_url: "string (optional)",
                  },
                  null,
                  2
                )}
                lang="json"
              />
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-xs text-white/30 uppercase tracking-widest">Example request</p>
              <CodeBlock
                code={`curl -X POST https://Vendorfy.ng/api/vendor/zeeluxury_ng/report \\
  -H "Content-Type: application/json" \\
  -d '{"verdict":"scammed","comment":"Paid and never received my order","platform":"instagram"}'`}
                lang="bash"
              />
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-xs text-white/30 uppercase tracking-widest">Example response</p>
              <CodeBlock
                code={JSON.stringify(
                  {
                    success: true,
                    message:
                      "Review submitted successfully. Thank you for keeping the community safe.",
                    review_id: "uuid",
                  },
                  null,
                  2
                )}
                lang="json"
              />
            </div>
          </div>

          {/* GET reviews */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold bg-green-400/10 text-green-400 border border-green-400/20 px-2 py-1 rounded-lg">
                GET
              </span>
              <code className="text-sm text-white/70">/api/vendor/:handle/reviews</code>
            </div>
            <p className="text-white/40 text-sm">
              Returns paginated community reviews for a vendor.
            </p>
            <CodeBlock
              code={`curl "https://Vendorfy.ng/api/vendor/zeeluxury_ng/reviews?page=1&limit=10" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
              lang="bash"
            />
          </div>

        </Section>

        {/* Verdicts */}
        <Section title="Trust Verdicts">
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            {[
              { verdict: "mostly_legit", score: "70-100", color: "text-green-400", desc: "Strong community trust. Mostly positive reviews." },
              { verdict: "mixed", score: "40-69", color: "text-yellow-400", desc: "Mixed reviews. Proceed with caution." },
              { verdict: "high_risk", score: "0-39", color: "text-red-400", desc: "Predominantly negative reviews. Exercise significant caution." },
              { verdict: "unverified", score: "< 3 reviews", color: "text-white/40", desc: "Not enough data yet for a reliable assessment." },
              { verdict: "flagged", score: "capped at 20", color: "text-red-400", desc: "Under review by moderation team." },
            ].map((item, i, arr) => (
              <div
                key={item.verdict}
                className={`flex items-start gap-4 px-5 py-4 ${
                  i !== arr.length - 1 ? "border-b border-white/10" : ""
                }`}
              >
                <code className={`text-xs font-bold ${item.color} w-28 flex-shrink-0 mt-0.5`}>
                  {item.verdict}
                </code>
                <div className="flex flex-col gap-0.5">
                  <span className="text-white/60 text-xs">{item.score}</span>
                  <span className="text-white/30 text-xs">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Pricing */}
        <Section title="Pricing">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                name: "Free",
                price: "₦0",
                limit: "100 lookups/month",
                note: "No key needed",
                highlight: false,
              },
              {
                name: "Starter",
                price: "₦10,000",
                limit: "1,000 lookups/month",
                note: "Per month",
                highlight: true,
              },
              {
                name: "Growth",
                price: "₦35,000",
                limit: "10,000 lookups/month",
                note: "Per month",
                highlight: false,
              },
            ].map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl p-5 flex flex-col gap-2 border ${
                  tier.highlight
                    ? "bg-green-400/5 border-green-400/30"
                    : "bg-white/5 border-white/10"
                }`}
              >
                <span className={`text-sm font-bold ${tier.highlight ? "text-green-400" : "text-white"}`}>
                  {tier.name}
                </span>
                <span className="text-2xl font-bold">{tier.price}</span>
                <span className="text-white/40 text-xs">{tier.limit}</span>
                <span className="text-white/20 text-xs">{tier.note}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Get API key */}
        <Section title="Get an API Key">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
            {apiKey ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                  <CheckCircle size={16} />
                  Your API key is ready
                </div>
                <p className="text-white/40 text-xs">
                  Save this key — it will not be shown again.
                </p>
                <CodeBlock code={apiKey} lang="api key" />
              </div>
            ) : (
              <>
                <p className="text-white/40 text-sm">
                  Get a free API key instantly. No credit card required.
                </p>
                <input
                  type="text"
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  placeholder="Business or app name"
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors"
                />
                {keyError && (
                  <p className="text-red-400 text-sm">{keyError}</p>
                )}
                <button
                  onClick={requestKey}
                  disabled={requesting}
                  className="bg-green-400 hover:bg-green-300 disabled:opacity-50 text-black font-semibold py-3 rounded-xl transition-colors text-sm"
                >
                  {requesting ? "Generating..." : "Get Free API Key"}
                </button>
              </>
            )}
          </div>
        </Section>

        {/* Error codes */}
        <Section title="Error Codes">
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            {[
              { code: "400", desc: "Bad request — invalid parameters" },
              { code: "401", desc: "Unauthorized — invalid or missing API key" },
              { code: "404", desc: "Vendor not found" },
              { code: "409", desc: "Conflict — API key already exists for this email" },
              { code: "429", desc: "Rate limit exceeded — upgrade your plan" },
              { code: "500", desc: "Server error — try again" },
            ].map((item, i, arr) => (
              <div
                key={item.code}
                className={`flex items-center gap-4 px-5 py-3 ${
                  i !== arr.length - 1 ? "border-b border-white/10" : ""
                }`}
              >
                <code className="text-xs font-bold text-red-400 w-10 flex-shrink-0">
                  {item.code}
                </code>
                <span className="text-white/40 text-xs">{item.desc}</span>
              </div>
            ))}
          </div>
        </Section>

        <p className="text-white/20 text-xs text-center pb-4">
          Questions? Reach out at hello@Vendorfy.ng
        </p>

      </div>
    </main>
  );
}

