from __future__ import annotations

import os
import subprocess
import uuid
from datetime import datetime
from pathlib import Path
from threading import Thread
from queue import Queue

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="TutorOS Animation Service")
MEDIA_DIR = Path(os.getenv("MEDIA_DIR", "./media"))
MEDIA_DIR.mkdir(parents=True, exist_ok=True)

job_queue: Queue[dict] = Queue()
job_store: dict[str, dict] = {}


class AnimationRequest(BaseModel):
    lesson_id: str
    concept_type: str
    prompt: str


def build_scene(prompt: str, concept_type: str) -> str:
    return f'''from manim import *\n\nclass TutorScene(Scene):\n    def construct(self):\n        title = Text("{concept_type.replace('_', ' ').title()}", font_size=42)\n        body = Text("{prompt[:60]}", font_size=28).next_to(title, DOWN)\n        self.play(Write(title))\n        self.play(FadeIn(body))\n        self.wait(1)\n'''


def worker() -> None:
    while True:
        job = job_queue.get()
        job_id = job["job_id"]
        try:
            job_store[job_id]["status"] = "RENDERING"
            script_path = MEDIA_DIR / f"{job_id}.py"
            script_path.write_text(build_scene(job["prompt"], job["concept_type"]))
            subprocess.run(
                ["python", "-m", "manim", str(script_path), "TutorScene", "-qm", "--media_dir", str(MEDIA_DIR)],
                check=True,
                capture_output=True,
                text=True,
            )
            output = next((MEDIA_DIR / "videos").rglob("TutorScene.mp4"), None)
            job_store[job_id]["status"] = "COMPLETED"
            job_store[job_id]["output_url"] = str(output) if output else None
        except Exception as exc:  # noqa: BLE001
            job_store[job_id]["status"] = "FAILED"
            job_store[job_id]["error"] = str(exc)
        finally:
            job_queue.task_done()


Thread(target=worker, daemon=True).start()


@app.get("/health")
def health() -> dict:
    return {"ok": True, "time": datetime.utcnow().isoformat()}


@app.post("/jobs")
def create_job(payload: AnimationRequest) -> dict:
    job_id = str(uuid.uuid4())
    job_store[job_id] = {
        "job_id": job_id,
        "status": "QUEUED",
        "lesson_id": payload.lesson_id,
        "concept_type": payload.concept_type,
        "prompt": payload.prompt,
        "created_at": datetime.utcnow().isoformat(),
    }
    job_queue.put({"job_id": job_id, **payload.model_dump()})
    return job_store[job_id]


@app.get("/jobs/{job_id}")
def get_job(job_id: str) -> dict:
    job = job_store.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
