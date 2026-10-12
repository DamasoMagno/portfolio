import { ImageResponse } from "next/og";
import { publicContent } from "../services/content";
import { seoText } from "@/lib/site";

export async function portfolioSocialImage() {
  const { profile, skills } = await publicContent();
  const technologies = Array.from(new Set(skills.flatMap(skill => skill.tags))).slice(0, 8).join(" · ");
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 72, backgroundColor: "#121214", color: "#e1e1e6" }}>
    <div style={{ fontSize: 24, color: "#a78bfa", marginBottom: 24 }}>{seoText(profile.headline, 80)}</div>
    <div style={{ fontSize: profile.name.length > 25 ? 48 : 72, fontWeight: 700, lineHeight: 1.1 }}>{seoText(profile.name, 70)}</div>
    <div style={{ marginTop: 28, fontSize: 26, color: "#a8a8b3", lineHeight: 1.4 }}>{seoText(technologies || profile.intro, 130)}</div>
  </div>, { width: 1200, height: 630 });
}
