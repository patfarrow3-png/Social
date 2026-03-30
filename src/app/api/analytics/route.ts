import { NextRequest, NextResponse } from "next/server";
import { fetchAnalytics } from "@/lib/metricool";
import { format, subDays } from "date-fns";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Default to last 30 days if params not supplied
  const today = new Date();
  const start = searchParams.get("start") ?? format(subDays(today, 29), "yyyy-MM-dd");
  const end = searchParams.get("end") ?? format(today, "yyyy-MM-dd");

  try {
    const data = await fetchAnalytics(start, end);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (err) {
    console.error("[api/analytics]", err);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
