import { Root, Portal, Content, Close, Overlay } from "@radix-ui/react-dialog";
import Image from "next/image";
import * as AI from "react-icons/ai";

import styles from "./styles.module.scss";
import { IProject } from "@/interfaces";

interface ProjectModalProps {
  open: boolean;
  project: IProject;
  onToogleOpen: () => void;
}

export function ProjectModal({
  open,
  onToogleOpen,
  project,
}: ProjectModalProps) {
  console.log(project);

  return (
    <Root open={open} onOpenChange={onToogleOpen}>
      <Portal>
        <Overlay className={styles.overlay} />

        <Content className={styles.content}>
          <div className={styles.projectInfo}>
            <Close asChild>
              <header>
                <button>
                  <AI.AiOutlineArrowLeft />
                  voltar para os projetos
                </button>
              </header>
            </Close>

            <Image  
              src={project?.image?.url} 
              alt={project.name}
              width={300}
              height={0}
            />

            <div>
              <strong>{project?.name}</strong>
              <small>Detalhes</small>
              <p>{project?.description}</p>

              <ul>
                {project?.languages?.map((lang) => (
                  <li key={lang.id}>{lang.name}</li>
                ))}
              </ul>
            </div>
          </div>

          <footer>
            <a href={project?.repository} target="_blank" rel="noreferrer">Repositorio</a>
            <a href={project?.address} target="_blank" rel="noreferrer">Visitar</a>
          </footer>
        </Content>
      </Portal>
    </Root>
  );
}
