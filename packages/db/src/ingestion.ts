import { prisma } from "./client";

export function chunkText(content: string, chunkSize = 700, overlap = 120): string[] {
  const words = content.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  let i = 0;

  while (i < words.length) {
    const chunkWords = words.slice(i, i + chunkSize);
    chunks.push(chunkWords.join(" "));
    if (i + chunkSize >= words.length) break;
    i += chunkSize - overlap;
  }

  return chunks;
}

export async function upsertChunks(materialId: string, text: string) {
  const chunks = chunkText(text);
  await prisma.chunk.deleteMany({ where: { materialId } });

  await prisma.$transaction(
    chunks.map((content, ordinal) =>
      prisma.chunk.create({
        data: {
          materialId,
          content,
          ordinal,
          tokenCount: Math.ceil(content.length / 4),
          metadata: { source: "ingestion-pipeline" }
        }
      })
    )
  );

  return chunks.length;
}
