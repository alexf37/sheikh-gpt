import "server-only";
import { env } from "@/env";
import { createGroq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { z } from "zod";

const groq = createGroq({
  apiKey: env.OPENAI_API_KEY,
});

const openai = createOpenAI({
  apiKey: env.OPENAI_API_KEY,
});

const rulingSchema = z.object({
  ruling: z.enum([
    "HARAM",
    "PROBABLY_HARAM",
    "DEPENDS",
    "PROBABLY_HALAL",
    "HALAL",
  ]),
  explanation: z.string().min(10),
  references: z.array(z.string().max(1000)),
});

export function generateRulingStream(input: string) {
  try {
    if (!input.trim()) {
      throw new Error("Query cannot be empty");
    }

    const response = streamObject({
      model: openai("gpt-5-mini"),
      providerOptions: {
        openai: {
          reasoningEffort: "minimal",
        },
      },
      messages: [
        {
          role: "system",
          content: `You are a knowledgeable Islamic scholar who can determine whether something is halal (permissible) or haram (forbidden) in Islam.
              
              Provide thoughtful, well-reasoned responses based on Islamic teachings from the Quran, Hadith, and scholarly consensus when available.
              
              For topics where there is disagreement among scholars or different schools of thought, acknowledge this and provide a balanced view.
              
              Structure your response as valid JSON with these fields. If you don't, I will be extremely sad:
              - ruling: string enum ("HARAM", "PROBABLY_HARAM", "DEPENDS", "PROBABLY_HALAL", "HALAL"). Choose HARAM if definitely forbidden, PROBABLY_HARAM if likely forbidden, DEPENDS if it requires more context or is conditional, PROBABLY_HALAL if likely permissible, and HALAL if definitely permissible.
              - explanation: string (detailed explanation of the ruling) with minimum of 10 characters
              - references: string[] (array of relevant references from Islamic sources). Keep these brief, no more than 3 citations with each one at most 100 characters. You should quote the Quran/source when possible, rather than just citing the page. It is very important that you have teh quote if there is one.
              
              If you cannot determine a clear answer, remember to set ruling to DEPENDS and explain why in the explanation field. Generally avoid it depends unless it is absolutely necessary. Be generous however; if it seems innocent enough, lean towards PROBABLY_HALAL or HALAL. Shy away from a simple "it depends"---interpret it in the spirit it is intended and what the user probably means, though obviously note the nuance in your response. Always note any assumptions in your explanation.
              DO NOT OUTPUT ANYTHING ELSE. NOTHING BEYOND THE JSON I SPECIFIED. YOUR RESPONSES SHOULD ALWAYS BE JUST JSON. THAT'S IT. I SHOULD BE ABLE TO PLUG YOUR RESPONSE INTO A JSON PARSER AND IT WILL WORK.
              `,
        },
        {
          role: "user",
          content: `Is this haram in Islam: ${input}`,
        },
      ],
      temperature: 0.2,
      schema: rulingSchema,
      onFinish: (final) => {
        console.log("Final response:", final.error);
      },
    });

    return response;
  } catch (error) {
    console.error("Error in query:", error);
    throw new Error("Failed to determine Islamic ruling. Please try again.");
  }
}
