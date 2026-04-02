"use client";

import { useState } from "react";

export default function NewCoursePage() {
  const [status, setStatus] = useState<string>("");

  async function onSubmit(formData: FormData) {
    const response = await fetch("/api/courses", {
      method: "POST",
      body: JSON.stringify({
        title: formData.get("title"),
        level: formData.get("level"),
        learningGoal: formData.get("learningGoal")
      })
    });
    const payload = await response.json();
    setStatus(payload.courseId ? `Created ${payload.courseId}` : payload.error);
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-8">
      <h1 className="text-3xl font-semibold">Create course</h1>
      <form
        action={onSubmit}
        className="grid gap-4 rounded-xl border border-slate-800 bg-slate-900/70 p-6"
      >
        <input required name="title" placeholder="Course title" className="rounded bg-slate-800 p-3" />
        <select name="level" className="rounded bg-slate-800 p-3">
          <option value="SCHOOL">School</option>
          <option value="UNDERGRADUATE">Undergraduate</option>
          <option value="GRADUATE">Graduate</option>
          <option value="PROFESSIONAL">Professional</option>
        </select>
        <select name="learningGoal" className="rounded bg-slate-800 p-3">
          <option value="PASS_EXAM">Pass exam</option>
          <option value="DEEP_UNDERSTANDING">Deep understanding</option>
          <option value="HOMEWORK_HELP">Homework help</option>
          <option value="REVISION">Revision</option>
        </select>
        <button className="rounded bg-brand-500 px-4 py-2">Create</button>
      </form>
      {!!status && <p className="text-sm text-slate-300">{status}</p>}
    </main>
  );
}
