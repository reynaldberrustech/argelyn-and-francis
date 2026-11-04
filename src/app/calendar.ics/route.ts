import { icsFile } from "@/lib/calendar";

export function GET() {
  return new Response(icsFile(), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="francis-and-argelyn-wedding.ics"',
    },
  });
}
