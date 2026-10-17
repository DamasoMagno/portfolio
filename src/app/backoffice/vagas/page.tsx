import { redirect } from "next/navigation";
import { hasBackofficeAccess } from "@/modules/backoffice/services/access";
import { BackofficeShell } from "@/modules/backoffice/components/shell";
import { JobManager } from "@/modules/jobs/components/job-manager";
import { getJobDiscovery } from "@/modules/jobs/services/discovery";
import { jobAIAvailable } from "@/modules/jobs/services/ai-analysis";
export default async function JobsPage() {
  if (!(await hasBackofficeAccess())) redirect("/backoffice/login");
  const { data, skills } = await getJobDiscovery();
  return <BackofficeShell><JobManager aiAvailable={jobAIAvailable()} cronConfigured={(process.env.CRON_SECRET?.length ?? 0) >= 32 && process.env.VERCEL_ENV === "production"} initialData={data} initialSkills={skills} /></BackofficeShell>;
}
