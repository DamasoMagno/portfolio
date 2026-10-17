import { timingSafeEqual, createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { syncDiscoveredJobs } from "@/modules/jobs/services/discovery";
export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";
const digest = (value: string) => createHash("sha256").update(value).digest();
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 32) return NextResponse.json({ error: "Agendamento não configurado." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  if (!timingSafeEqual(digest(request.headers.get("authorization") ?? ""), digest(`Bearer ${secret}`))) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  try {
    const { message } = await syncDiscoveredJobs("automatic");
    return NextResponse.json({ ok: true, message }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Não foi possível atualizar as vagas." }, { status: 503, headers: { "Cache-Control": "no-store" } }); }
}
