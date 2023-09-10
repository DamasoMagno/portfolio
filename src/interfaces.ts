export interface IExperiencie {
  id: string;
  enterprise: string;
  description: string;
  startedAt: string;
  finishedAt: string;
}

export interface INetwork {
  id: string;
  url: string;
  name: string;
}

export interface ILanguage {
  id: string;
  name: string;
}

export interface IAuthor {
  name: string;
  area: string;
  about: string;
  languages: ILanguage[];
  experiencies: IExperiencie[];
  networks: INetwork[];
}

export interface IProject {
  id: string;
  image: {
    url: string;
  };
  name: string;
  resume: string;
  description: string;
  languages: ILanguage[];
  address: string;
  repository: string;
}