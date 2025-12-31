import "server-only";
import { env } from "@/env";
import { createOpenAI } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { z } from "zod";

const openai = createOpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export const rulingSchema = z.object({
  ruling: z
    .enum([
      "HARAM",
      "PROBABLY_HARAM",
      "DEPENDS",
      "PROBABLY_HALAL",
      "HALAL",
      "NEEDS_CLARIFICATION",
    ])
    .nullable(),
  explanation: z.string().nullable(),
  references: z.array(z.string().max(1000)).nullable(),
  clarifyingQuestion: z.string().nullable(),
});

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type RulingInput = {
  query: string;
  history?: Message[];
};

export function generateRulingStream(input: RulingInput) {
  try {
    if (!input.query.trim()) {
      throw new Error("Query cannot be empty");
    }

    const conversationMessages: {
      role: "user" | "assistant";
      content: string;
    }[] = [];

    // Build conversation history
    if (input.history && input.history.length > 0) {
      for (const msg of input.history) {
        conversationMessages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // Add the current query
    conversationMessages.push({
      role: "user",
      content: input.query,
    });

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

IMPORTANT: If the user's question is ambiguous, too vague, or could have different rulings depending on context/intent, you should ask ONE clarifying question to better understand their situation. In this case:
- Set ruling to "NEEDS_CLARIFICATION"
- Set clarifyingQuestion to your question (keep it concise and specific)
- Set explanation and references to null

When you have enough information to give a ruling, structure your response with:
- ruling: "HARAM", "PROBABLY_HARAM", "DEPENDS", "PROBABLY_HALAL", or "HALAL"
- explanation: detailed explanation of the ruling (minimum 10 characters)
- references: array of relevant references from Islamic sources (max 3, quote when possible)
- clarifyingQuestion: null

Choose HARAM if definitely forbidden, PROBABLY_HARAM if likely forbidden, DEPENDS if it requires more context or is conditional, PROBABLY_HALAL if likely permissible, and HALAL if definitely permissible.

Be generous; if it seems innocent enough, lean towards PROBABLY_HALAL or HALAL. Interpret questions in the spirit they are intended. Always note any assumptions in your explanation. In final answers, "DEPENDS" should be avoided unless it is absolutely necessary. Shy away from a simple "it depends"---interpret it in the spirit it is intended and what the user probably means, though obviously note the nuance in your response.

If the user asks a follow-up question about the ruling or wants more detail, engage with their question thoughtfully. You can provide additional explanation without changing the ruling if appropriate.`,
        },
        ...conversationMessages,
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
