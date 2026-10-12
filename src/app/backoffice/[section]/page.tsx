import { notFound, redirect } from "next/navigation";
import { BackofficeShell } from "@/modules/backoffice/components/shell";
import { hasBackofficeAccess } from "@/modules/backoffice/services/access";
import { getBackofficeContent } from "@/modules/content/services/content";
import { ProfileManager } from "@/modules/content/components/profile-manager";
import { ResumeManager } from "@/modules/resume/components/resume-manager";
import { CollectionManager } from "@/modules/content/components/collection-manager";
import { MessageManager } from "@/modules/messages/components/message-manager";
import type { ContentResource } from "@/modules/content/schemas/content";
const resources: Record<string, ContentResource> = { servicos: "services", projetos: "projects", habilidades: "skills", experiencias: "experiences", recomendacoes: "recommendations" };
export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  if (!(await hasBackofficeAccess())) redirect("/backoffice/login");
  if (!resources[(await params).section] && !["perfil", "mensagens", "curriculo"].includes((await params).section)) notFound();
  const initialData = await getBackofficeContent();
  return <BackofficeShell>{(await params).section === "curriculo" ? <ResumeManager initialData={initialData} /> : (await params).section === "perfil" ? <ProfileManager initialData={initialData} /> : (await params).section === "mensagens" ? <MessageManager initialData={initialData} /> : <CollectionManager resource={resources[(await params).section]} initialData={initialData} />}</BackofficeShell>;
}
