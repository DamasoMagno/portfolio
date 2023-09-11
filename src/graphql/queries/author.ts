import { gql } from "@apollo/client";

export const AuthorQuery = gql`
query Author {
  author(where: { name: "Damaso Magno" }) {
    name
    area
    about
    curriculum {
      url
    }
    languages {
      id
      name
    }
    experiencies {
      id
      enterprise
      description
      startedAt
      finishedAt
    }
    networks {
      id
      name
      url
    }
  }
}

`;