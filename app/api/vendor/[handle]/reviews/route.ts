import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

type Vendor = {
  id: string;
  handle: string;
  platform: string | null;
  trust_score: number | null;
  total_reviews: number | null;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle: rawHandle } = await params;
    const handle = rawHandle.toLowerCase().trim();

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Math.min(
      Number(searchParams.get("limit") ?? 10),
      50
    );
    const offset = (page - 1) * limit;

    const { data: vendor } = await supabaseAdmin
      .from("vendors")
      .select(
        "id, handle, platform, trust_score, total_reviews"
      )
      .ilike("handle", handle)
      .maybeSingle<Vendor>();

    if (!vendor) {
      return NextResponse.json({
        handle,
        platform: "unknown",
        trust_score: 0,
        reviews: [],
        pagination: {
          total: 0,
          page,
          limit,
          pages: 0,
        },
        warning:
          "Vendor not found in DB — returning empty dataset",
      });
    }

    const { data: reviews, count } = await supabaseAdmin
      .from("reviews")
      .select(
        "id, verdict, comment, evidence_url, created_at",
        { count: "exact" }
      )
      .eq("vendor_id", vendor.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    return NextResponse.json({
      handle: vendor.handle,
      platform: vendor.platform,
      trust_score: vendor.trust_score,
      reviews: reviews ?? [],
      pagination: {
        total: count ?? 0,
        page,
        limit,
        pages: Math.ceil((count ?? 0) / limit),
      },
    });
  } catch (err) {
    console.error("[GET /api/vendor/reviews]", err);

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}