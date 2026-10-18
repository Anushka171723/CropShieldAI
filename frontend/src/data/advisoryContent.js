// GENERAL, cautious sample advisory text for the frontend demo. This is deliberately generic guidance,
// not a treatment plan: no pesticide names, brands or dosages are included. An agriculture expert must
// confirm any action before it is treated as advice. Replace with a real advisory/RAG service later.
const GENERAL_MEASURES = {
  Disease: [
    'Keep the affected area clean: remove fallen leaves and plant debris where fungal spores can survive.',
    'Avoid working in the field when leaves are wet, as this can spread disease between plants.',
    'Rotate crops where possible rather than planting the same crop in the same spot every season.',
    'Use disease-free seed or seedlings for your next planting.',
  ],
  Pest: [
    'Check plants regularly, especially the undersides of leaves and new growth.',
    'Keep field borders free of weeds that can host pests between seasons.',
    'Encourage natural predators (birds, ladybirds, spiders) by avoiding unnecessary spraying.',
    'Rotate crops to break the pest\u2019s life cycle where possible.',
  ],
  Healthy: [
    'Continue your current watering and nutrition routine; it appears to be working well.',
    'Keep inspecting the crop weekly so any new symptoms are caught early.',
    'Record what you are doing now so you can repeat it next season.',
  ],
}

const NEXT_STEPS = {
  Pending: [
    'Wait for an agriculture expert to review this report before taking major action.',
    'Keep photographing the affected area every 2–3 days so changes are visible.',
    'Avoid applying any chemical treatment until the finding is confirmed.',
  ],
  Validated: [
    'Follow the general preventive measures below while monitoring the crop closely.',
    'Contact your local agriculture extension office for a treatment plan suited to your field.',
    'Add a follow-up update once you see a change, improved or worsened.',
  ],
  Corrected: [
    'Review the expert\u2019s corrected finding carefully; it may differ from the AI result.',
    'Follow the general preventive measures below while monitoring the crop closely.',
    'Contact your local agriculture extension office for guidance specific to the corrected finding.',
  ],
}

export const ADVISORY_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
]

// Only English copy exists today; other languages fall back to English with a clear notice. This keeps
// the language selector usable in the UI now, ready to be filled in once real translations exist.
export function buildAdvisory(report) {
  return {
    generalMeasures: GENERAL_MEASURES[report.issueType] || GENERAL_MEASURES.Disease,
    nextSteps: NEXT_STEPS[report.reviewStatus] || NEXT_STEPS.Pending,
    safeCareNote:
      'This guidance is general crop-care information for awareness only. It is not a substitute for an on-site visit, a lab test or a licensed agriculture expert\u2019s recommendation, and it does not include any product names or dosages.',
    reviewStatus: report.reviewStatus,
  }
}
