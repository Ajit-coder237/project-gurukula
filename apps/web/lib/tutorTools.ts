import { prisma } from "@tutoros/db/client";
import { retrieveCourseContext } from "@tutoros/db/retrieval";
import type { MasteryDelta } from "@tutoros/types";
import { applyMasteryDelta, spacedReviewDays } from "@tutoros/ai";

export async function retrieve_course_context(courseId: string, query: string) {
  return retrieveCourseContext(courseId, query, 6);
}

export async function update_mastery(userId: string, delta: MasteryDelta) {
  const record = await prisma.masteryRecord.upsert({
    where: { userId_topicId: { userId, topicId: delta.topicId } },
    create: {
      userId,
      topicId: delta.topicId,
      confidence: applyMasteryDelta(0.5, delta),
      evidence: delta.evidence
    },
    update: {
      confidence: { increment: delta.confidenceDelta },
      evidence: delta.evidence
    }
  });

  const confidence = Math.max(0, Math.min(1, record.confidence));
  return { ...record, confidence, nextReviewDays: spacedReviewDays(confidence) };
}

export async function create_flashcards(courseId: string, topicId: string, cards: Array<{ front: string; back: string }>) {
  return prisma.$transaction(
    cards.map((card) =>
      prisma.flashcard.create({
        data: {
          courseId,
          topicId,
          front: card.front,
          back: card.back,
          nextReviewAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      })
    )
  );
}

export async function recommend_next_topic(userId: string, courseId: string) {
  const weak = await prisma.masteryRecord.findFirst({
    where: { userId, topic: { courseId } },
    orderBy: { confidence: "asc" },
    include: { topic: true }
  });

  if (weak) {
    return prisma.studyRecommendation.create({
      data: {
        userId,
        courseId,
        topicId: weak.topicId,
        reason: `Strengthen ${weak.topic.title} (confidence ${Math.round(weak.confidence * 100)}%)`,
        dueAt: new Date(Date.now() + spacedReviewDays(weak.confidence) * 24 * 60 * 60 * 1000)
      }
    });
  }

  const firstTopic = await prisma.topic.findFirst({ where: { courseId }, orderBy: { orderIndex: "asc" } });
  if (!firstTopic) return null;

  return prisma.studyRecommendation.create({
    data: {
      userId,
      courseId,
      topicId: firstTopic.id,
      reason: "Start with the foundational topic",
      dueAt: new Date()
    }
  });
}
