export function LoadingSpinner({ message = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <div className="w-10 h-10 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
      <p className="text-green-800 text-sm font-medium">{message}</p>
    </div>
  )
}
