import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string().min(2),
  level: z.enum(["SCHOOL", "UNDERGRADUATE", "GRADUATE", "PROFESSIONAL"]),
  learningGoal: z.enum(["PASS_EXAM", "DEEP_UNDERSTANDING", "HOMEWORK_HELP", "REVISION"])
});

export const tutorMessageSchema = z.object({
  lessonId: z.string().min(1),
  message: z.string().min(2),
  teachingMode: z.enum(["lecture", "socratic", "problem_solving", "quiz", "revision", "exam_prep"]),
  explanationStyle: z.enum(["simple", "standard_university", "exam_focused", "intuitive", "formal_proof"])
});
