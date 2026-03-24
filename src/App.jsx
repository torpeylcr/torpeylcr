import { Routes, Route } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { HomePage } from './pages/HomePage'
import { WeedIdentPage } from './pages/WeedIdentPage'
import { FertilizerPage } from './pages/FertilizerPage'
import { CropProfilePage } from './pages/CropProfilePage'
import { NotFoundPage } from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="weed-id" element={<WeedIdentPage />} />
        <Route path="fertilizer" element={<FertilizerPage />} />
        <Route path="profile" element={<CropProfilePage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
