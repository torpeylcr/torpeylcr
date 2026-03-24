import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/weed-id', label: 'Weed ID', icon: CameraIcon },
  { to: '/fertilizer', label: 'Fertilizer', icon: FlaskIcon },
  { to: '/profile', label: 'My Crops', icon: CropIcon },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-green-100 safe-bottom z-50 md:hidden">
      <div className="flex">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
                isActive ? 'text-green-700' : 'text-gray-500'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon active={isActive} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

function HomeIcon({ active }) {
  return (
    <svg className={`w-6 h-6 ${active ? 'fill-green-700' : 'fill-gray-400'}`} viewBox="0 0 24 24">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  )
}

function CameraIcon({ active }) {
  return (
    <svg className={`w-6 h-6 ${active ? 'fill-green-700' : 'fill-gray-400'}`} viewBox="0 0 24 24">
      <path d="M12 15.2A3.2 3.2 0 1 0 12 8.8a3.2 3.2 0 0 0 0 6.4Z" />
      <path d="M9 2 7.17 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3.17L15 2H9Zm3 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z" />
    </svg>
  )
}

function FlaskIcon({ active }) {
  return (
    <svg className={`w-6 h-6 ${active ? 'fill-green-700' : 'fill-gray-400'}`} viewBox="0 0 24 24">
      <path d="M14.5 2.5c0 1.5-1.5 3-1.5 3H11S9.5 4 9.5 2.5a2.5 2.5 0 0 1 5 0ZM9 7h6l3.5 10c.4 1-.2 2-1.2 2H6.7c-1 0-1.6-1-1.2-2L9 7Z" />
    </svg>
  )
}

function CropIcon({ active }) {
  return (
    <svg className={`w-6 h-6 ${active ? 'fill-green-700' : 'fill-gray-400'}`} viewBox="0 0 24 24">
      <path d="M17 8C8 10 5.9 16.17 3.82 21L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2 0-1.5.1-3.5 3-4.5C14 0 12 3 12 3S14 4.5 12 6c0 0 1.5 2-3 2h-1.5C9 6 11 5 11 5S7 4.5 7 8c-2 0-4 1-4 2s2 2 2 2 1-1.5 3-1.5c0 2 2 3 4 2-1-2.5.5-5 2-4Z" />
    </svg>
  )
}
