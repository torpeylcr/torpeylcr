export function FormField({ label, unit, hint, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-semibold text-green-900">
          {label}
          {unit && <span className="font-normal text-green-600 ml-1">({unit})</span>}
        </label>
        {hint && !error && (
          <span className="text-xs text-green-600">{hint}</span>
        )}
      </div>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function TextInput({ error, ...props }) {
  return (
    <input
      className={`w-full px-3 py-2 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 ${
        error ? 'border-red-400' : 'border-green-200'
      }`}
      {...props}
    />
  )
}
