// One-command check of the whole backend: `npm run smoke` (the server must be running in another terminal).
// It creates throw-away test users (@smoke.test) and reports. It never touches your real data.
import 'dotenv/config'

const BASE = process.env.SMOKE_API_URL || `http://localhost:${process.env.PORT || 5000}/api`
const results = []
const check = (name, ok, detail = '') => {
  results.push(ok)
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `   <- ${detail}`}`)
}

// Tiny valid 1x1 PNG
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')

async function call(method, path, { cookie, json, form } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { ...(cookie && { Cookie: cookie }), ...(json && { 'Content-Type': 'application/json' }) },
    body: json ? JSON.stringify(json) : form,
  })
  const text = await res.text()
  let data = null
  try { data = JSON.parse(text) } catch { /* not JSON */ }
  const setCookie = res.headers.getSetCookie?.()[0]?.split(';')[0]
  return { status: res.status, data, cookie: setCookie, headers: res.headers }
}

const reportForm = (overrides = {}, file = { bytes: PNG, type: 'image/png', name: 'leaf.png' }) => {
  const fields = { crop: 'Tomato', variety: 'Roma', growthStage: 'Flowering', symptoms: JSON.stringify(['Brown or black spots']), notes: '', symptomStart: '2026-10-15', location: JSON.stringify({ lat: 19.12, lng: 72.85 }), ...overrides }
  const form = new FormData()
  for (const [k, v] of Object.entries(fields)) if (v !== undefined) form.append(k, v)
  if (file) form.append('image', new Blob([file.bytes], { type: file.type }), file.name)
  return form
}

const tag = Date.now()
const user = (n) => ({ name: `Smoke Farmer ${n}`, email: `smoke${n}-${tag}@smoke.test`, phone: '9876543210', password: 'Smoke1234' })

try {
  const health = await call('GET', '/health')
  check('server and database are up', health.status === 200 && health.data?.database === 'connected', `status ${health.status}`)

  const a = await call('POST', '/auth/register', { json: user('A') })
  const b = await call('POST', '/auth/register', { json: user('B') })
  check('farmers can register (role FARMER, no password returned)', a.status === 201 && a.data.user.role === 'FARMER' && !JSON.stringify(a.data).includes('assword'), `status ${a.status}`)
  check('registration cannot choose a role', (await call('POST', '/auth/register', { json: { ...user('C'), role: 'ADMIN' } })).data?.user?.role === 'FARMER')

  check('reports need login (401)', (await call('GET', '/reports')).status === 401)

  const created = await call('POST', '/reports', { cookie: a.cookie, form: reportForm() })
  const id = created.data?.report?.id
  check('farmer A creates a report with a photo (201)', created.status === 201 && /^rpt-\d{4}$/.test(id || ''), `status ${created.status} ${JSON.stringify(created.data)}`)
  check('report has an image URL (not stored in the database as bytes)', typeof created.data?.report?.imageUrl === 'string' && created.data.report.imageUrl.startsWith('http'))

  if (created.data?.report?.imageUrl?.includes('localhost')) {
    const img = await fetch(created.data.report.imageUrl)
    check('the saved photo can be downloaded', img.status === 200 && (img.headers.get('content-type') || '').startsWith('image/'), `status ${img.status}`)
  }

  // --- Phase E: prediction. In mock mode we expect a finished, clearly-labelled mock result.
  const mockMode = process.env.AI_MODE ? process.env.AI_MODE.toLowerCase() === 'mock' : !process.env.AI_SERVICE_URL
  const rep = created.data?.report
  if (mockMode) {
    check('mock mode: analysis completed and labelled "mock"', rep?.predictionStatus === 'Completed' && rep?.predictionSource === 'mock', `${rep?.predictionStatus} / ${rep?.predictionSource}`)
    check('result uses the frontend shape (issue, issueType, riskLevel)', typeof rep?.issue === 'string' && ['Disease', 'Pest', 'Healthy'].includes(rep?.issueType) && ['Low', 'Medium', 'High'].includes(rep?.riskLevel))
  } else {
    check('real AI mode: analysis finished or failed cleanly (report still saved)', ['Completed', 'Failed'].includes(rep?.predictionStatus), String(rep?.predictionStatus))
  }
  const det = await call('GET', `/reports/${id}/detection`, { cookie: a.cookie })
  check('detection endpoint matches the report and tells the truth about mock', det.status === 200 && det.data?.detection?.issue === rep?.issue && det.data?.detection?.isMock === (rep?.predictionSource === 'mock'), `status ${det.status}`)
  check('OWNERSHIP: farmer B cannot read the detection (404)', (await call('GET', `/reports/${id}/detection`, { cookie: b.cookie })).status === 404)
  if (rep?.predictionStatus === 'Completed') check('re-running a finished analysis is refused (409)', (await call('POST', `/reports/${id}/predict`, { cookie: a.cookie })).status === 409)

  check('report without a photo is rejected (400)', (await call('POST', '/reports', { cookie: a.cookie, form: reportForm({}, null) })).data?.errors?.image !== undefined)
  const fake = await call('POST', '/reports', { cookie: a.cookie, form: reportForm({}, { bytes: Buffer.from('this is not an image at all'), type: 'image/png', name: 'fake.png' }) })
  check('a fake image (text renamed .png) is rejected', fake.status === 400 && fake.data?.errors?.image !== undefined, `status ${fake.status}`)
  const bad = await call('POST', '/reports', { cookie: a.cookie, form: reportForm({ crop: 'Pizza' }) })
  check('invalid crop is rejected with a field error', bad.status === 400 && bad.data?.errors?.crop !== undefined)
  const big = await call('POST', '/reports', { cookie: a.cookie, form: reportForm({}, { bytes: Buffer.concat([PNG, Buffer.alloc(6 * 1024 * 1024)]), type: 'image/png', name: 'big.png' }) })
  check('image over 5 MB is rejected', big.status === 400 && big.data?.errors?.image !== undefined, `status ${big.status}`)

  const listA = await call('GET', '/reports', { cookie: a.cookie })
  check('farmer A sees their own report in the list', listA.data?.reports?.some((r) => r.id === id))

  check('OWNERSHIP: farmer B cannot open farmer A\'s report (404)', (await call('GET', `/reports/${id}`, { cookie: b.cookie })).status === 404)
  check('OWNERSHIP: farmer B cannot edit it (404)', (await call('PATCH', `/reports/${id}`, { cookie: b.cookie, json: { notes: 'hacked' } })).status === 404)
  check('OWNERSHIP: farmer B\'s list does not contain it', !(await call('GET', '/reports', { cookie: b.cookie })).data?.reports?.some((r) => r.id === id))

  const patch = await call('PATCH', `/reports/${id}`, { cookie: a.cookie, json: { notes: 'Updated by owner' } })
  check('owner can update notes', patch.status === 200 && patch.data?.report?.notes === 'Updated by owner')
  check('other fields cannot be updated (400)', (await call('PATCH', `/reports/${id}`, { cookie: a.cookie, json: { reviewStatus: 'VALIDATED' } })).status === 400)

  const demoPassword = process.env.SEED_DEMO_PASSWORD
  if (demoPassword) {
    const expert = await call('POST', '/auth/login', { json: { email: 'expert@demo.test', password: demoPassword } })
    check('expert can log in', expert.status === 200 && expert.data?.user?.role === 'EXPERT', `status ${expert.status} (did you run npm run seed?)`)
    check('expert can read a farmer\'s report', (await call('GET', `/reports/${id}`, { cookie: expert.cookie })).status === 200)
    check('expert cannot create reports (403)', (await call('POST', '/reports', { cookie: expert.cookie, form: reportForm() })).status === 403)
  } else console.log('SKIP  expert checks (SEED_DEMO_PASSWORD not set in .env)')
} catch (err) {
  const cause = err.cause?.code || err.cause?.message // e.g. ECONNREFUSED (server down) or ECONNRESET (server restarted mid-request)
  check('test run finished without crashing', false, cause ? `${err.message} (${cause}). Look at the server terminal for an error or a restart.` : err.message)
}

const failed = results.filter((ok) => !ok).length
console.log(`\n${results.length - failed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)
