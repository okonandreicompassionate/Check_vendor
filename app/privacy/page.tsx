 "use client";

import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      <div className="text-white/50 text-sm leading-relaxed flex flex-col gap-2">
        {children}
      </div>
    </div>
  );
}

export default function PrivacyPage() {
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
          <span className="font-bold text-sm">CheckVendor</span>
        </div>
        <div className="w-16" />
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col gap-10">

        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-white/30 text-xs">Last updated: June 2026</p>
          <p className="text-white/50 text-sm leading-relaxed mt-2">
            CheckVendor is a community-powered vendor trust platform. We take
            your privacy seriously. This policy explains what data we collect,
            why we collect it, and how you can control it. We comply with the
            Nigeria Data Protection Regulation (NDPR) and applicable data
            protection laws.
          </p>
        </div>

        {/* Who we are */}
        <Section title="1. Who We Are">
          <p>
            CheckVendor is an online platform that allows users to search for
            and submit reviews about vendors operating on social media platforms
            including Instagram, TikTok, WhatsApp, and Twitter/X. We operate
            the website at checkvendor.ng and provide an API for developers and
            businesses.
          </p>
          <p>
            For data-related enquiries, contact us at: privacy@checkvendor.ng
          </p>
        </Section>

        {/* What we collect */}
        <Section title="2. What Data We Collect">
          <p>We collect only what is necessary to operate the platform:</p>
          <div className="flex flex-col gap-3 mt-1">
            {[
              {
                title: "Community reviews",
                desc: "When you submit a review, we store your verdict (legit/scammed), your optional comment, and an optional evidence URL. Reviews are anonymous — we do not store your name or identity.",
              },
              {
                title: "Hashed IP addresses",
                desc: "To prevent spam and abuse, we store a one-way hash of your IP address when you submit a review. This hash cannot be reversed to identify you. It is used only to enforce submission limits (max 3 reviews per vendor per IP).",
              },
              {
                title: "API key registrations",
                desc: "If you request an API key, we collect your business name and email address. We store a hashed version of your API key — never the raw key itself.",
              },
              {
                title: "API usage logs",
                desc: "We log API calls (endpoint, vendor handle queried, timestamp) for billing, rate limiting, and abuse prevention. Logs are retained for 90 days.",
              },
              {
                title: "Vendor handles",
                desc: "When a vendor is searched, we create a record of their handle and platform. This is publicly available information. We do not store personal information about vendors beyond their public handle.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-1"
              >
                <span className="text-white/80 text-xs font-semibold">
                  {item.title}
                </span>
                <span className="text-white/40 text-xs leading-relaxed">
                  {item.desc}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* What we don't collect */}
        <Section title="3. What We Do NOT Collect">
          <p>We want to be explicit about what we do not do:</p>
          <ul className="flex flex-col gap-1.5 mt-1">
            {[
              "We do not collect your name, phone number, or email when you submit a review",
              "We do not track you across websites or use advertising cookies",
              "We do not sell your data to third parties",
              "We do not store raw API keys — only a one-way hash",
              "We do not scrape or store personal data about vendors from external platforms",
              "We do not use your data for profiling or automated decision-making about you personally",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-white/40">
                <span className="text-green-400 mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </Section>

        {/* How we use data */}
        <Section title="4. How We Use Your Data">
          <p>We use the data we collect for the following purposes:</p>
          <ul className="flex flex-col gap-1.5 mt-1">
            {[
              "To calculate and display vendor trust scores",
              "To prevent spam and abuse on the platform",
              "To enforce API rate limits and billing",
              "To send your API key to your email (one-time only)",
              "To improve the accuracy of our trust scoring model",
              "To detect coordinated fake review activity",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-white/40">
                <span className="text-white/20 mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </Section>

        {/* Community reviews */}
        <Section title="5. Community Reviews and Vendor Data">
          <p>
            Reviews submitted on CheckVendor are community opinions. They
            reflect the personal experiences of individual users and do not
            represent the views of CheckVendor.
          </p>
          <p>
            Vendor handles are publicly available social media identifiers. By
            searching a vendor, a public record is created on our platform.
            Vendors may request removal of their record if it contains
            inaccurate information by contacting us at privacy@checkvendor.ng.
          </p>
          <p>
            We reserve the right to remove reviews that violate our community
            guidelines, including reviews that are false, defamatory, or
            submitted in bad faith.
          </p>
        </Section>

        {/* Data sharing */}
        <Section title="6. Data Sharing">
          <p>
            We do not sell, rent, or trade your personal data. We may share
            data only in the following limited circumstances:
          </p>
          <ul className="flex flex-col gap-1.5 mt-1">
            {[
              "With Supabase (our database provider) — data is stored on their infrastructure under their data processing agreement",
              "With law enforcement if required by Nigerian law or a valid court order",
              "In anonymised, aggregated form for platform statistics (e.g. total reviews submitted)",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-white/40">
                <span className="text-white/20 mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </Section>

        {/* Your rights */}
        <Section title="7. Your Rights (NDPR)">
          <p>
            Under the Nigeria Data Protection Regulation, you have the
            following rights:
          </p>
          <div className="flex flex-col gap-2 mt-1">
            {[
              {
                right: "Right to access",
                desc: "Request a copy of any personal data we hold about you.",
              },
              {
                right: "Right to erasure",
                desc: "Request deletion of your data. For reviews, note that they are anonymous — we cannot identify which reviews belong to you without additional information.",
              },
              {
                right: "Right to correction",
                desc: "Request correction of inaccurate data we hold about you.",
              },
              {
                right: "Right to object",
                desc: "Object to how we process your data in certain circumstances.",
              },
            ].map((item) => (
              <div
                key={item.right}
                className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-1"
              >
                <span className="text-white/80 text-xs font-semibold">
                  {item.right}
                </span>
                <span className="text-white/40 text-xs leading-relaxed">
                  {item.desc}
                </span>
              </div>
            ))}
          </div>
          <p>
            To exercise any of these rights, contact us at
            privacy@checkvendor.ng. We will respond within 30 days.
          </p>
        </Section>

        {/* Data retention */}
        <Section title="8. Data Retention">
          <ul className="flex flex-col gap-1.5">
            {[
              "Community reviews — retained indefinitely to maintain trust scores, unless removal is requested",
              "Hashed IP addresses — retained for 90 days then deleted",
              "API keys — retained until you request deletion",
              "API logs — retained for 90 days then automatically deleted",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-white/40">
                <span className="text-white/20 mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </Section>

        {/* Security */}
        <Section title="9. Security">
          <p>
            We take reasonable technical measures to protect your data
            including encrypted connections (HTTPS), hashed API keys and IP
            addresses, Row Level Security on our database, and service role
            keys that are never exposed to the browser.
          </p>
          <p>
            No system is 100% secure. If you discover a security vulnerability,
            please report it responsibly to security@checkvendor.ng.
          </p>
        </Section>

        {/* Cookies */}
        <Section title="10. Cookies">
          <p>
            CheckVendor does not use advertising cookies or tracking pixels. We
            may use essential session cookies required for the platform to
            function. We do not use Google Analytics or any third-party
            analytics that track you across sites.
          </p>
        </Section>

        {/* Changes */}
        <Section title="11. Changes to This Policy">
          <p>
            We may update this policy as the platform evolves. We will update
            the date at the top of this page when changes are made. Continued
            use of CheckVendor after changes constitutes acceptance of the
            updated policy.
          </p>
        </Section>

        {/* Contact */}
        <Section title="12. Contact">
          <p>
            For any privacy-related questions, requests, or complaints contact
            us at privacy@checkvendor.ng. We aim to respond within 30 days.
          </p>
        </Section>

        <p className="text-white/20 text-xs text-center pb-4 border-t border-white/10 pt-8">
          CheckVendor — Keeping Nigerian commerce safer, one review at a time.
        </p>

      </div>
    </main>
  );
}

