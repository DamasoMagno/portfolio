import { ComponentProps, FC } from "react";
import * as Bi from "react-icons/bi";

import styles from "./styles.module.scss";
import { IProject } from "@/interfaces";

interface ProjectProps extends ComponentProps<"button"> {
  project: IProject;
}

export function Project({ project, ...props }: ProjectProps){
  return (
    <div className={styles.project}>
      <img src={project.image?.url} />
      <strong>{project.name}</strong>
      <p>{project.description}</p>

      <button {...props}>
        Visualizar
        <Bi.BiArrowToRight />
      </button>
    </div>
  );
};
