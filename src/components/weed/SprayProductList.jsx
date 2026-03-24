import { useState } from 'react'
import { SprayProductCard } from './SprayProductCard'
import { WarningBanner } from '../ui/WarningBanner'

export function SprayProductList({ safe, caution, damage, all = [], activeCrop, weedName }) {
  const [showDamage, setShowDamage] = useState(false)

  const total = safe.length + caution.length + damage.length

  // No crop set — show all relevant products ungrouped
  if (!activeCrop) {
    if (all.length === 0) {
      return (
        <div className="text-center py-8 text-green-600 text-sm">
          No matching herbicide products found for this weed.
        </div>
      )
    }
    return (
      <div className="space-y-4">
        <WarningBanner level="info">
          <strong>Select your crop</strong> on the My Crops tab to see crop-safe grouping for these products.
        </WarningBanner>
        <div className="space-y-3">
          {all.map((p) => <SprayProductCard key={p.id} product={p} showSafety={false} />)}
        </div>
      </div>
    )
  }

  if (total === 0) {
    return (
      <div className="text-center py-8 text-green-600 text-sm">
        No matching herbicide products found for this weed.
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Banner only shown when crop is set but no safe products */}
      {safe.length === 0 && (
        <WarningBanner level="warning">
          No products safe for {activeCrop.displayName} found for this weed. Consider non-chemical control methods.
        </WarningBanner>
      )}

      {/* Safe products */}
      {safe.length > 0 && (
        <section>
          <h3 className="flex items-center gap-2 font-bold text-green-700 mb-3">
            <span>✅</span>
            Safe to use on {activeCrop?.displayName} ({safe.length})
          </h3>
          <div className="space-y-3">
            {safe.map((p) => <SprayProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Caution products */}
      {caution.length > 0 && (
        <section>
          <h3 className="flex items-center gap-2 font-bold text-amber-700 mb-3">
            <span>⚠️</span>
            Use with caution ({caution.length})
          </h3>
          <div className="space-y-3">
            {caution.map((p) => <SprayProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Damage products */}
      {damage.length > 0 && activeCrop && (
        <section>
          <button
            onClick={() => setShowDamage(!showDamage)}
            className="w-full flex items-center justify-between font-bold text-red-700 mb-2"
          >
            <span className="flex items-center gap-2">
              <span>🚫</span>
              WILL DAMAGE {activeCrop.displayName} — DO NOT USE ({damage.length})
            </span>
            <span className="text-xs font-normal text-red-500">{showDamage ? 'Hide' : 'Show'}</span>
          </button>

          {showDamage && (
            <div className="space-y-3 opacity-70">
              {damage.map((p) => <SprayProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>
      )}

    </div>
  )
}
