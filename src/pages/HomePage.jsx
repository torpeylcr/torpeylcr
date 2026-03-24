import { Link } from 'react-router-dom'
import { useCropProfile } from '../hooks/useCropProfile'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { WarningBanner } from '../components/ui/WarningBanner'

const quickActions = [
  {
    to: '/weed-id',
    icon: '📷',
    title: 'Identify a Weed',
    subtitle: 'Take a photo for AI identification',
    color: 'from-green-600 to-green-700',
  },
  {
    to: '/fertilizer',
    icon: '🧪',
    title: 'Fertilizer Advice',
    subtitle: 'Enter soil test for recommendations',
    color: 'from-teal-600 to-teal-700',
  },
  {
    to: '/profile',
    icon: '🌾',
    title: 'Set My Crop',
    subtitle: 'Manage your crop profile',
    color: 'from-emerald-600 to-emerald-700',
  },
]

export function HomePage() {
  const { activeCrop } = useCropProfile()

  return (
    <div className="px-4 py-4 space-y-5 pb-6">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-2xl font-extrabold text-green-900">NZ Agronomy</h1>
        <p className="text-sm text-green-600 mt-0.5">AI-powered advice for NZ farmers</p>
      </div>

      {/* Active crop banner */}
      {activeCrop ? (
        <Card className="p-4 flex items-center gap-3 bg-gradient-to-r from-green-700 to-green-800 border-0">
          <span className="text-3xl">{activeCrop.icon}</span>
          <div className="flex-1 text-white">
            <p className="text-xs font-semibold opacity-80 uppercase tracking-wide">Current Crop</p>
            <p className="font-bold text-lg leading-tight">{activeCrop.displayName}</p>
          </div>
          <Link to="/profile">
            <span className="text-white/70 text-xs underline">Change</span>
          </Link>
        </Card>
      ) : (
        <Link to="/profile">
          <WarningBanner level="info">
            <strong>No crop selected.</strong> Tap here to set your active crop for personalised spray
            and fertilizer advice.
          </WarningBanner>
        </Link>
      )}

      {/* Quick actions */}
      <div className="space-y-3">
        <h2 className="font-bold text-green-900">Quick Actions</h2>
        {quickActions.map(({ to, icon, title, subtitle, color }) => (
          <Link to={to} key={to}>
            <Card className={`p-4 flex items-center gap-4 bg-gradient-to-r ${color} border-0 text-white`}>
              <span className="text-3xl">{icon}</span>
              <div>
                <p className="font-bold">{title}</p>
                <p className="text-sm opacity-80">{subtitle}</p>
              </div>
              <svg className="w-5 h-5 ml-auto opacity-60" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Card>
          </Link>
        ))}
      </div>

      {/* Crop weed list */}
      {activeCrop?.commonWeeds && (
        <Card className="p-4 space-y-2">
          <h3 className="font-bold text-green-900 text-sm">
            Common Weeds in {activeCrop.displayName}
          </h3>
          <div className="flex flex-wrap gap-2">
            {activeCrop.commonWeeds.map((weed) => (
              <span key={weed} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                {weed}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 text-center px-4">
        This app is a free advisory tool for NZ farmers. Always read product labels. Consult
        a registered agronomist for large-scale decisions.
      </p>
    </div>
  )
}
