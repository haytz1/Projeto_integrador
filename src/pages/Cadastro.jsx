import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { supabase } from '../../supabase';
import '../css/cadastro.css';

function Cadastro() {

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

async function fazerCadastro(e) {
    e.preventDefault();

    if (!username || !email || !senha) {
        alert('Preencha todos os campos!');
        return;
    }

    const { error } = await supabase
        .from('usuarios')
        .insert({
            username: username,
            email: email,
            senha: senha,
            foto: ''
        });

    if (error) {
        console.log('ERRO DO SUPABASE:', error);
        alert('Erro ao cadastrar: ' + error.message);
        return;
    }

    console.log('USUÁRIO SALVO NO SUPABASE!');
    alert('Conta criada com sucesso!');
}
    return (
        <>
            <Navbar />
            <div className="stars" id="stars" aria-hidden="true"></div>

            <main className="page-wrapper">
                <div className="cadastro-card" role="main">

                    <div className="avatar-wrapper">
                        <div className="avatar-circle" id="avatar-circle" title="Clique para adicionar uma foto de perfil">
                            <div className="avatar-placeholder" id="avatar-placeholder">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <circle cx="12" cy="8" r="4" />
                                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                </svg>
                                <span>Foto</span>
                            </div>
                            <div className="avatar-overlay" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                            </div>
                        </div>
                        <input type="file" id="avatar-input" className="avatar-input" accept="image/*" aria-label="Selecionar foto de perfil" />
                    </div>

                    <h1 className="welcome-title">É rápido e grátis!</h1>

                    <form id="cadastro-form" noValidate onSubmit={fazerCadastro}>

                        <div className="form-group">
                            <label className="form-label" htmlFor="input-username">Username</label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    id="input-username"
                                    name="username"
                                    className="form-input"
                                    placeholder="Seu username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="input-email">E-mail</label>
                            <div className="input-wrapper">
                                <input
                                    type="email"
                                    id="input-email"
                                    name="email"
                                    className="form-input"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="input-senha">Senha</label>
                            <div className="input-wrapper">
                                <input
                                    type="password"
                                    id="input-senha"
                                    name="senha"
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary">Criar conta</button>

                        <div className="divider" aria-hidden="true">Ou</div>

                        <button type="button" className="btn btn-secondary">
                            Continuar com o Google
                        </button>

                        <div className="login-link-container">
                            <Link to="/Login" className="login-link">Já tem uma conta? Fazer login</Link>
                        </div>

                    </form>
                </div>
            </main>
        </>
    );
}

export default Cadastro;