import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { SprayProductList } from './SprayProductList'
import { getRelevantHerbicides } from '../../utils/cropSafetyFilter'

const CONFIDENCE_COLORS = {
  high: 'green',
  medium: 'amber',
  low: 'gray',
}

export function PlantIdentificationResult({ result, activeCrop, capturedImage }) {
  const { safe, caution, damage, all } = getRelevantHerbicides(result.commonName, activeCrop?.id)

  return (
    <div className="space-y-4">
      {/* Identity card */}
      <Card className="p-4 space-y-3">
        <div className="flex gap-3">
          {capturedImage && (
            <img
              src={capturedImage}
              alt="Identified plant"
              className="w-20 h-20 object-cover rounded-xl shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h2 className="text-lg font-bold text-green-900">{result.commonName}</h2>
                <p className="text-sm text-green-600 italic">{result.scientificName}</p>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                <Badge color={CONFIDENCE_COLORS[result.confidence] || 'gray'}>
                  {result.confidence} confidence
                </Badge>
                {result.isWeed && <Badge color="red">Weed</Badge>}
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-700">{result.description}</p>

        {result.cropSafetyNotes && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs font-semibold text-amber-700 mb-1">Crop Safety Note</p>
            <p className="text-sm text-amber-900">{result.cropSafetyNotes}</p>
          </div>
        )}

        {result.controlMethods?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1.5">
              Non-Chemical Control
            </p>
            <ul className="space-y-1">
              {result.controlMethods.map((m, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-green-500 shrink-0">•</span>
                  {m}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* Spray products */}
      <div>
        <h2 className="text-base font-bold text-green-900 mb-3 px-1">
          🧴 Recommended Spray Products
        </h2>
        <SprayProductList
          safe={safe}
          caution={caution}
          damage={damage}
          all={all}
          activeCrop={activeCrop}
          weedName={result.commonName}
        />
      </div>
    </div>
  )
}
