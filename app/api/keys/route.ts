import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { z } from "zod";

const KeySchema = z.object({
  business_name: z.string().min(2).max(100),
  email: z.string().email(),
  tier: z.enum(["free", "starter", "growth"]).default("free"),
});

const TIER_LIMITS: Record<string, number> = {
  free: 100,
  starter: 1000,
  growth: 10000,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = KeySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { business_name, email, tier } = parsed.data;

    // ── Check if email already has a key ─────────────────────────────────
    const { data: existing } = await supabaseAdmin
      .from("api_keys")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "An API key already exists for this email." },
        { status: 409 }
      );
    }

    // ── Generate raw key (shown to user once) ─────────────────────────────
    const rawKey = `cv_${randomBytes(32).toString("hex")}`;
    const keyHash = createHash("sha256").update(rawKey).digest("hex");

    // ── Store hashed key ──────────────────────────────────────────────────
    const { error } = await supabaseAdmin.from("api_keys").insert({
      key_hash: keyHash,
      business_name,
      email,
      tier,
      lookups_used: 0,
      lookups_limit: TIER_LIMITS[tier],
    });

    if (error) {
      return NextResponse.json(
        { error: "Could not generate API key." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      api_key: rawKey,
      message: "Save this key — it will not be shown again.",
      tier,
      lookups_limit: TIER_LIMITS[tier],
    });

  } catch (err) {
    console.error("[POST /api/keys]", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
} 
