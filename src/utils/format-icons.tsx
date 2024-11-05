import * as Bi from "react-icons/bi";
import {
  BiLogoGithub,
  BiLogoGraphql,
  BiLogoJavascript,
  BiLogoNodejs,
  BiLogoReact,
  BiLogoTailwindCss,
  BiLogoTypescript,
} from "react-icons/bi";
import { SiNextdotjs, SiFastify, SiExpress } from "react-icons/si";

export const icons = {
  languages: {
    html: {
      icon: <Bi.BiLogoHtml5 size={64} />,
      name: "HTML"
    },
    css: {
      icon: <Bi.BiLogoCss3 size={64} />,
      name: "CSS"
    },
    javascript: {
      icon: <BiLogoJavascript size={64} />,
      name: "JavaScript",
    },
    typescript: {
      icon: <BiLogoTypescript size={64} />,
      name: "Typescript",
    },
    git: {
      icon: <BiLogoGithub size={64} />,
      name: "Git",
    },
    react: {
      icon: <BiLogoReact size={64} />,
      name: "React",
    },
    next: {
      icon: <SiNextdotjs size={64} />,
      name: "Next",
    },
    react_native: {
      icon: <BiLogoReact size={64} />,
      name: "React Native",
    },
    tailwind: {
      icon: <BiLogoTailwindCss size={64} />,
      name: "Tailwind",
    },
    node: {
      icon: <BiLogoNodejs size={64} />,
      name: "Node.js",
    },
    express: {
      icon: <SiExpress size={64} />,
      name: "Express",
    },
    fastify: {
      icon: <SiFastify size={64} />,
      name: "Fastify",
    },
    postgres: {
      icon: <Bi.BiLogoPostgresql size={64} />,
      name: "Postgres",
    },
    graphql: {
      icon: <BiLogoGraphql size={64} />,
      name: "Graphql",
    },
  },
  netwoks: [
    {
      name: "GitHub",
      icon: Bi.BiLogoGithub
    },
    {
      name: "WhatsApp",
      icon: Bi.BiLogoWhatsapp
    },
    {
      name: "Instagram",
      icon: Bi.BiLogoInstagram
    },
    {
      name: "LinkedIn",
      icon: Bi.BiLogoLinkedin
    },
    {
      name: "Gmail",
      icon: Bi.BiLogoGmail
    },
  ],
}


