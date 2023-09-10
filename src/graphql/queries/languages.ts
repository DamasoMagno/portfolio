import { gql } from "@apollo/client";

export const LanguagesQuery = gql`
  query Languages {
    languages {
      id
      name
    }
  }
`;