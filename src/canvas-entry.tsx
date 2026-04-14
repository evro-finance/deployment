import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CanvasPage } from './pages/CanvasPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CanvasPage />
  </StrictMode>,
)
