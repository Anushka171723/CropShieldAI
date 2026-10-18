// SIMULATED detection rules for the frontend demo only. No image is actually analysed: a crop + the
// symptoms the farmer selected are matched against this table to produce a plausible-looking result.
// Replace with a real call to the AI service once it exists; callers only need the same return shape.
const RULES = [
  { symptom: 'White powdery coating', issue: 'Powdery mildew', issueType: 'Disease', pest: null, baseConfidence: 0.86 },
  { symptom: 'Curled leaves', issue: 'Leaf curl virus', issueType: 'Disease', pest: 'Whitefly', baseConfidence: 0.79 },
  { symptom: 'Sticky leaves', issue: 'Whitefly infestation', issueType: 'Pest', pest: 'Whitefly', baseConfidence: 0.81 },
  { symptom: 'Visible insects', issue: 'Aphid infestation', issueType: 'Pest', pest: 'Aphid', baseConfidence: 0.83 },
  { symptom: 'Brown or black spots', issue: 'Early blight', issueType: 'Disease', pest: null, baseConfidence: 0.88 },
  { symptom: 'Yellowing leaves', issue: 'Nutrient stress or early blight', issueType: 'Disease', pest: null, baseConfidence: 0.68 },
  { symptom: 'Holes in leaves', issue: 'Leaf-eating caterpillar', issueType: 'Pest', pest: 'Caterpillar', baseConfidence: 0.74 },
  { symptom: 'Wilting', issue: 'Fusarium wilt', issueType: 'Disease', pest: null, baseConfidence: 0.71 },
  { symptom: 'Fruit rot or damage', issue: 'Fruit borer damage', issueType: 'Pest', pest: 'Fruit borer', baseConfidence: 0.77 },
  { symptom: 'Stunted growth', issue: 'Thrips damage', issueType: 'Pest', pest: 'Thrips', baseConfidence: 0.65 },
]

const FALLBACK = { issue: 'No clear issue found', issueType: 'Healthy', pest: null, baseConfidence: 0.9 }

// A short, stable hash of the report id so the same report always produces the same "random" offset
// instead of the confidence score changing every time the page is viewed.
function seedFrom(id) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return h
}

function riskFromConfidence(confidence, issueType) {
  if (issueType === 'Healthy') return 'Low'
  if (confidence >= 0.82) return 'High'
  if (confidence >= 0.7) return 'Medium'
  return 'Low'
}

// Deterministic, SIMULATED disease/pest classification based on the symptoms the farmer picked.
// Returns the same shape every time: { issue, issueType, pest, confidence, riskLevel, matchedSymptom }.
export function runSimulatedDetection({ id, crop, symptoms = [] }) {
  const seed = seedFrom(id || crop || 'demo')
  const match = symptoms.map((s) => RULES.find((r) => r.symptom === s)).find(Boolean)
  const picked = match || FALLBACK

  // Small deterministic jitter (+/- 6%) so results look natural without being random on every render.
  const jitter = ((seed % 13) - 6) / 100
  const confidence = Math.min(0.97, Math.max(0.42, picked.baseConfidence + jitter))

  return {
    issue: picked === FALLBACK ? picked.issue : `${picked.issue} (${crop})`,
    issueType: picked.issueType,
    pest: picked.pest,
    confidence: Number(confidence.toFixed(2)),
    riskLevel: riskFromConfidence(confidence, picked.issueType),
    matchedSymptom: match ? picked.symptom : null,
  }
}
