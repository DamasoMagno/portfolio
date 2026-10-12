import { NextResponse } from "next/server";
import { publicContent } from "@/modules/content/services/content";
export const dynamic = "force-dynamic";
export async function GET() {
  try { return NextResponse.json({ data: await publicContent() }, { headers: { "Cache-Control": "no-store" } }); }
  catch { return NextResponse.json({ error: "Não foi possível carregar o portfólio." }, { status: 503 }); }
}
