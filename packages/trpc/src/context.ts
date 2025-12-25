import type { SessionUser } from "@aah/auth";

export interface Context {
  user: SessionUser | null;
}

export async function createContext(): Promise<Context> {
  return {
    user: null,
  };
}
