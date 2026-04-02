import { prisma } from "./client";

export async function retrieveCourseContext(courseId: string, query: string, limit = 5) {
  const fallback = await prisma.chunk.findMany({
    where: { material: { courseId } },
    include: { material: true },
    take: limit,
    orderBy: { ordinal: "asc" }
  });

  return fallback
    .map((chunk) => ({
      chunkId: chunk.id,
      materialId: chunk.materialId,
      title: chunk.material.title,
      snippet: chunk.content.slice(0, 280),
      score: similarityProxy(query, chunk.content)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function similarityProxy(query: string, text: string): number {
  const q = new Set(query.toLowerCase().split(/\W+/));
  const words = text.toLowerCase().split(/\W+/);
  const hits = words.filter((w) => q.has(w)).length;
  return hits / Math.max(words.length, 1);
}
