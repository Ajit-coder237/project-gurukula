import { prisma } from "@tutoros/db/client";
import { upsertChunks } from "@tutoros/db/ingestion";
import { z } from "zod";

const schema = z.object({ materialId: z.string(), text: z.string().min(20) });

export async function POST(req: Request) {
  const payload = schema.parse(await req.json());

  await prisma.courseMaterial.update({
    where: { id: payload.materialId },
    data: { ingestionStatus: "PROCESSING" }
  });

  const count = await upsertChunks(payload.materialId, payload.text);

  await prisma.courseMaterial.update({
    where: { id: payload.materialId },
    data: { ingestionStatus: "COMPLETED" }
  });

  return Response.json({ chunkCount: count });
}
