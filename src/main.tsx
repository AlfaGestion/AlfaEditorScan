import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/libre-barcode-128-text/index.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
