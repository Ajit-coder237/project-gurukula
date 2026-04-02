import { LessonClient } from "@/components/LessonClient";

export default function LessonPage({ params }: { params: { lessonId: string } }) {
  return (
    <main className="p-6">
      <LessonClient lessonId={params.lessonId} />
    </main>
  );
}
