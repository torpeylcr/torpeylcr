import { getCropById } from '../../data/nzCrops'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

const categoryColors = {
  livestock: 'green',
  arable: 'amber',
  horticultural: 'blue',
}

export function CropProfileCard({ profile, isActive, onActivate, onRemove }) {
  const crop = getCropById(profile.cropId)
  if (!crop) return null

  return (
    <Card className={`p-4 transition-all ${isActive ? 'ring-2 ring-green-500' : ''}`}>
      <div className="flex items-start gap-3">
        <span className="text-3xl">{crop.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-green-900 text-base">{crop.displayName}</h3>
            {isActive && <Badge color="green">Active</Badge>}
            <Badge color={categoryColors[crop.category] || 'gray'}>{crop.category}</Badge>
          </div>
          {profile.paddockName && (
            <p className="text-sm text-green-600 mt-0.5">📍 {profile.paddockName}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Saved {new Date(profile.savedAt).toLocaleDateString('en-NZ')}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        {!isActive && (
          <Button size="sm" onClick={() => onActivate(profile.cropId)} className="flex-1">
            Set Active
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => onRemove(profile.id)} className="text-red-600 hover:bg-red-50">
          Remove
        </Button>
      </div>
    </Card>
  )
}
