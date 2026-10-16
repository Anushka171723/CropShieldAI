// SIMULATED risk-assessment logic for the frontend demo only. Combines the report's (simulated) detection
// with sample weather to produce contributing factors and preventive actions. Replace with a real call to
// the risk-prediction service once it exists; callers only need the same return shape.
const PREVENTIVE_ACTIONS = {
  Disease: [
    'Remove and destroy visibly infected leaves to slow spread.',
    'Avoid overhead watering; water at the base of the plant in the morning.',
    'Improve airflow between plants by spacing or light pruning.',
    'Ask your local agriculture office before applying any fungicide.',
  ],
  Pest: [
    'Inspect the undersides of leaves regularly for eggs or nymphs.',
    'Introduce or protect natural predators where possible.',
    'Use yellow sticky traps to monitor flying pest activity.',
    'Ask your local agriculture office before applying any pesticide.',
  ],
  Healthy: [
    'Continue regular field inspection, especially after rain.',
    'Keep monitoring weather conditions for sudden humidity or temperature shifts.',
    'Maintain balanced watering and nutrition for steady growth.',
  ],
}

function weatherFactor(weather) {
  const factors = []
  if (weather.humidity >= 70) factors.push({ label: 'High humidity', detail: `${weather.humidity}% humidity can favour fungal growth.`, weight: 'High' })
  else if (weather.humidity >= 55) factors.push({ label: 'Moderate humidity', detail: `${weather.humidity}% humidity gives some disease pressure.`, weight: 'Medium' })
  else factors.push({ label: 'Low humidity', detail: `${weather.humidity}% humidity is less favourable for fungal disease.`, weight: 'Low' })

  if (weather.rainfallMm >= 10) factors.push({ label: 'Recent rainfall', detail: `${weather.rainfallMm} mm of rain can keep leaves wet longer.`, weight: 'Medium' })
  if (weather.temperatureC >= 26 && weather.temperatureC <= 32) factors.push({ label: 'Warm temperature', detail: `${weather.temperatureC}°C is within the range many pests and fungi prefer.`, weight: 'Medium' })
  return factors
}

// report: a saved report record (seed or demo-submitted). weather: sample weather for the farm.
// Returns { riskLevel, factors, weatherContext, explanation, preventiveActions, lastUpdated }.
export function buildRiskAssessment(report, weather) {
  const factors = [...weatherFactor(weather)]
  if (report.issueType !== 'Healthy') {
    factors.unshift({ label: `${report.issueType} detected`, detail: `The AI result for this report was "${report.issue}".`, weight: report.riskLevel })
  }
  if (report.symptoms?.length > 1) {
    factors.push({ label: 'Multiple symptoms reported', detail: `${report.symptoms.length} symptoms were noted, which can indicate faster spread.`, weight: 'Medium' })
  }

  const explanation =
    report.riskLevel === 'High'
      ? `Risk is High mainly because the detected ${report.issueType.toLowerCase()} combines with current weather conditions that favour its spread. Acting early reduces the chance of it affecting nearby plants.`
      : report.riskLevel === 'Medium'
        ? `Risk is Medium: the finding is worth monitoring, and current weather conditions give it a moderate chance of worsening if left unchecked.`
        : `Risk is Low: no strong combination of symptoms and weather conditions was found that would favour rapid spread right now.`

  return {
    riskLevel: report.riskLevel,
    factors,
    weatherContext: weather,
    explanation,
    preventiveActions: PREVENTIVE_ACTIONS[report.issueType] || PREVENTIVE_ACTIONS.Disease,
    lastUpdated: new Date().toISOString(),
  }
}
