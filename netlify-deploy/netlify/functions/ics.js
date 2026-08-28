function icsEscape(text) {
  return String(text || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function nextDay(yyyymmdd) {
  const y = Number(yyyymmdd.slice(0, 4));
  const m = Number(yyyymmdd.slice(4, 6)) - 1;
  const d = Number(yyyymmdd.slice(6, 8));
  const dt = new Date(Date.UTC(y, m, d));
  dt.setUTCDate(dt.getUTCDate() + 1);
  const ny = dt.getUTCFullYear();
  const nm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const nd = String(dt.getUTCDate()).padStart(2, '0');
  return '' + ny + nm + nd;
}

exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  const title = q.title || '일정';
  const date = q.date || '';
  const desc = q.desc || '';

  if (!/^\d{8}$/.test(date)) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: 'invalid date (expected YYYYMMDD)',
    };
  }

  const now = new Date();
  const stamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const uid = Date.now() + '-' + Math.random().toString(36).slice(2) + '@work-calendar.app';

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//work-calendar//KR',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    'UID:' + uid,
    'DTSTAMP:' + stamp,
    'DTSTART;VALUE=DATE:' + date,
    'DTEND;VALUE=DATE:' + nextDay(date),
    'SUMMARY:' + icsEscape(title),
  ];
  if (desc) lines.push('DESCRIPTION:' + icsEscape(desc));
  lines.push('END:VEVENT', 'END:VCALENDAR');

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="event.ics"',
      'Cache-Control': 'no-store',
    },
    body: lines.join('\r\n'),
  };
};
