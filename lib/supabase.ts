 
import { createClient } from "@supabase/supabase-js";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Platform = "instagram" | "whatsapp" | "twitter";
export type Verdict = "legit" | "scammed";
export type Tier = "free" | "starter" | "growth" | "enterprise";

export interface Vendor {
  id: string;
  handle: string;
  platform: Platform;
  trust_score: number;
  total_reviews: number;
  flagged: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  vendor_id: string;
  verdict: Verdict;
  comment: string | null;
  evidence_url: string | null;
  ip_hash: string | null;
  created_at: string;
}

export interface ApiKey {
  id: string;
  key_hash: string;
  business_name: string;
  email: string;
  tier: Tier;
  lookups_used: number;
  lookups_limit: number;
  created_at: string;
}

export interface ApiLog {
  id: string;
  key_id: string | null;
  handle: string | null;
  endpoint: string | null;
  created_at: string;
}

// ─── Database shape (tells Supabase client what tables exist) ─────────────────

export interface Database {
  public: {
    Tables: {
      vendors: {
        Row: Vendor;
        Insert: Omit<Vendor, "id" | "created_at">;
        Update: Partial<Omit<Vendor, "id" | "created_at">>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, "id" | "created_at">;
        Update: Partial<Omit<Review, "id" | "created_at">>;
      };
      api_keys: {
        Row: ApiKey;
        Insert: Omit<ApiKey, "id" | "created_at">;
        Update: Partial<Omit<ApiKey, "id" | "created_at">>;
      };
      api_logs: {
        Row: ApiLog;
        Insert: Omit<ApiLog, "id" | "created_at">;
        Update: Partial<Omit<ApiLog, "id" | "created_at">>;
      };
    };
  };
}

// ─── Clients ──────────────────────────────────────────────────────────────────

// Browser client — for client components (uses anon key)
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server client — for API routes (uses service role key, bypasses RLS)
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
