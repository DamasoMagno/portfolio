import { redirect } from "next/navigation";
import { authenticationConfigured, hasBackofficeAccess } from "@/modules/backoffice/services/access";
import { Login } from "@/modules/backoffice/components/login";
export default async function LoginPage() {
  if (await hasBackofficeAccess()) redirect("/backoffice");
  return <Login configured={authenticationConfigured()} />;
}
