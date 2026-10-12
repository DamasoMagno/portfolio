import { NextResponse } from "next/server";
import { hasBackofficeAccess } from "@/modules/backoffice/services/access";
import { getAnalyticsReport } from "@/modules/analytics/services/analytics";
export async function GET(request: Request) {
  if (!(await hasBackofficeAccess())) return NextResponse.json({ error: "Acesso administrativo necessário." }, { status: 401 });
  const requested = Number(new URL(request.url).searchParams.get("days"));
  const days = [7, 30, 90].includes(requested) ? requested : 30;
  return NextResponse.json(await getAnalyticsReport(days), { headers: { "Cache-Control": "no-store" } });
}
