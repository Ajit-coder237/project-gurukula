import { prisma } from "@tutoros/db/client";
import Link from "next/link";

export default async function CoursePage({ params }: { params: { courseId: string } }) {
  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: { modules: { include: { topics: true } }, recommendations: true }
  });

  if (!course) return <div className="p-8">Course not found.</div>;

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="text-3xl font-semibold">{course.title}</h1>
      <p className="mt-1 text-slate-300">Progress {Math.round(course.progressPct)}%</p>
      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 p-4">
          <h2 className="font-semibold">Modules & topics</h2>
          {course.modules.map((m) => (
            <div key={m.id} className="mt-3">
              <h3 className="text-slate-200">{m.title}</h3>
              <ul className="list-disc pl-5 text-sm text-slate-400">
                {m.topics.map((t) => (
                  <li key={t.id}>{t.title}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-slate-800 p-4">
          <h2 className="font-semibold">Recommendations</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {course.recommendations.map((r) => (
              <li key={r.id}>{r.reason}</li>
            ))}
          </ul>
          <Link href={`/lesson/new?courseId=${course.id}`} className="mt-4 inline-block rounded bg-brand-500 px-4 py-2">
            Start lesson
          </Link>
        </div>
      </section>
    </main>
  );
}
