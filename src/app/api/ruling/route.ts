import { generateRulingStream, type RulingInput } from "@/server/api/ai";

export async function POST(req: Request) {
  const input = (await req.json()) as RulingInput;
  const response = generateRulingStream(input);
  return response.toTextStreamResponse();
}
