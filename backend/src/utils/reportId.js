// The database stores a plain number (12). The frontend shows and uses "rpt-0012".
export const formatReportId = (n) => `rpt-${String(n).padStart(4, '0')}`

// "rpt-0012" (any case) -> 12. Anything else -> null.
export function parseReportId(value) {
  const match = /^rpt-(\d{1,9})$/i.exec(typeof value === 'string' ? value.trim() : '')
  return match ? Number(match[1]) : null
}
