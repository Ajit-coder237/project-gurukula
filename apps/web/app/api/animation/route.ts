import { z } from "zod";
import { prisma } from "@tutoros/db/client";

const schema = z.object({ lessonId: z.string(), conceptType: z.string(), prompt: z.string() });

export async function POST(req: Request) {
  const payload = schema.parse(await req.json());
  const job = await prisma.animationJob.create({
    data: {
      lessonId: payload.lessonId,
      conceptType: payload.conceptType,
      prompt: payload.prompt,
      status: "QUEUED"
    }
  });

  return Response.json({ jobId: job.id, status: job.status });
}
