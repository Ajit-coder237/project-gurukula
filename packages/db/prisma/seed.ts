import { prisma } from "../src/client";

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@tutoros.dev" },
    update: {},
    create: { clerkId: "demo_clerk_user", email: "demo@tutoros.dev", name: "Demo Student" }
  });

  const course = await prisma.course.create({
    data: {
      userId: user.id,
      title: "Calculus I",
      description: "Limits, derivatives, and integrals.",
      level: "UNDERGRADUATE",
      learningGoal: "DEEP_UNDERSTANDING",
      ingestionStatus: "COMPLETED",
      modules: {
        create: [{ title: "Foundations", orderIndex: 1, weekNumber: 1 }]
      }
    },
    include: { modules: true }
  });

  const topic = await prisma.topic.create({
    data: {
      courseId: course.id,
      moduleId: course.modules[0]?.id,
      title: "Limits and Continuity",
      description: "Understanding limit intuition and formal epsilon-delta definitions",
      orderIndex: 1,
      learningObjectives: ["Estimate limits from graphs", "Evaluate limits algebraically"]
    }
  });

  const material = await prisma.courseMaterial.create({
    data: {
      courseId: course.id,
      title: "Week 1 Notes",
      materialType: "NOTES",
      storageKey: "demo/week1.md",
      mimeType: "text/markdown",
      ingestionStatus: "COMPLETED"
    }
  });

  await prisma.chunk.createMany({
    data: [
      {
        materialId: material.id,
        topicId: topic.id,
        content: "A limit describes the value f(x) approaches as x approaches a point.",
        ordinal: 0,
        tokenCount: 18,
        metadata: { page: 1 }
      },
      {
        materialId: material.id,
        topicId: topic.id,
        content: "If left-hand and right-hand limits are equal, the two-sided limit exists.",
        ordinal: 1,
        tokenCount: 20,
        metadata: { page: 1 }
      }
    ]
  });
}

main().finally(async () => {
  await prisma.$disconnect();
});
