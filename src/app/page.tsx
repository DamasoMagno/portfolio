import { ServicesSection } from "@/modules/services/components/services-section";
import { publicPosts } from "@/modules/posts/services/posts";
import { PostsSection } from "@/modules/posts/components/post-cards";
import { AnalyticsTracker } from "@/modules/analytics/components/tracker";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Skills } from "@/components/Skills";
import { Projects } from "@/components/Projects";
import { Experience } from "@/components/Experience";
import { Recommendations } from "@/components/Recommendations";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

import { publicContent } from "@/modules/content/services/content";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [content, blog] = await Promise.all([publicContent(), publicPosts()]);
  return (
    <main className="min-h-screen bg-[#121214] relative overflow-hidden">
      {process.env.ANALYTICS_ENABLED !== "false" && <AnalyticsTracker />}
      <Header profile={content.profile} showPosts={blog.enabled} showServices={content.services.length > 0} />
      <Hero profile={content.profile} />
      <About paragraphs={content.profile.about} />
      <Projects projects={content.projects} />
      <Skills skillCategories={content.skills} />
      <ServicesSection services={content.services} />
      {blog.enabled && <PostsSection posts={blog.posts} />}
      <Experience experiences={content.experiences} />
      <Recommendations courses={content.recommendations} />
      <Contact profile={content.profile} />
      <Footer name={content.profile.name} />
    </main>
  );
}
