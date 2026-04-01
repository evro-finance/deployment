import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ResearchPage } from './pages/ResearchPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ResearchPage />
  </StrictMode>,
)
