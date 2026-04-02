import { retrieveCourseContext } from "@tutoros/db/retrieval";
import { z } from "zod";

const schema = z.object({ courseId: z.string(), query: z.string() });

export async function POST(req: Request) {
  const payload = schema.parse(await req.json());
  const contexts = await retrieveCourseContext(payload.courseId, payload.query);
  return Response.json({ contexts });
}
