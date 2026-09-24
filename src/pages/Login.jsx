import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import '../css/login.css'


function Login() {


    return (

        <>
        <Navbar/>
            <div class="stars" id="stars" aria-hidden="true"></div>


            <nav className="navbar" role="navigation" aria-label="Navegação principal">
                <div className="nav-left">
                    <img src="imagens/logo_animespot.png" alt="Logo AnimeSpot" className="nav-logo-img" id="nav-logo" />
                    <Link to="/" className="nav-logo-text">AnimeSpot</Link>
                </div>
                <div className="nav-right">
                    <span>Já tem uma conta?</span>
                    <Link to="/Cadastro" className="nav-login-link" id="nav-fazer-login">Fazer login</Link>
                </div>
            </nav>


            <main className="page-wrapper">
                <div className="login-card" role="main">


                    <div className="avatar-wrapper">
                        <div className="avatar-circle" id="avatar-circle" title="Clique para adicionar uma foto de perfil">
                            <img src="" alt="Foto de perfil" className="avatar-img" id="avatar-img" />
                            <div className="avatar-placeholder" id="avatar-placeholder">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                    <circle cx="12" cy="8" r="4" />
                                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                </svg>
                                <span>Foto</span>
                            </div>
                            <div className="avatar-overlay" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                            </div>
                        </div>
                        <input type="file" id="avatar-input" className="avatar-input" accept="image/*" aria-label="Selecionar foto de perfil" />
                    </div>

                    <h1 className="welcome-title">Boas vindas ao AnimeSpot</h1>
                    <p className="subtitle">Faça login para continuar:</p>

                    <form id="login-form" novalidate>


                        <div className="form-group">
                            <label className="form-label" for="input-email">E-mail</label>
                            <div className="input-wrapper">
                                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                    <rect x="2" y="4" width="20" height="16" rx="2" />
                                    <path d="m2 7 10 7 10-7" />
                                </svg>
                                <input type="email" id="input-email" name="email" className="form-input" placeholder="seu@email.com" autocomplete="email" required />
                            </div>
                        </div>


                        <div className="form-group">
                            <div className="senha-row">
                                <label className="form-label" htmlFor="input-senha" style={{ marginBottom: 0 }}>Senha</label>
{/* Criar uma página ou modal para isso */} <a href="#" className="forgot-link" id="link-esqueceu-senha">Esqueceu sua senha?</a>
                            </div>
                            <div className="input-wrapper">
                                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                    <rect x="3" y="11" width="18" height="11" rx="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                <input type="password" id="input-senha" name="senha" className="form-input" placeholder="••••••••" autocomplete="current-password" required />
                                <button type="button" className="toggle-senha" id="toggle-senha-btn" aria-label="Mostrar/ocultar senha">
                                    <svg id="eye-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" id="btn-entrar">Entrar</button>

                        <div className="divider" aria-hidden="true">Ou</div>

                        <Link to="/Cadastro" className="btn btn-secondary" id="btn-criar-conta" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textDecoration: 'none' }}>Criar uma conta</Link>

                    </form>
                </div>
            </main>

        </>

    );
}

export default Login;