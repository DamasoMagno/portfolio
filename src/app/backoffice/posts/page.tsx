import { redirect } from "next/navigation";
import { hasBackofficeAccess } from "@/modules/backoffice/services/access";
import { BackofficeShell } from "@/modules/backoffice/components/shell";
import { getBackofficePosts } from "@/modules/posts/services/posts";
import { PostManager } from "@/modules/posts/components/post-manager";
export default async function PostsPage() {
  if (!(await hasBackofficeAccess())) redirect("/backoffice/login");
  return <BackofficeShell><PostManager initialData={await getBackofficePosts()} /></BackofficeShell>;
}
