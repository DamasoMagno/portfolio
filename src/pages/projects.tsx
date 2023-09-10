import { GetServerSideProps } from "next";
import { useEffect, useRef, useState } from "react";
import { client } from "@/libs/apollo";
import { MdSearch } from "react-icons/md";

import { LanguagesQuery } from "@/graphql/queries/languages";
import { ProjectsQuery } from "@/graphql/queries/projects";
import { ILanguage, IProject } from "@/interfaces";

import { Header } from "@/components/Header";
import { ProjectModal } from "@/components/ProjectModal";
import { Project } from "@/components/Project";

import styles from "@/styles/pages/Projects.module.scss";

interface ProjectProps {
  languages: ILanguage[];
}

export default function Projects({ languages }: ProjectProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setModalOpen] = useState<boolean>(false);

  const [projects, setProjects] = useState<IProject[]>([]);
  const [project, setProject] = useState({} as IProject);

  useEffect(() => {
    client
      .query({
        query: ProjectsQuery,
      })
      .then(({ data }) => setProjects(data.projects));
  }, []);

  function selectProjectToShowOnModal(project: IProject) {
    setProject(project);
    setModalOpen(true);
  }

  async function filterProjects() {
    try {
      const { data } = await client.query({
        query: ProjectsQuery,
        variables: {
          name: inputRef.current?.value,
        },
      });
  
      setProjects(data.projects);
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <Header />

      <main className={styles.wrapper}>
        <section className={styles.filters}>
          <div className={styles.search}>
            <input placeholder="Buscar projeto" ref={inputRef} />
            <button onClick={filterProjects}>
              <MdSearch />
            </button>
          </div>

          <div className={styles.languages}>
            {languages.map((language) => {
              return <button key={language.id}>{language.name}</button>;
            })}
          </div>
        </section>

        <div className={styles.projects}>
          {projects.map((project) => (
            <Project
              key={project.id}
              onClick={() => selectProjectToShowOnModal(project)}
              project={project}
            />
          ))}
        </div>
      </main>

      <ProjectModal
        open={open}
        onToogleOpen={() => setModalOpen(!open)}
        project={project}
      />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const { data } = await client.query({
    query: LanguagesQuery,
  });

  const languages: ILanguage[] = data.languages;

  return {
    props: {
      languages,
    },
  };
};
