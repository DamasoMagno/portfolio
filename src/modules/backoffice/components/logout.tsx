"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
export function Logout() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  return <div><Button disabled={loading} className="rounded-full bg-transparent text-text-secondary hover:bg-white/5" onClick={async () => { setLoading(true); setError(""); try { const response = await fetch("/api/backoffice/session", { method: "DELETE" }); if (!response.ok) throw new Error(); router.push("/backoffice/login"); router.refresh(); } catch { setError("Não foi possível sair."); } finally { setLoading(false); } }}><LogOut size={16} />Sair</Button>{error && <p role="alert" className="text-xs text-red-300">{error}</p>}</div>;
}
