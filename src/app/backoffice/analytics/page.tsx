import { redirect } from "next/navigation";
import { hasBackofficeAccess } from "@/modules/backoffice/services/access";
import { BackofficeShell } from "@/modules/backoffice/components/shell";
import { AnalyticsDashboard } from "@/modules/analytics/components/dashboard";
import { getAnalyticsReport } from "@/modules/analytics/services/analytics";
export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  if (!(await hasBackofficeAccess())) redirect("/backoffice/login");
  const requested = Number((await searchParams).days);
  const days = [7, 30, 90].includes(requested) ? requested : 30;
  const report = await getAnalyticsReport(days);
  return <BackofficeShell><AnalyticsDashboard report={report} enabled={process.env.ANALYTICS_ENABLED !== "false"} /></BackofficeShell>;
}
