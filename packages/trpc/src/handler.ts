import { appRouter } from "./router";
import { createContext } from "./context";

export const tRPCHandler = async (req: Request) => {
  const { fetchRequestHandler: tRPCFetch } =
    await import("@trpc/server/adapters/fetch");
  return tRPCFetch({
    req,
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  });
};
