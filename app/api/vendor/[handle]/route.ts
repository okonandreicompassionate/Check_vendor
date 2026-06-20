import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { ai } from "@/lib/ai/provider";
import { calculateScore } from "@/lib/score";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle: rawHandle } = await params;
    const handle = rawHandle.toLowerCase().trim();
    const keyId = request.headers.get("x-api-key-id");

    // Find or create vendor
    let { data: vendor } = await supabaseAdmin
      .from("vendors")
      .select("*")
      .eq("handle", handle)
      .single();

    if (!vendor) {
      const { data: newVendor } = await supabaseAdmin
        .from("vendors")
        .insert({
          handle,
          platform: "instagram",
          trust_score: 0,
          total_reviews: 0,
          flagged: false,
        })
        .select()
        .single();

      vendor = newVendor;
    }

    if (!vendor) {
      return NextResponse.json(
        { error: "Could not find or create vendor." },
        { status: 500 }
      );
    }

    // Fetch reviews
    const { data: reviews } = await supabaseAdmin
      .from("reviews")
      .select("*")
      .eq("vendor_id", vendor.id)
      .order("created_at", { ascending: false });

    const allReviews = reviews ?? [];
    const reviewTexts = allReviews
      .map((r) => r.comment)
      .filter(Boolean) as string[];

    // Run AI analysis
    const [sentiment, fakeDetection] = await Promise.all([
      ai.analyzeSentiment(reviewTexts),
      ai.detectFakeReviews(allReviews),
    ]);

    // Calculate score
    const breakdown = calculateScore(
      allReviews,
      sentiment,
      fakeDetection,
      vendor.flagged
    );

    // Update vendor score in DB
    await supabaseAdmin
      .from("vendors")
      .update({
        trust_score: breakdown.trust_score,
        total_reviews: breakdown.total_reviews,
      })
      .eq("id", vendor.id);

    // Log the lookup
    await supabaseAdmin.from("api_logs").insert({
      key_id: keyId,
      handle,
      endpoint: "GET /api/vendor",
    });

    // Increment paid key usage
    if (keyId) {
      await supabaseAdmin.rpc("increment_lookups", { key_id: keyId });
    }

    // Response
    return NextResponse.json({
      handle: vendor.handle,
      platform: vendor.platform,
      trust_score: breakdown.trust_score,
      verdict: breakdown.verdict,
      total_reviews: breakdown.total_reviews,
      legit_count: breakdown.legit_count,
      scam_count: breakdown.scam_count,
      summary: breakdown.summary,
      sources: breakdown.sources,
      advice: breakdown.advice,
      red_flags: breakdown.red_flags,
      is_suspicious: breakdown.is_suspicious,
      checked_at: new Date().toISOString(),
    });

  } catch (err) {
    console.error("[GET /api/vendor]", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}