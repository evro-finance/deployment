import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import IlluGallery from './illu/IlluGallery'

const isIlluRoute = window.location.pathname === '/illu';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isIlluRoute ? <IlluGallery /> : <App />}
  </StrictMode>,
)
