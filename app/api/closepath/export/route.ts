import { exportBook } from "../../../../lib/closepath-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return exportBook(req);
}
