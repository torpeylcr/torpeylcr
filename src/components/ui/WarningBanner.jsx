export function WarningBanner({ children, level = 'warning' }) {
  const styles = {
    warning: 'bg-amber-50 border-amber-300 text-amber-900',
    danger: 'bg-red-50 border-red-300 text-red-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900',
  }
  const icons = {
    warning: '⚠️',
    danger: '🚫',
    info: 'ℹ️',
  }
  return (
    <div className={`flex gap-2 p-3 rounded-xl border ${styles[level]}`}>
      <span className="text-base mt-0.5 shrink-0">{icons[level]}</span>
      <div className="text-sm">{children}</div>
    </div>
  )
}

export function SuccessBanner({ children }) {
  return (
    <div className="flex gap-2 p-3 rounded-xl border bg-green-50 border-green-300 text-green-900">
      <span className="text-base mt-0.5 shrink-0">✅</span>
      <div className="text-sm">{children}</div>
    </div>
  )
}
