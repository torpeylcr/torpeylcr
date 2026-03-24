import { SAFETY } from '../../utils/cropSafetyFilter'

const CONFIG = {
  [SAFETY.SAFE]: {
    icon: '✅',
    label: 'Safe',
    className: 'text-green-700 bg-green-50',
  },
  [SAFETY.CAUTION]: {
    icon: '⚠️',
    label: 'Caution',
    className: 'text-amber-700 bg-amber-50',
  },
  [SAFETY.DAMAGE]: {
    icon: '🚫',
    label: 'WILL DAMAGE CROP',
    className: 'text-red-700 bg-red-50',
  },
  [SAFETY.UNKNOWN]: {
    icon: '❓',
    label: 'Unknown',
    className: 'text-gray-600 bg-gray-50',
  },
}

export function CropSafetyIndicator({ safetyLevel, compact = false }) {
  const config = CONFIG[safetyLevel] || CONFIG[SAFETY.UNKNOWN]

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${config.className}`}>
        {config.icon} {config.label}
      </span>
    )
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${config.className}`}>
      <span className="text-lg">{config.icon}</span>
      <span className="text-sm font-semibold">{config.label}</span>
    </div>
  )
}
