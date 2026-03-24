import { useNavigate } from 'react-router-dom'

export function PageHeader({ title, subtitle, showBack = false, action }) {
  const navigate = useNavigate()
  return (
    <header className="flex items-center gap-3 px-4 pt-4 pb-2">
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-green-100 text-green-800 hover:bg-green-200 transition-colors shrink-0"
          aria-label="Go back"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-bold text-green-900 leading-tight">{title}</h1>
        {subtitle && <p className="text-sm text-green-600 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  )
}
