import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import PaginaInicial from './pages/PaginaInicial'
import ObrasMangas from './pages/ObrasMangas';
import Historico from './pages/Historico'
import Leitura from './pages/Leitura';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Moedas from './pages/Moedas';
import Planos from './pages/Planos';
import Perfil from './pages/Perfil';
import Denuncias from './pages/Denuncias';
import Seguindo from './pages/Seguindo';
import Favoritos from './pages/Favoritos';
import Anime from './pages/Anime';

function App() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const originalAlert = window.alert;
        window.alert = (message) => {
            const id = Date.now() + Math.random();
            setToasts((prev) => [...prev, { id, message }]);
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 4000);
        };
        return () => {
            window.alert = originalAlert;
        };
    }, []);

    const removerToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <>
            <div style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: 9999999,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }}>
                {toasts.map((toast) => (
                    <div key={toast.id} style={{
                        background: '#15092e',
                        color: '#fff',
                        padding: '15px 20px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        borderLeft: '4px solid #a855f7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        minWidth: '280px',
                        maxWidth: '400px',
                        animation: 'slideInToast 0.3s ease-out',
                        gap: '15px',
                        fontFamily: "'Inter', sans-serif"
                    }}>
                        <span style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>{toast.message}</span>
                        <button 
                            onClick={() => removerToast(toast.id)}
                            style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.4rem' }}
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes slideInToast {
                    from { transform: translateX(120%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>

            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<PaginaInicial />} />
                    <Route path="/ObrasMangas" element={<ObrasMangas />} />
                    <Route path='/Leitura/:tituloObra' element={<Leitura />} />
                    <Route path="/Leitura" element={<Leitura />} />
                    <Route path='/leitura/:tituloObra' element={<Leitura/>} />
                    <Route path='/leitura' element={<Leitura/>} />
                    <Route path="/Historico" element={<Historico />} />
                    <Route path="/Login" element={<Login />} />
                    <Route path="/Cadastro" element={<Cadastro />} />
                    <Route path="/Moedas" element={<Moedas />} />
                    <Route path="/Planos" element={<Planos />} />
                    <Route path="/Perfil" element={<Perfil />} />
                    <Route path="/Perfil/:id" element={<Perfil />} />
                    <Route path='/Denuncias' element={<Denuncias/>} />
                    <Route path="/Seguindo" element={<Seguindo />} />
                    <Route path="/Favoritos" element={<Favoritos />} />
                    <Route path="/anime/:id" element={<Anime />} />
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default App;