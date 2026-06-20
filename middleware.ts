import { NextRequest, NextResponse } from "next/server";

const TIER_LIMITS: Record<string, number> = {
  free: 100,
  starter: 1000,
  growth: 10000,
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isApiRoute = pathname.startsWith("/api/vendor") || pathname.startsWith("/api/keys");
  if (!isApiRoute) return NextResponse.next();

  // Allow review submissions through without a key
  if (pathname.includes("/report") && request.method === "POST") {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");
  const apiKey = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  // No API key — free tier, pass through
  if (!apiKey) {
    const response = NextResponse.next();
    response.headers.set("x-tier", "free");
    response.headers.set(
      "x-ip",
      request.headers.get("x-forwarded-for") ?? "unknown"
    );
    return response;
  }

  // Has API key — look up in Supabase via fetch (no crypto in edge runtime)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const res = await fetch(
    `${supabaseUrl}/rest/v1/api_keys?select=id,tier,lookups_used,lookups_limit`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        // pass raw key in a custom header — hashing happens in the route handler
        "x-raw-key": apiKey,
      },
    }
  );

  const keys = await res.json();

  if (!keys || keys.length === 0) {
    return NextResponse.json({ error: "Invalid API key." }, { status: 401 });
  }

  const key = keys[0];

  if (key.lookups_used >= key.lookups_limit) {
    return NextResponse.json(
      {
        error: "Monthly lookup limit reached. Upgrade at checkvendor.ng/pricing.",
        lookups_used: key.lookups_used,
        lookups_limit: key.lookups_limit,
      },
      { status: 429 }
    );
  }

  const response = NextResponse.next();
  response.headers.set("x-api-key-id", key.id);
  response.headers.set("x-tier", key.tier);
  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};