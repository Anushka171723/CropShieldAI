import { env } from '../../config/env.js'

// Sends the request to the separate FastAPI AI service and returns its raw JSON (validated afterwards).
// Gives up after AI_TIMEOUT_MS so a slow or dead AI service can never hang the farmer's request.
export async function predictViaService(payload) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), env.ai.timeoutMs)
  try {
    const res = await fetch(`${env.ai.url}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(env.ai.apiKey && { 'X-API-Key': env.ai.apiKey }) },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`AI service answered with status ${res.status}`)
    return await res.json()
  } catch (err) {
    if (err.name === 'AbortError') throw new Error(`AI service did not answer within ${env.ai.timeoutMs} ms`)
    throw new Error(`AI service request failed: ${err.cause?.code || err.message}`)
  } finally {
    clearTimeout(timer)
  }
}
