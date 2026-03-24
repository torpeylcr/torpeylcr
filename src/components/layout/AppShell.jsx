import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'

export function AppShell() {
  return (
    <div className="flex flex-col min-h-dvh max-w-lg mx-auto w-full">
      {/* Main scrollable content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-4">
        <Outlet />
      </main>

      {/* Bottom navigation (mobile only) */}
      <BottomNav />
    </div>
  )
}
