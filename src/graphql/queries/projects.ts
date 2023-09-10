import { gql } from "@apollo/client";

export const ProjectsQuery = gql`
  query Projects($name: String = "") {
    projects(where: {name_contains: $name}) {
      id
      image {
        url
      }
      name
      description
      resume
      address
      repository
      languages {
        id
        name
      }
    }
  }
  
`;
