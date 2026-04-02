import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="text-4xl font-semibold">TutorOS</h1>
      <p className="mt-3 text-slate-300">Grounded AI tutoring with pedagogy, mastery, whiteboard, and animation.</p>
      <div className="mt-6 flex gap-3">
        <Link href="/courses/new" className="rounded bg-brand-500 px-4 py-2 font-medium">Create course</Link>
        <Link href="/courses/demo" className="rounded border border-slate-700 px-4 py-2">Open demo course</Link>
      </div>
    </main>
  );
}
