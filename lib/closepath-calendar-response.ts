import { NextResponse } from "next/server";

export function icsResponse(ics: string, filename: string, disposition: "inline" | "attachment"): NextResponse {
  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `${disposition}; filename="${filename}"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
