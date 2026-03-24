import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh gap-4 px-6 text-center">
      <p className="text-5xl">🌿</p>
      <h1 className="text-2xl font-bold text-green-900">Page not found</h1>
      <p className="text-green-600">This paddock doesn't exist.</p>
      <Link to="/">
        <Button>Back to Home</Button>
      </Link>
    </div>
  )
}
