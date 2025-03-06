import { createCallerFactory } from "@/server/api/trpc";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { generateRulingStream } from "./ai";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  isHaram: publicProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async function* ({ input }) {
      const response = generateRulingStream(input.query);
      for await (const partialObject of response.partialObjectStream) {
        yield partialObject;
      }
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
