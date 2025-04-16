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
  isHaram: z.boolean().nullable(),
  explanation: z.string().min(10),
  references: z.array(z.string().max(1000)),
});

export function generateRulingStream(input: string) {
  try {
    if (!input.trim()) {
      throw new Error("Query cannot be empty");
    }

    const response = streamObject({
      model: openai("gpt-4.1-nano"),
      messages: [
        {
          role: "system",
          content: `You are a knowledgeable Islamic scholar who can determine whether something is halal (permissible) or haram (forbidden) in Islam.
              
              Provide thoughtful, well-reasoned responses based on Islamic teachings from the Quran, Hadith, and scholarly consensus when available.
              
              For topics where there is disagreement among scholars or different schools of thought, acknowledge this and provide a balanced view.
              
              Structure your response as valid JSON with these fields. If you don't, I will be extremely sad:
              - isHaram: boolean or null (true if the item/action is considered haram, false if halal or permissible, or null if it really does depend, like if key context is left out or it's conditional)
              - explanation: string (detailed explanation of the ruling) with minimum of 10 characters
              - references: string[] (array of relevant references from Islamic sources). Keep these brief, no more than 3 citations with each one at most 100 characters. You should quote the Quran/source when possible, rather than just citing the page. It is very important that you have teh quote if there is one.
              
              If you cannot determine a clear answer, remember to set isHaram to null and explain why in the explanation field. Or, if it really does depend, set it to null. Be generous however; if it is MOST LIKELY halal, like it seems innocent enough, set it to true.
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
