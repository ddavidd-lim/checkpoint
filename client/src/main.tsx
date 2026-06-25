import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { DarkModeProvider } from './context/theme-toggle/dark-mode-provider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DarkModeProvider>
      <App />
    </DarkModeProvider>
  </StrictMode>,
)
