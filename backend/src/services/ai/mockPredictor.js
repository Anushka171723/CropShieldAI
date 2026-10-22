// MOCK PREDICTOR: NOT real AI. It does not look at the photo. It matches the symptoms the farmer ticked against a small
// table, so the demo flow works while the real model is being built. Results are stored with source = MOCK and the API
// reports them as mock, so they can never be mistaken for real inference.
// Takes the same request the real AI service would receive and returns the same response shape.
const RULES = [
  { symptom: 'White powdery coating', disease: 'Powdery mildew', pest: null, confidence: 0.86 },
  { symptom: 'Curled leaves', disease: 'Leaf curl virus', pest: 'Whitefly', confidence: 0.79 },
  { symptom: 'Sticky leaves', disease: null, pest: 'Whitefly', confidence: 0.81 },
  { symptom: 'Visible insects', disease: null, pest: 'Aphid', confidence: 0.83 },
  { symptom: 'Brown or black spots', disease: 'Early blight', pest: null, confidence: 0.88 },
  { symptom: 'Yellowing leaves', disease: 'Nutrient stress or early blight', pest: null, confidence: 0.68 },
  { symptom: 'Holes in leaves', disease: null, pest: 'Caterpillar', confidence: 0.74 },
  { symptom: 'Wilting', disease: 'Fusarium wilt', pest: null, confidence: 0.71 },
  { symptom: 'Fruit rot or damage', disease: null, pest: 'Fruit borer', confidence: 0.77 },
  { symptom: 'Stunted growth', disease: null, pest: 'Thrips', confidence: 0.65 },
]

// Same report id -> same result every time (so a page refresh never changes the numbers).
const seedFrom = (text) => [...text].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 0)

export function predictMock({ reportId, symptoms = [] }) {
  const rule = symptoms.map((s) => RULES.find((r) => r.symptom === s)).find(Boolean)
  const base = rule?.confidence ?? 0.9
  const confidence = Number(Math.min(0.97, Math.max(0.42, base + ((seedFrom(reportId) % 13) - 6) / 100)).toFixed(2))

  if (!rule) return { disease: null, diseaseConfidence: confidence, pest: null, pestConfidence: null, riskLevel: 'Low', modelVersion: 'mock-rules-v1' }

  return {
    disease: rule.disease,
    diseaseConfidence: rule.disease ? confidence : null,
    pest: rule.pest,
    pestConfidence: rule.pest ? Number((rule.disease ? confidence - 0.1 : confidence).toFixed(2)) : null,
    riskLevel: confidence >= 0.82 ? 'High' : confidence >= 0.7 ? 'Medium' : 'Low',
    modelVersion: 'mock-rules-v1',
  }
}
