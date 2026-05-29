import { createContext, useContext, useState, ReactNode } from "react";

export type PageId = "dashboard" | "dataset" | "preprocess" | "explore" | "classify" | "cluster" | "associate" | "reports";

type Ctx = { page: PageId; setPage: (p: PageId) => void };
const PageCtx = createContext<Ctx>({ page: "dashboard", setPage: () => {} });

export function PageProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<PageId>("dashboard");
  return <PageCtx.Provider value={{ page, setPage }}>{children}</PageCtx.Provider>;
}

export const usePage = () => useContext(PageCtx);
