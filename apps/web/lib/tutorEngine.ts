import OpenAI from "openai";
import { buildTutorSystemPrompt } from "@tutoros/ai";
import { prisma } from "@tutoros/db/client";
import { retrieveCourseContext } from "@tutoros/db/retrieval";
import { recommend_next_topic, update_mastery } from "./tutorTools";
import type { TutorResponsePayload, WhiteboardCommand } from "@tutoros/types";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function tutorRespond(input: {
  lessonId: string;
  message: string;
  teachingMode: "lecture" | "socratic" | "problem_solving" | "quiz" | "revision" | "exam_prep";
  explanationStyle: "simple" | "standard_university" | "exam_focused" | "intuitive" | "formal_proof";
}): Promise<TutorResponsePayload> {
  const lesson = await prisma.lesson.findUnique({ where: { id: input.lessonId } });
  if (!lesson) throw new Error("Lesson not found");

  const contexts = await retrieveCourseContext(lesson.courseId, input.message, 5);
  const contextText = contexts.map((c, i) => `[${i + 1}] (${c.chunkId}) ${c.snippet}`).join("\n");

  const systemPrompt = buildTutorSystemPrompt(input.teachingMode, input.explanationStyle);

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Course chunks:\n${contextText}\n\nStudent: ${input.message}` }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "tutor_response",
        schema: {
          type: "object",
          properties: {
            answer: { type: "string" },
            checkForUnderstanding: { type: "string" },
            practiceTask: { type: "string" },
            whiteboardActions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  payload: { type: "object", additionalProperties: true },
                  delayMs: { type: "number" }
                },
                required: ["type", "payload"],
                additionalProperties: false
              }
            }
          },
          required: ["answer", "checkForUnderstanding", "practiceTask", "whiteboardActions"],
          additionalProperties: false
        }
      }
    }
  });

  const parsed = JSON.parse(response.output_text) as Omit<TutorResponsePayload, "citations">;

  const firstTopic = await prisma.topic.findFirst({ where: { courseId: lesson.courseId } });
  if (firstTopic) {
    await update_mastery(lesson.userId, {
      topicId: firstTopic.id,
      confidenceDelta: 0.03,
      evidence: `lesson:${lesson.id} student prompt: ${input.message.slice(0, 120)}`
    });
    await recommend_next_topic(lesson.userId, lesson.courseId);
  }

  const whiteboardActions: WhiteboardCommand[] = parsed.whiteboardActions.slice(0, 6);
  return {
    ...parsed,
    whiteboardActions,
    citations: contexts.map((c) => ({
      chunkId: c.chunkId,
      materialId: c.materialId,
      title: c.title,
      snippet: c.snippet
    }))
  };
}
