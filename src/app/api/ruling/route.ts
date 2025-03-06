import { generateRulingStream } from "@/server/api/ai";

export async function POST(req: Request) {
  const context = await req.text();
  const response = generateRulingStream(context);
  return response.toTextStreamResponse();
}
