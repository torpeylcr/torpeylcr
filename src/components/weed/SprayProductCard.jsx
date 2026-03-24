import { Card } from '../ui/Card'
import { SupplierBadge } from '../ui/Badge'
import { CropSafetyIndicator } from './CropSafetyIndicator'
import { nzSuppliers } from '../../data/nzSuppliers'

export function SprayProductCard({ product, showSafety = true }) {
  const supplier = nzSuppliers[product.supplier]

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-green-900">{product.name}</h3>
          <p className="text-xs text-green-600 mt-0.5">{product.activeIngredient}</p>
        </div>
        {showSafety && product.safetyLevel && (
          <CropSafetyIndicator safetyLevel={product.safetyLevel} compact />
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <SupplierBadge supplierId={product.supplier} />
        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
          {product.mode}
        </span>
      </div>

      <div className="space-y-1.5 text-sm">
        <div>
          <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Target weeds</span>
          <p className="text-gray-700 mt-0.5">{product.targetWeeds.join(', ')}</p>
        </div>
        <div className="flex gap-4">
          <div>
            <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Rate</span>
            <p className="text-gray-700">{product.applicationRate}</p>
          </div>
          {product.witholdingPeriod && (
            <div>
              <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">WHP</span>
              <p className="text-gray-700">{product.witholdingPeriod}</p>
            </div>
          )}
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
