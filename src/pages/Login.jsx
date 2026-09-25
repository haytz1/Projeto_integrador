import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '/supabase'; 
import '../css/login.css';

function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [carregando, setCarregando] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!email || !senha) {
            alert('Preencha o e-mail e a senha!');
            return;
        }

        setCarregando(true);

        try {
            // Procura o utilizador na tabela personalizada 'usuarios' do Supabase
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

            // Guarda os dados no localStorage para o site reconhecer quem está logado
            localStorage.setItem('usuario_email', usuario.email);
            localStorage.setItem('usuario_id', usuario.id);
            localStorage.setItem('usuario_nome', usuario.username); // Opcional para exibir o nome

            alert('Login efetuado com sucesso!');
            navigate('/ObrasMangas'); // Redireciona para a página de obras

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
                                <input 
                                    type="email" 
                                    id="input-email" 
                                    className="form-input" 
                                    placeholder="seu@email.com" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required 
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="senha-row">
                                <label className="form-label" htmlFor="input-senha" style={{ marginBottom: 0 }}>Senha</label>
                            </div>
                            <div className="input-wrapper">
                                <input 
                                    type="password" 
                                    id="input-senha" 
                                    className="form-input" 
                                    placeholder="••••••••" 
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