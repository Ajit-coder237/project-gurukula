"use client";

import { Tldraw } from "@tldraw/tldraw";
import { useState } from "react";

export function LessonClient({ lessonId }: { lessonId: string }) {
  const [message, setMessage] = useState("Explain limits intuitively");
  const [answer, setAnswer] = useState("Ask a question to begin tutoring.");

  async function askTutor() {
    const res = await fetch("/api/lesson/respond", {
      method: "POST",
      body: JSON.stringify({ lessonId, message, teachingMode: "socratic", explanationStyle: "intuitive" })
    });
    const payload = await res.json();
    setAnswer(payload.answer);
  }

  return (
    <div className="grid h-[calc(100vh-120px)] grid-cols-2 gap-4">
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="font-semibold">Tutor conversation</h2>
        <textarea className="mt-3 h-28 w-full rounded bg-slate-800 p-3" value={message} onChange={(e) => setMessage(e.target.value)} />
        <button onClick={askTutor} className="mt-3 rounded bg-brand-500 px-4 py-2">Send</button>
        <div className="mt-4 rounded bg-slate-950 p-3 text-sm text-slate-200 whitespace-pre-wrap">{answer}</div>
      </section>
      <section className="rounded-xl border border-slate-800 overflow-hidden">
        <Tldraw persistenceKey={`lesson-${lessonId}`} />
      </section>
    </div>
  );
}
