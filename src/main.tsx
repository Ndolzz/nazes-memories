import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/index.css'

// Selesaikan trik redirect dari public/404.html (GitHub Pages tidak
// mendukung SPA routing native). Jika ada path tersimpan, ganti URL browser
// ke path itu sebelum React Router membaca lokasi saat ini.
const redirect = sessionStorage.getItem('naze:redirect')
if (redirect) {
  sessionStorage.removeItem('naze:redirect')
  window.history.replaceState(null, '', redirect)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
