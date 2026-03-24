import { FertilizerRecommendationCard } from './FertilizerRecommendationCard'
import { Card } from '../ui/Card'

export function FertilizerRecommendationList({ result }) {
  const { summary, recommendations, generalAdvice } = result

  const sorted = [...(recommendations || [])].sort((a, b) => a.priority - b.priority)

  return (
    <div className="space-y-4">
      {summary && (
        <Card className="p-4 bg-green-50 border-green-200">
          <p className="text-xs font-bold uppercase tracking-wide text-green-700 mb-1.5">Soil Assessment</p>
          <p className="text-sm text-green-900">{summary}</p>
        </Card>
      )}

      <div className="space-y-3">
        {sorted.map((rec, i) => (
          <FertilizerRecommendationCard key={`${rec.productId}-${i}`} recommendation={rec} />
        ))}
      </div>

      {generalAdvice && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-xs font-bold uppercase tracking-wide text-blue-700 mb-1.5">General Advice</p>
          <p className="text-sm text-blue-900">{generalAdvice}</p>
        </Card>
      )}

      <p className="text-xs text-gray-400 text-center px-4">
        AI recommendations are indicative only. Consult your local agronomist before applying.
      </p>
    </div>
  )
}
