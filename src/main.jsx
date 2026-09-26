import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // The game still works online if a browser blocks service workers.
    });
  });
}

// Every visit starts at "who is playing?" with a fresh screen history, so the
// first back press never lands on a stale screen from a previous visit.
window.history.replaceState({ depth: 0 }, '', `${window.location.pathname}${window.location.search}#/`);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
