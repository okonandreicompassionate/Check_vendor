import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isApiRoute =
    pathname.startsWith("/api/vendor") ||
    pathname.startsWith("/api/keys");

  if (!isApiRoute) return NextResponse.next();

  if (pathname.includes("/report") && request.method === "POST") {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");
  const apiKey = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!apiKey) {
    const response = NextResponse.next();
    response.headers.set("x-tier", "free");
    response.headers.set(
      "x-ip",
      request.headers.get("x-forwarded-for") ?? "unknown"
    );
    return response;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const res = await fetch(
    `${supabaseUrl}/rest/v1/api_keys?select=id,tier,lookups_used,lookups_limit`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "x-raw-key": apiKey,
      },
    }
  );

  const keys = await res.json();

  if (!keys || keys.length === 0) {
    return NextResponse.json(
      { error: "Invalid API key." },
      { status: 401 }
    );
  }

  const key = keys[0];

  if (key.lookups_used >= key.lookups_limit) {
    return NextResponse.json(
      {
        error: "Monthly lookup limit reached.",
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