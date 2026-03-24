import { useState } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { CropSelector } from '../components/profile/CropSelector'
import { CropProfileCard } from '../components/profile/CropProfileCard'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { WarningBanner } from '../components/ui/WarningBanner'
import { useCropProfile } from '../hooks/useCropProfile'
import { getCropById } from '../data/nzCrops'

export function CropProfilePage() {
  const { activeCrop, activeCropId, savedCrops, setActiveCrop, saveCropProfile, removeCropProfile } =
    useCropProfile()
  const [selecting, setSelecting] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [paddockName, setPaddockName] = useState('')

  function handleStartSelect() {
    setSelecting(true)
    setSelectedId(activeCropId)
    setPaddockName('')
  }

  function handleSave() {
    if (selectedId) {
      saveCropProfile(selectedId, paddockName)
      setSelecting(false)
      setSelectedId(null)
      setPaddockName('')
    }
  }

  const previewCrop = selectedId ? getCropById(selectedId) : null

  return (
    <div className="px-4 py-2 space-y-4 pb-6">
      <PageHeader
        title="My Crops"
        subtitle="Set your active crop for tailored advice"
      />

      {/* Active crop summary */}
      {activeCrop && !selecting && (
        <Card className="p-4 flex items-center gap-3 bg-green-50 border-green-200">
          <span className="text-3xl">{activeCrop.icon}</span>
          <div className="flex-1">
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Active Crop</p>
            <p className="font-bold text-green-900">{activeCrop.displayName}</p>
          </div>
        </Card>
      )}

      {!activeCrop && !selecting && (
        <WarningBanner level="info">
          No active crop set. Select a crop to get crop-safe spray and fertilizer recommendations.
        </WarningBanner>
      )}

      {/* Add crop button */}
      {!selecting && (
        <Button onClick={handleStartSelect} className="w-full">
          {activeCrop ? '🌱 Change Active Crop' : '🌱 Select a Crop'}
        </Button>
      )}

      {/* Crop selector */}
      {selecting && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-green-900">Select Crop</h2>
            <button
              onClick={() => { setSelecting(false); setSelectedId(null) }}
              className="text-sm text-green-600 underline"
            >
              Cancel
            </button>
          </div>

          <CropSelector selectedCropId={selectedId} onSelect={setSelectedId} />

          {selectedId && previewCrop && (
            <Card className="p-4 space-y-3">
              <p className="text-sm font-semibold text-green-900">
                {previewCrop.icon} {previewCrop.displayName}
              </p>
              <div>
                <label className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                  Paddock name (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. North paddock"
                  value={paddockName}
                  onChange={(e) => setPaddockName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-green-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <Button onClick={handleSave} className="w-full">
                Save &amp; Set as Active
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* Saved crops */}
      {savedCrops.length > 0 && !selecting && (
        <div className="space-y-3">
          <h2 className="font-bold text-green-900">Saved Crops</h2>
          {savedCrops.map((profile) => (
            <CropProfileCard
              key={profile.id}
              profile={profile}
              isActive={profile.cropId === activeCropId}
              onActivate={setActiveCrop}
              onRemove={removeCropProfile}
            />
          ))}
        </div>
      )}

      {/* Soil test targets */}
      {activeCrop && !selecting && (
        <Card className="p-4 space-y-3">
          <h3 className="font-bold text-green-900 text-sm">
            📊 Soil Test Targets — {activeCrop.displayName}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(activeCrop.soilTestTargets).map(([key, target]) => (
              <div key={key} className="bg-green-50 rounded-xl px-3 py-2">
                <p className="text-xs font-bold text-green-700">{key}</p>
                <p className="text-sm text-green-900">
                  Opt: {target.optimum}{target.units ? ` ${target.units}` : ''}
                </p>
                <p className="text-xs text-green-500">
                  {target.min}–{target.max || '+'}{target.units ? ` ${target.units}` : ''}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
