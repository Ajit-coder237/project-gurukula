import { prisma } from "@tutoros/db/client";
import { createCourseSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const payload = createCourseSchema.parse(await req.json());
    const user = await prisma.user.findFirst();
    if (!user) return Response.json({ error: "No user seeded" }, { status: 400 });

    const course = await prisma.course.create({
      data: {
        userId: user.id,
        title: payload.title,
        level: payload.level,
        learningGoal: payload.learningGoal,
        ingestionStatus: "PENDING"
      }
    });

    return Response.json({ courseId: course.id });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}
