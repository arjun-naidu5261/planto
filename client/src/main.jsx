import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Cleanly migrate legacy hash URLs (e.g. /#/ or /#/ai) to standard HTML5 clean pathname
if (window.location.hash && window.location.hash.startsWith('#/')) {
  const cleanPath = window.location.hash.replace(/^#\/?/, '/') || '/';
  window.history.replaceState(null, '', cleanPath);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
