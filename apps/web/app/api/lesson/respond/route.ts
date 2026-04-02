import { prisma } from "@tutoros/db/client";
import { tutorMessageSchema } from "@/lib/validation";
import { tutorRespond } from "@/lib/tutorEngine";

export async function POST(req: Request) {
  const payload = tutorMessageSchema.parse(await req.json());

  await prisma.lessonMessage.create({
    data: {
      lessonId: payload.lessonId,
      role: "STUDENT",
      content: payload.message
    }
  });

  const tutor = await tutorRespond(payload);

  await prisma.lessonMessage.create({
    data: {
      lessonId: payload.lessonId,
      role: "TUTOR",
      content: `${tutor.answer}\n\nCFU: ${tutor.checkForUnderstanding}\nPractice: ${tutor.practiceTask}`,
      citations: tutor.citations
    }
  });

  await prisma.whiteboardEvent.createMany({
    data: tutor.whiteboardActions.map((event, orderIndex) => ({
      lessonId: payload.lessonId,
      commandType: event.type,
      payload: event.payload,
      orderIndex
    }))
  });

  return Response.json(tutor);
}
