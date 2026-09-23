import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './css/index.css'
import App from './App.jsx'
import ObrasMangas from './ObrasMangas.jsx'
import Historico from './Historico.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<App />} />
            <Route path="/ObrasMangas" element={<ObrasMangas />} />
            <Route path="/Historico" element={<Historico />} />
        </Routes>
    </BrowserRouter>
    
  </StrictMode>,
)
