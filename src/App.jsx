import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabase';
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
import Notificacoes from './pages/Notificacoes';
import Sobre from './pages/Sobre';
import NaoEncontrada from './pages/NaoEncontrada';

// Toda vez que troca de página, volta para o topo.
// (sem isso a página nova abria já rolada, na posição da anterior)
// Links com # (ex.: /Sobre#faq) ficam por conta da própria página.
function RolarParaTopo() {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (!hash) {
            window.scrollTo(0, 0);
        }
    }, [pathname, hash]);

    return null;
}

// Só deixa entrar na página se o usuário estiver logado.
// Se não estiver, manda para a tela de Login.
function RotaProtegida({ children }) {
    const [carregando, setCarregando] = useState(true);
    const [logado, setLogado] = useState(false);

    useEffect(() => {
        async function verificarLogin() {
            const { data } = await supabase.auth.getSession();
            if (data.session == null) {
                alert('Faça login para acessar essa página.');
            }
            setLogado(data.session != null);
            setCarregando(false);
        }
        verificarLogin();
    }, []);

    if (carregando) {
        return null;
    }

    if (!logado) {
        return <Navigate to="/Login" replace />;
    }

    return children;
}

// Descobre o tipo do aviso pelo texto da mensagem, assim nenhuma página
// precisa mudar: alert('...com sucesso') fica verde, alert('Erro...') vermelho.
const ESTILO_TOAST = {
    sucesso: { cor: '#22c55e', icone: 'ph-check-circle' },
    erro: { cor: '#ef4444', icone: 'ph-x-circle' },
    aviso: { cor: '#a855f7', icone: 'ph-info' }
};

function tipoDoToast(message) {
    const texto = String(message).toLowerCase();
    if (texto.startsWith('erro') || texto.includes('não foi possível') || texto.includes('ocorreu um erro')) {
        return 'erro';
    }
    if (texto.includes('sucesso')) {
        return 'sucesso';
    }
    return 'aviso';
}

function App() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const originalAlert = window.alert;
        window.alert = (message) => {
            const id = Date.now() + Math.random();
            const tipo = tipoDoToast(message);
            setToasts((prev) => [...prev, { id, message, tipo }]);
            // Erros ficam mais tempo na tela para dar tempo de ler
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, tipo === 'erro' ? 6000 : 4000);
        };
        return () => {
            window.alert = originalAlert;
        };
    }, []);

    const removerToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    // Confirmação na tela (substitui o window.confirm).
    // Uso: const confirmou = await window.confirmarNaTela('Tem certeza?');
    const [confirmacao, setConfirmacao] = useState(null);

    useEffect(() => {
        window.confirmarNaTela = (mensagem) => {
            return new Promise((resolve) => {
                setConfirmacao({ mensagem, resolve });
            });
        };
        return () => {
            delete window.confirmarNaTela;
        };
    }, []);

    const responderConfirmacao = (resposta) => {
        confirmacao.resolve(resposta);
        setConfirmacao(null);
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
                        borderLeft: `4px solid ${ESTILO_TOAST[toast.tipo].cor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        minWidth: '260px',
                        maxWidth: 'min(400px, calc(100vw - 40px))',
                        animation: 'slideInToast 0.3s ease-out',
                        gap: '15px',
                        fontFamily: "'Inter', sans-serif"
                    }}>
                        <i className={`ph ${ESTILO_TOAST[toast.tipo].icone}`} style={{ color: ESTILO_TOAST[toast.tipo].cor, fontSize: '1.4rem', flexShrink: 0 }}></i>
                        <span style={{ fontSize: '0.95rem', lineHeight: '1.4', flex: 1 }}>{toast.message}</span>
                        <button 
                            onClick={() => removerToast(toast.id)}
                            style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.4rem' }}
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>

            {/* Janela de confirmação (no lugar do window.confirm) */}
            {confirmacao && (
                <div
                    onClick={() => responderConfirmacao(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        zIndex: 9999998,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: '#15092e',
                            color: '#fff',
                            border: '1px solid rgba(168, 85, 247, 0.5)',
                            boxShadow: '0 0 30px rgba(168, 85, 247, 0.3)',
                            borderRadius: '14px',
                            padding: '24px',
                            width: '100%',
                            maxWidth: '420px',
                            animation: 'aparecerConfirmacao 0.2s ease-out',
                            fontFamily: "'Inter', sans-serif"
                        }}
                    >
                        <p style={{ margin: '0 0 20px', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                            {confirmacao.mensagem}
                        </p>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => responderConfirmacao(false)}
                                style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #555', background: 'transparent', color: '#ddd', cursor: 'pointer', fontWeight: 600 }}
                            >
                                Cancelar
                            </button>
                            <button
                                autoFocus
                                onClick={() => responderConfirmacao(true)}
                                style={{ padding: '10px 18px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideInToast {
                    from { transform: translateX(120%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes aparecerConfirmacao {
                    from { transform: scale(0.92); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>

            <BrowserRouter>
                <RolarParaTopo />
                <Routes>
                    
                    <Route path="/" element={<PaginaInicial />} />
                    <Route path="/ObrasMangas" element={<ObrasMangas />} />
                    <Route path='/Leitura/:tituloObra' element={<Leitura />} />
                    <Route path="/Leitura" element={<Leitura />} />
                    <Route path="/Login" element={<Login />} />
                    <Route path="/Cadastro" element={<Cadastro />} />
                    <Route path="/Planos" element={<Planos />} />
                    <Route path="/Perfil/:id" element={<Perfil />} />
                    <Route path="/anime/:id" element={<Anime />} />
                    <Route path="/Sobre" element={<Sobre />} />

                    {/* Páginas que precisam de login */}
                    <Route path="/Historico" element={<RotaProtegida><Historico /></RotaProtegida>} />
                    <Route path="/Moedas" element={<RotaProtegida><Moedas /></RotaProtegida>} />
                    <Route path="/Perfil" element={<RotaProtegida><Perfil /></RotaProtegida>} />
                    <Route path='/Denuncias' element={<RotaProtegida><Denuncias /></RotaProtegida>} />
                    <Route path="/Seguindo" element={<RotaProtegida><Seguindo /></RotaProtegida>} />
                    <Route path="/Favoritos" element={<RotaProtegida><Favoritos /></RotaProtegida>} />
                    <Route path="/Notificacoes" element={<RotaProtegida><Notificacoes /></RotaProtegida>} />

                    {/* Qualquer endereço que não existe */}
                    <Route path="*" element={<NaoEncontrada />} />
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default App;