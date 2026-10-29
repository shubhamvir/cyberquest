// GET /api/calendar.ics -> daily drill reminders at 08:00, 12:00, 16:00 and 20:00 (Europe/Dublin).
// Opening it on an iPhone or iPad offers "Add All" to the Calendar app; each event has an alert.
export default async (req, context) => {
  const origin = context?.site?.url || new URL(req.url).origin;
  const hours = [8, 12, 16, 20];
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const d = new Date();
  const start = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//CyberQuest//Drill reminders//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "X-WR-CALNAME:CyberQuest drills",
    "BEGIN:VTIMEZONE", "TZID:Europe/Dublin",
    "BEGIN:STANDARD", "DTSTART:19701025T020000", "TZOFFSETFROM:+0100", "TZOFFSETTO:+0000", "TZNAME:GMT", "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU", "END:STANDARD",
    "BEGIN:DAYLIGHT", "DTSTART:19700329T010000", "TZOFFSETFROM:+0000", "TZOFFSETTO:+0100", "TZNAME:IST", "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU", "END:DAYLIGHT",
    "END:VTIMEZONE",
  ];
  for (const h of hours) {
    const hh = String(h).padStart(2, "0");
    lines.push(
      "BEGIN:VEVENT", `UID:cyberquest-drill-${hh}@cyberquest`, `DTSTAMP:${stamp}`,
      `DTSTART;TZID=Europe/Dublin:${start}T${hh}0000`, `DTEND;TZID=Europe/Dublin:${start}T${hh}1000`,
      "RRULE:FREQ=DAILY", "SUMMARY:CyberQuest drill (10 questions)",
      `DESCRIPTION:Open CyberQuest and play the suggested module: ${origin}/?drill=next`, `URL:${origin}/?drill=next`,
      "TRANSP:TRANSPARENT",
      "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:CyberQuest drill time", "TRIGGER:PT0M", "END:VALARM",
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");
  return new Response(lines.join("\r\n") + "\r\n", {
    headers: { "content-type": "text/calendar; charset=utf-8", "content-disposition": 'inline; filename="cyberquest-reminders.ics"', "cache-control": "no-store" },
  });
};

export const config = { path: "/api/calendar.ics", method: "GET" };
