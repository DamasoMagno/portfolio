import { gql } from "@apollo/client";

export const ProjectsQuery = gql`
  query Projects($name: String = "", $languages: [String]) {
    projects(where: {name_contains: $name, languages_some: {name_in: $languages}}) {
      id
      image {
        url
      }
      name
      resume
      description
      address
      repository
      languages {
        id
        name
      }
    }
  }
`;
