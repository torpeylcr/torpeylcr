import { Card } from '../ui/Card'
import { SupplierBadge, Badge } from '../ui/Badge'
import { getFertilizerById } from '../../data/nzFertilizers'
import { nzSuppliers } from '../../data/nzSuppliers'

const PRIORITY_CONFIG = {
  1: { label: 'Urgent', color: 'red' },
  2: { label: 'Recommended', color: 'amber' },
  3: { label: 'Optional', color: 'green' },
}

export function FertilizerRecommendationCard({ recommendation }) {
  const product = getFertilizerById(recommendation.productId)
  if (!product) return null

  const supplier = nzSuppliers[product.supplier]
  const priorityConfig = PRIORITY_CONFIG[recommendation.priority] || PRIORITY_CONFIG[2]

  // Build nutrient summary string
  const nutrients = Object.entries(product.analysis)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `${k}: ${v}%`)
    .join(' | ')

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-green-900">{product.name}</h3>
          <p className="text-xs text-green-600">{product.brand}</p>
        </div>
        <Badge color={priorityConfig.color}>{priorityConfig.label}</Badge>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <SupplierBadge supplierId={product.supplier} />
        <Badge color="gray" >{product.type}</Badge>
      </div>

      {nutrients && (
        <div className="bg-green-50 rounded-xl px-3 py-2">
          <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-0.5">Analysis</p>
          <p className="text-sm text-green-900 font-mono">{nutrients}</p>
        </div>
      )}

      <div className="space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Rate</p>
            <p className="text-gray-700">{recommendation.rate}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Timing</p>
            <p className="text-gray-700">{recommendation.timing}</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Why</p>
          <p className="text-gray-700">{recommendation.rationale}</p>
        </div>

        {product.notes && (
          <p className="text-xs text-gray-500 italic">{product.notes}</p>
        )}
      </div>

      {supplier?.url && (
        <a
          href={supplier.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-green-600 underline"
        >
          View at {supplier.name} →
        </a>
      )}
    </Card>
  )
}
