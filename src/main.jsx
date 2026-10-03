import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { startupNavigation } from './navigation.js'

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // The game still works online if a browser blocks service workers.
    });
  });
}

// Preserve a reload's known route and related lesson history. Fresh visits
// start with player selection; App also guards screens without a chosen child.
const navigationType = window.performance.getEntriesByType('navigation')[0]?.type;
const startup = startupNavigation(window.location.hash, window.history.state, navigationType);
window.history.replaceState(startup.state, '', `${window.location.pathname}${window.location.search}${startup.hash}`);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
