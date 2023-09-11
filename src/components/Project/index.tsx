import { ComponentProps } from "react";
import Image from "next/image";
import * as AI from "react-icons/ai";

import styles from "./styles.module.scss";
import { IProject } from "@/interfaces";

interface ProjectProps extends ComponentProps<"button"> {
  project: IProject;
}

export function Project({ project, ...props }: ProjectProps) {
  return (
    <div className={styles.project}>
      <div>
        <Image
          src={project.image?.url}
          alt={project.name}
          width={300}
          height={0}
        />
        <strong>{project.name}</strong>
        <p>{project.resume}</p>
      </div>

      <button {...props}>
        Visualizar
        <AI.AiOutlineArrowRight />
      </button>
    </div>
  );
}
