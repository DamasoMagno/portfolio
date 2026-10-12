import type { PortfolioContent } from "../schemas/content";
export interface ContentRepository {
  read(): Promise<PortfolioContent>;
  mutate(update: (content: PortfolioContent) => void, revision?: number): Promise<PortfolioContent>;
}
