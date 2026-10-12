import { redirect } from "next/navigation";
import { hasBackofficeAccess } from "@/modules/backoffice/services/access";
import { BackofficeShell } from "@/modules/backoffice/components/shell";
import { JobManager } from "@/modules/jobs/components/job-manager";
import { getBackofficeJobs } from "@/modules/jobs/services/jobs";
export default async function JobsPage() {
  if (!(await hasBackofficeAccess())) redirect("/backoffice/login");
  return <BackofficeShell><JobManager initialData={await getBackofficeJobs()} /></BackofficeShell>;
}
