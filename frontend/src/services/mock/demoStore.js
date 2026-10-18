// Local, per-browser storage for demo changes (new reports, read alerts, follow-up updates).
// Holds sample data only: never passwords, tokens or anything sensitive. Wrapped in try/catch because
// storage can be unavailable (private windows, blocked cookies); the demo then simply works in memory.
const KEY = 'cropshield_demo_v1'
let memory = {}

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {}
  } catch {
    return memory
  }
}

export function loadCollection(name, seed) {
  return read()[name] ?? seed
}

export function saveCollection(name, value) {
  const next = { ...read(), [name]: value }
  memory = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* in-memory fallback above */
  }
}

export function resetDemoData() {
  memory = {}
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* nothing to clear */
  }
}
