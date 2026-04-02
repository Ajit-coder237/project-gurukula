# TutorOS

TutorOS is a production-oriented full-stack AI tutoring platform that turns uploaded course materials into grounded, pedagogical lessons with whiteboarding, quiz generation, mastery tracking, and animation rendering.

## Monorepo structure

- `apps/web`: Next.js 15 application with Clerk auth integration points, course dashboard, lesson UI, API routes.
- `apps/animation-service`: FastAPI + Manim rendering microservice with job queue.
- `packages/db`: Prisma schema, ingestion/retrieval services, seed data.
- `packages/ai`: tutor prompt policy and mastery logic.
- `packages/types`: shared domain contracts.
- `packages/ui`: shared visual constants/components.
- `packages/config`: environment schema validation.

## Key architecture

### Grounded tutoring pipeline
1. Upload material metadata and text extraction output.
2. Chunk with overlap (`packages/db/src/ingestion.ts`).
3. Store chunks + embedding reference metadata in Postgres + pgvector.
4. Retrieve top chunks per query (`packages/db/src/retrieval.ts`).
5. Tutor orchestration (`apps/web/lib/tutorEngine.ts`) combines:
   - mode/style
   - retrieved citations
   - pedagogical system prompt
   - mastery-aware recommendations.

### Pedagogical policy
Tutor system prompt enforces:
- diagnose prior knowledge
- step-by-step explanation
- check-for-understanding
- misconception handling
- short practice task
- mastery/review updates.

### Whiteboard integration
Lesson UI embeds `tldraw` for collaborative drawing and persists tutor whiteboard events via `/api/whiteboard` and `/api/lesson/respond` generated commands.

### Animation service
FastAPI service accepts render jobs, pushes them to an in-memory queue, runs Manim + FFmpeg, and exposes status endpoints.

## Quick start

### 1) Prerequisites
- Node.js 20+
- pnpm 9+
- Python 3.11+
- Docker (optional)

### 2) Install
```bash
corepack enable
pnpm install
cp .env.example .env
```

### 3) Start infrastructure
```bash
docker compose up -d postgres
```

### 4) Prisma setup
```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

### 5) Run web app
```bash
pnpm --filter @tutoros/web dev
```

### 6) Run animation service
```bash
cd apps/animation-service
pip install -e .
uvicorn app.main:app --reload --port 8001
```

## API highlights

- `POST /api/courses`: create course.
- `POST /api/ingestion`: create chunks from extracted text.
- `POST /api/retrieval`: retrieve grounded context for query.
- `POST /api/lesson/respond`: tutoring response + citations + whiteboard commands.
- `POST /api/quiz`: quiz generation endpoint.
- `POST /api/animation`: enqueue animation job metadata.

## Testing
```bash
pnpm test
pnpm --filter @tutoros/web test
pnpm --filter @tutoros/db test
pnpm --filter @tutoros/ai test
```

## Production notes
- Replace in-memory animation queue with Redis/Celery/RQ.
- Implement actual extraction workers (PDF/PPT parsing) and object-storage upload signing.
- Enable OpenAI Realtime WebRTC bridge for voice sessions.
- Wire PostHog and Sentry keys through framework-specific SDK init.
- Apply Prisma-generated migration SQL in CI/CD.

