import { nzCrops, cropsByCategory, categoryLabels } from '../../data/nzCrops'

export function CropSelector({ selectedCropId, onSelect }) {
  return (
    <div className="space-y-4">
      {Object.entries(cropsByCategory).map(([category, crops]) => (
        <div key={category}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-green-600 mb-2 px-1">
            {categoryLabels[category]}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {crops.map((crop) => {
              const isSelected = crop.id === selectedCropId
              return (
                <button
                  key={crop.id}
                  onClick={() => onSelect(crop.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-left transition-all active:scale-95 ${
                    isSelected
                      ? 'border-green-600 bg-green-50 text-green-900'
                      : 'border-green-100 bg-white text-green-800 hover:border-green-300'
                  }`}
                >
                  <span className="text-xl">{crop.icon}</span>
                  <span className="text-sm font-medium leading-tight">{crop.displayName}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
