import { prisma } from "@tutoros/db/client";
import { z } from "zod";

const schema = z.object({ lessonId: z.string(), commandType: z.string(), payload: z.record(z.any()), orderIndex: z.number() });

export async function POST(req: Request) {
  const body = schema.parse(await req.json());
  const event = await prisma.whiteboardEvent.create({ data: body });
  return Response.json(event);
}
