"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DiscoverySkillGroup as SkillGroup } from "../schemas/discovery";
import type { JobsDocument } from "../schemas/job";
import { nextDiscoveryAt } from "../services/discovery-matching";

export function useJobDiscovery(document: JobsDocument, initialSkills: SkillGroup[], onChange: (document: JobsDocument) => void) {
  const [skills, setSkills] = useState(initialSkills), [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState({ text: "", error: false });
  const inFlight = useRef(false), automaticAttempt = useRef("");
  const update = useRef(onChange); update.current = onChange;
  const request = useCallback(async (action?: Record<string, unknown>) => {
    if (inFlight.current) return null;
    inFlight.current = true; setBusy(true); setFeedback({ text: "", error: false });
    try {
      const response = await fetch("/api/backoffice/jobs/discovery", action ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(action) } : { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 409) {
          const refreshed = await fetch("/api/backoffice/jobs/discovery", { cache: "no-store" });
          if (refreshed.ok) { const current = await refreshed.json(); update.current(current.data); setSkills(current.skills); }
        }
        throw new Error(result.error ?? "Não foi possível consultar as vagas.");
      }
      update.current(result.data); setSkills(result.skills);
      setFeedback({ text: result.message ?? "Resultados atualizados.", error: false });
      return result as { data: JobsDocument; importedId?: string };
    } catch (error) { setFeedback({ text: error instanceof Error ? error.message : "Não foi possível consultar as vagas.", error: true }); return null; }
    finally { inFlight.current = false; setBusy(false); }
  }, []);
  useEffect(() => {
    if (!document.discovery.settings.automatic || !skills.length) return;
    // Opening the private screen also updates an overdue cache, without requiring cron setup.
    const attempt = document.discovery.settings.sources.map(source => `${source}:${document.discovery.sourceStatus[source].lastAttemptAt ?? ""}`).join("|");
    if (Date.now() >= nextDiscoveryAt(document.discovery) && automaticAttempt.current !== attempt) {
      automaticAttempt.current = attempt; void request({ action: "automatic-sync" });
    }
  }, [document.discovery, request, skills.length]);
  return { skills, busy, feedback, request };
}
