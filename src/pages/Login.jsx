import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Link, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import '../css/login.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [carregando, setCarregando] = useState(false);
    const navigate = useNavigate();

    // Função executada ao enviar o formulário de login
    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!email || !senha) {
            alert('Preencha o e-mail e a senha!');
            return;
        }

        setCarregando(true);

        try {
            // Procura na tabela 'usuarios' se existe um registro com esse e-mail e senha
            const { data: usuario, error } = await supabase
                .from('usuarios')
                .select('*')
                .eq('email', email)
                .eq('senha', senha)
                .single();

            if (error || !usuario) {
                alert('E-mail ou senha incorretos!');
                setCarregando(false);
                return;
            }

            // Salva no localStorage para a Navbar e o Perfil reconhecerem quem está logado
            localStorage.setItem('usuario_email', usuario.email);
            localStorage.setItem('usuario_id', usuario.id);

            // Redireciona para a página de perfil
            navigate('/Perfil');

        } catch (err) {
            console.error('Erro no login:', err.message);
            alert('Ocorreu um erro ao tentar fazer login.');
        } finally {
            setCarregando(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="stars" id="stars" aria-hidden="true"></div>

            <main className="page-wrapper">
                <div className="login-card" role="main">

                    <h1 className="welcome-title">Boas vindas ao AnimeSpot</h1>
                    <p className="subtitle">Faça login para continuar:</p>

                    <form id="login-form" onSubmit={handleLogin} noValidate>

                        <div className="form-group">
                            <label className="form-label" htmlFor="input-email">E-mail</label>
                            <div className="input-wrapper">
                                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <rect x="2" y="4" width="20" height="16" rx="2" />
                                    <path d="m2 7 10 7 10-7" />
                                </svg>
                                <input 
                                    type="email" 
                                    id="input-email" 
                                    name="email" 
                                    className="form-input" 
                                    placeholder="seu@email.com" 
                                    autoComplete="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required 
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="senha-row">
                                <label className="form-label" htmlFor="input-senha" style={{ marginBottom: 0 }}>Senha</label>
                                <a href="#" className="forgot-link" id="link-esqueceu-senha">Esqueceu sua senha?</a>
                            </div>
                            <div className="input-wrapper">
                                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <rect x="3" y="11" width="18" height="11" rx="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                <input 
                                    type="password" 
                                    id="input-senha" 
                                    name="senha" 
                                    className="form-input" 
                                    placeholder="••••••••" 
                                    autoComplete="current-password" 
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    required 
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" id="btn-entrar" disabled={carregando}>
                            {carregando ? 'Entrando...' : 'Entrar'}
                        </button>

                        <div className="divider" aria-hidden="true">Ou</div>

                        <Link to="/Cadastro" className="btn btn-secondary" id="btn-criar-conta" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textDecoration: 'none' }}>
                            Criar uma conta
                        </Link>

                    </form>
                </div>
            </main>
        </>
    );
}

export default Login;