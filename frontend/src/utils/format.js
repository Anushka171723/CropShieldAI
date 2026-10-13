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
