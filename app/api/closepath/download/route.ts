import { exportBook } from "../../../../lib/closepath-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Older receipt links land here. The file is the signed-in buyer’s book, not a blank template. */
export async function GET(req: Request) {
  return exportBook(req);
}