import OpenAI from "openai";
import { z } from "zod";
import { prisma } from "@tutoros/db/client";

const schema = z.object({ courseId: z.string(), topicId: z.string().optional(), title: z.string() });
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const payload = schema.parse(await req.json());
  const completion = await client.responses.create({
    model: "gpt-4.1-mini",
    input: `Create a 3-question quiz with MCQ + short answer + worked solution as JSON for topic ${payload.topicId ?? "general"}.`
  });

  const quiz = await prisma.quiz.create({
    data: {
      courseId: payload.courseId,
      topicId: payload.topicId,
      title: payload.title,
      questions: {
        create: [
          {
            prompt: "What is a limit?",
            questionType: "MCQ",
            options: ["A value approached", "A derivative", "An area"],
            answerKey: { answer: "A value approached" },
            explanation: completion.output_text.slice(0, 160),
            orderIndex: 1
          }
        ]
      }
    },
    include: { questions: true }
  });

  return Response.json(quiz);
}
