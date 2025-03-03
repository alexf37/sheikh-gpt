import { createCallerFactory } from "@/server/api/trpc";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import OpenAI from "openai";
import { env } from "@/env";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  isHaram: publicProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }) => {
      try {
        if (!input.query.trim()) {
          throw new Error("Query cannot be empty");
        }

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a knowledgeable Islamic scholar who can determine whether something is halal (permissible) or haram (forbidden) in Islam.
              
              Provide thoughtful, well-reasoned responses based on Islamic teachings from the Quran, Hadith, and scholarly consensus when available.
              
              For topics where there is disagreement among scholars or different schools of thought, acknowledge this and provide a balanced view.
              
              Structure your response as valid JSON with these fields:
              - isHaram: boolean (true if the item/action is considered haram, false if halal or permissible)
              - explanation: string (detailed explanation of the ruling)
              - references: string[] (array of relevant references from Islamic sources)
              
              If you cannot determine a clear answer, set isHaram to null and explain why in the explanation field.
              
              You will begin responses by addressing the user as brother or sister.
              `,
            },
            {
              role: "user",
              content: `Is this haram in Islam: ${input.query}`,
            },
          ],
          temperature: 0.2,
          response_format: { type: "json_object" },
        });

        const content = response.choices[0]?.message?.content;

        if (!content) {
          throw new Error("No response from OpenAI");
        }

        const parsedResponse = z
          .object({
            isHaram: z.boolean().optional(),
            explanation: z.string().optional(),
            references: z.array(z.string()).optional(),
          })
          .parse(JSON.parse(content));

        if (parsedResponse.isHaram === null) {
          return {
            isHaram: false,
            explanation:
              parsedResponse.explanation ??
              "The permissibility of this is not clear in Islamic teachings.",
            references: parsedResponse.references ?? [],
            isUnclear: true,
          };
        }

        // Return structured response
        return {
          isHaram: parsedResponse.isHaram,
          explanation: parsedResponse.explanation,
          references: parsedResponse.references ?? [],
        };
      } catch (error) {
        console.error("Error in isHaram query:", error);
        throw new Error(
          "Failed to determine Islamic ruling. Please try again.",
        );
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
