/**
 * Calendar-day bounds for APP_TIMEZONE.
 * The offset is taken at `date`, which is exact for UTC and correct for
 * other zones except during a daylight-saving transition.
 */
export function getZonedDayBounds(timeZone = 'UTC', date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const parts = {};
  for (const part of formatter.formatToParts(date)) {
    if (part.type !== 'literal') {
      parts[part.type] = part.value;
    }
  }

  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  let hour = Number(parts.hour);
  const minute = Number(parts.minute);
  const second = Number(parts.second);
  if (hour === 24) {
    hour = 0;
  }

  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second);
  const offset = utcGuess - date.getTime();
  const start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0) - offset);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}
