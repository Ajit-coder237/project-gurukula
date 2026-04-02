import { prisma } from "@tutoros/db/client";
import { redirect } from "next/navigation";

export default async function NewLessonPage({ searchParams }: { searchParams: { courseId?: string } }) {
  if (!searchParams.courseId) return <div className="p-8">Missing course ID</div>;

  const firstUser = await prisma.user.findFirst({
    where: { email: "demo@tutoros.dev" }
  }) ?? await prisma.user.create({
    data: { clerkId: "local_demo", email: "demo@tutoros.dev" }
  });
  const lesson = await prisma.lesson.create({
    data: {
      courseId: searchParams.courseId,
      userId: firstUser.id,
      teachingMode: "lecture",
      explanationStyle: "standard_university"
    }
  });

  redirect(`/lesson/${lesson.id}`);
}
