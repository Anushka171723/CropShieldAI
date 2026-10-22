// A tiny STAND-IN for the real FastAPI AI service, so you can test the backend's real HTTP path (and its failure
// handling) before the real models exist. It is simulated: it uses the same symptom rules as mock mode.
//   node scripts/mock-ai-service.mjs                      -> answers correctly on http://localhost:8000
//   MOCK_AI_BEHAVIOR=error node scripts/mock-ai-service.mjs  -> always answers 500
//   MOCK_AI_BEHAVIOR=bad   ...                            -> answers with an invalid body
//   MOCK_AI_BEHAVIOR=slow  ...                            -> never answers in time (tests the timeout)
import http from 'node:http'
import { predictMock } from '../src/services/ai/mockPredictor.js'

const PORT = Number(process.env.MOCK_AI_PORT) || 8000
const BEHAVIOR = process.env.MOCK_AI_BEHAVIOR || 'ok'

http
  .createServer((req, res) => {
    const send = (status, body) => {
      res.writeHead(status, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(body))
    }
    if (req.method === 'GET' && req.url === '/health') return send(200, { status: 'ok', behavior: BEHAVIOR })
    if (req.method !== 'POST' || req.url !== '/predict') return send(404, { detail: 'Not found' })

    let raw = ''
    req.on('data', (chunk) => (raw += chunk))
    req.on('end', () => {
      let payload
      try { payload = JSON.parse(raw) } catch { return send(422, { detail: 'Invalid JSON' }) }
      console.log(`[stand-in AI] ${payload.reportId} crop=${payload.crop} symptoms=${(payload.symptoms || []).join(', ')} image=${payload.imageUrl}`)
      if (BEHAVIOR === 'error') return send(500, { detail: 'Simulated failure' })
      if (BEHAVIOR === 'bad') return send(200, { disease: 123, riskLevel: 'Extreme' })
      if (BEHAVIOR === 'slow') return setTimeout(() => send(200, predictMock(payload)), 120000)
      send(200, { ...predictMock(payload), modelVersion: 'stand-in-service-v1' })
    })
  })
  .listen(PORT, () => console.log(`Stand-in AI service (behavior: ${BEHAVIOR}) on http://localhost:${PORT}`))
