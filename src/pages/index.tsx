import { GetStaticProps } from "next";

import { icons } from "@/utils/format-icons";
import { verifyDateIsCurrent } from "@/utils/verify-date-is-valid";

import { IAuthor, IExperiencie, ILanguage } from "@/interfaces";
import { AuthorQuery } from "@/graphql/queries/author";
import { client } from "@/libs/apollo";

import { Header } from "@/components/Header";

import styles from "@/styles/pages/Home.module.scss";

interface HomeProps {
  author: IAuthor;
}

export default function Home({ author }: HomeProps) {
  return (
    <>
      <Header />

      <section className={styles.hero}>
        <div>
          <span>Olá, me chamo</span>
          <h1>{author.name}</h1>
          <strong>{author.area}</strong>
        </div>

        <a href={author.curriculum.url} target="_blank">
          Baixar curriculo
        </a>
      </section>

      <section>
        <div className={styles.aboutMe}>
          <h2>Sobre mim</h2>
          <p>{author.about}</p>

          <div>
            {author.networks.map((network) => {
              for (const icon of icons.netwoks) {
                return (
                  icon.name === network.name && (
                    <a key={network.id} href={network.url} title={author.name}>
                      {<icon.icon />}
                    </a>
                  )
                );
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

        <form>
          <div>
            <label htmlFor="name">Nome</label>
            <input id="name" />
          </div>
          <div>
            <label htmlFor="email">E-mail</label>
            <input id="email" />
          </div>
          <div>
            <label htmlFor="message">Menssagem</label>
            <textarea id="message" />
          </div>
          <button>Entrar em contato</button>
        </form>
      </section>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const { data } = await client.query({
    query: AuthorQuery,
  });

  const author: IAuthor = data.author;

  return {
    props: {
      author,
    },
    revalidate: 60 * 60 * 1, // 1 hour
  };
};
