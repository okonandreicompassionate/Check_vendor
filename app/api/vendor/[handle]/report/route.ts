import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { z } from "zod";

const ReportSchema = z.object({
  verdict: z.enum(["legit", "scammed"]),
  comment: z.string().max(500).optional(),
  evidence_url: z.string().url().optional(),
  platform: z.enum(["instagram", "whatsapp", "twitter", "tiktok"]).default("instagram"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle: rawHandle } = await params;
    const handle = rawHandle.toLowerCase().trim();
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const ipHash = createHash("sha256").update(ip).digest("hex");

    const body = await request.json();
    const parsed = ReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { verdict, comment, evidence_url, platform } = parsed.data;

    const { data: existing } = await supabaseAdmin
      .from("reviews")
      .select("id")
      .eq("ip_hash", ipHash);

    if ((existing?.length ?? 0) >= 3) {
      return NextResponse.json(
        { error: "You have already submitted the maximum number of reviews for this vendor." },
        { status: 429 }
      );
    }

    let { data: vendor } = await supabaseAdmin
  .from("vendors")
  .select("*")
  .eq("handle", handle)
  .single() as { data: any };

    if (!vendor) {
  const { data: newVendor } = await supabaseAdmin
  .from("vendors")
  .insert({
    handle,
    platform,
    trust_score: 0,
    total_reviews: 0,
    flagged: false,
  } as any)
  .select()
  .single() as { data: any };

      vendor = newVendor;
    }

    if (!vendor) {
      return NextResponse.json(
        { error: "Could not find or create vendor." },
        { status: 500 }
      );
    }

    const { data: review, error } = await supabaseAdmin
      .from("reviews")
      .insert({
        vendor_id: vendor.id,
        verdict,
        comment: comment ?? null,
        evidence_url: evidence_url ?? null,
        ip_hash: ipHash,
      } as any)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Could not submit review." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Review submitted successfully. Thank you for keeping the community safe.",
      review_id: review.id,
    });

  } catch (err) {
    console.error("[POST /api/vendor/report]", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}