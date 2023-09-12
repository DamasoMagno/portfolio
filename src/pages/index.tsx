import { GetStaticProps } from "next";

import { icons } from "@/utils/format-icons";
import { verifyDateIsCurrent } from "@/utils/verify-date-is-valid";

import { IAuthor, IExperiencie } from "@/interfaces";
import { AuthorQuery } from "@/graphql/queries/author";
import { client } from "@/libs/apollo";

import { Header } from "@/components/Header";

import styles from "@/styles/pages/Home.module.scss";
import { ContactForm } from "@/components/ContactForm";
import Head from "next/head";

interface HomeProps {
  author: IAuthor;
}

export default function Home({ author }: HomeProps) {
  async function downloadCurriculum() {
    const response = await fetch(author.curriculum.url);
    const responseAsBlob = await response.blob();

    const url = URL.createObjectURL(responseAsBlob);
    const linkToDownlaodFile = document.createElement("a");
    linkToDownlaodFile.href = url;
    linkToDownlaodFile.download = "Curriculo.pdf";
    linkToDownlaodFile.click();
  }

  return (
    <>
      <Head>
        <title>Home | DamasoMagno</title>
      </Head>

      <Header />

      <section className={styles.hero}>
        <div>
          <span>Olá, me chamo</span>
          <h1>{author.name}</h1>
          <strong>{author.area}</strong>
        </div>

        <button onClick={downloadCurriculum}>Baixar curriculo</button>
      </section>

      <section>
        <div className={styles.aboutMe}>
          <h2>Sobre mim</h2>
          <p>{author.about}</p>

          <div>
            {author.networks.map((network) => {
              for (const icon of icons.netwoks) {
                if (icon.name === network.name) {
                  return (
                    <a 
                      key={network.id} 
                      href={network.url} 
                      target="_blank"
                      rel="noreferrer"
                    >
                      {<icon.icon />}
                    </a>
                  );
                }
              }
            })}
          </div>
        </div>

        <div className={styles.tecnologies}>
          <h2>Habilidades</h2>

          <ul>
            {author.languages.map((skill) => {
              for (const icon of icons.languages) {
                if (icon.name === skill.name) {
                  return (
                    <li key={skill.id} title={author.name}>
                      <icon.icon /> {icon.name}
                    </li>
                  );
                }
              }
            })}
          </ul>
        </div>
      </section>

      <section className={styles.experience}>
        <div>
          <h2>Habilidades</h2>

          <ul>
            {author.experiencies.map((experience: IExperiencie) => {
              return (
                <li key={experience.enterprise}>
                  <header>
                    <strong>{experience.enterprise}</strong>
                  </header>
                  <p>{experience.description}</p>
                  <small>
                    {verifyDateIsCurrent(experience.startedAt)} -{" "}
                    {verifyDateIsCurrent(experience.finishedAt)}
                  </small>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className={styles.joinContact}>
        <h2>Entre em contato</h2>
        <ContactForm />
      </section>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const { data } = await client.query({
    query: AuthorQuery,
  });

  return {
    props: {
      author: data.author,
    },
    revalidate: 60 * 60 * 1, // 1 hour
  };
};
