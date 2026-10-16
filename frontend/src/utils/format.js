export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export const formatPercent = (value) => `${Math.round(value * 100)}%`

export function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diff / 36e5)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return days === 1 ? 'Yesterday' : `${days} days ago`
}

// "Due today", "Due in 3 days" or "Overdue by 2 days", worked out in whole calendar days.
export function dueLabel(iso) {
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const days = Math.round((startOfDay(new Date(iso)) - startOfDay(new Date())) / 864e5)
  if (days === 0) return { text: 'Due today', overdue: false, days }
  if (days > 0) return { text: `Due in ${days} day${days === 1 ? '' : 's'}`, overdue: false, days }
  return { text: `Overdue by ${-days} day${days === -1 ? '' : 's'}`, overdue: true, days }
}
