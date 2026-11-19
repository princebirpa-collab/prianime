import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Suppress the browser's standard right-click context menu on the site.
// This is only a UI restriction; it does not disable DevTools or protect client code.
document.addEventListener('contextmenu', (event) => {
  event.preventDefault()
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
