import { BackofficeShell } from "@/modules/backoffice/components/shell";
import { requireBackofficeAccess } from "@/modules/backoffice/services/access";
import { redirect } from "next/navigation";
import { hasBackofficeAccess } from "@/modules/backoffice/services/access";
import { getBackofficeContent } from "@/modules/content/services/content";
import { ContentDashboard } from "@/modules/content/components/dashboard";
export default async function BackofficePage() {
  if (!(await hasBackofficeAccess())) redirect("/backoffice/login");
  await requireBackofficeAccess();
  const content = await getBackofficeContent();
  return <BackofficeShell><ContentDashboard content={content} /></BackofficeShell>;
}
