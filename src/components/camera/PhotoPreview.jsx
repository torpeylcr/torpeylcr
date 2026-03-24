import { Button } from '../ui/Button'

export function PhotoPreview({ dataUrl, onRetake, onConfirm, loading }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl overflow-hidden aspect-[4/3] w-full">
        <img src={dataUrl} alt="Captured plant" className="w-full h-full object-cover" />
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onRetake} disabled={loading} className="flex-1">
          Retake
        </Button>
        <Button onClick={onConfirm} disabled={loading} className="flex-1">
          {loading ? 'Identifying…' : 'Identify Plant'}
        </Button>
      </div>
    </div>
  )
}
