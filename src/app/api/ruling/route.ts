import { generateRulingStream } from "@/server/api/ai";
import { z } from "zod";

export const input = z.object({
  query: z.string().min(1),
});

export async function POST(req: Request) {
  const context = await req.text();
  const response = generateRulingStream(context);
  return response.toTextStreamResponse();
}
