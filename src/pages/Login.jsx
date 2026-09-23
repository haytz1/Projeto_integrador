import Navbar from '../components/Navbar';
import '../css/login.css'

function Login() {

    (function () {
        const c = document.getElementById('stars');
        for (let i = 0; i < 80; i++) {
            const s = document.createElement('div'); s.className = 'star';
            const sz = (Math.random() * 2.5 + .5).toFixed(1);
            s.style.cssText = `width:${sz}px;height:${sz}px;top:${(Math.random() * 100).toFixed(1)}%;left:${(Math.random() * 100).toFixed(1)}%;--dur:${(Math.random() * 4 + 2).toFixed(1)}s;--del:${(Math.random() * 6).toFixed(1)}s;--op:${(Math.random() * .5 + .2).toFixed(2)};`;
            c.appendChild(s);
        }
    })();

    const tb = document.getElementById('toggle-senha-btn');
    const si = document.getElementById('input-senha');
    const ei = document.getElementById('eye-icon');
    tb.addEventListener('click', function () {
        const ip = si.type === 'password'; si.type = ip ? 'text' : 'password';
        ei.innerHTML = ip
            ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>'
            : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
    });

    document.getElementById('login-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const em = document.getElementById('input-email').value.trim();
        const se = document.getElementById('input-senha').value;
        if (!em || !se) { alert('Por favor, preencha todos os campos.'); return; }
        alert('Login realizado com sucesso! Bem-vindo(a) ao AnimeSpot.');
    });

    document.getElementById('btn-criar-conta').addEventListener('click', function () {
        window.location.href = 'cadastro.html';
    });

    document.getElementById('link-esqueceu-senha').addEventListener('click', function (e) {
        e.preventDefault();
        alert('Funcionalidade de recuperação de senha em breve!');
    });

    const avatarCircle = document.getElementById('avatar-circle');
    const avatarInput = document.getElementById('avatar-input');
    const avatarImg = document.getElementById('avatar-img');
    const avatarPh = document.getElementById('avatar-placeholder');

    avatarCircle.addEventListener('click', function () { avatarInput.click(); });
    avatarInput.addEventListener('change', function () {
        const file = avatarInput.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (ev) {
            avatarImg.src = ev.target.result;
            avatarImg.style.display = 'block';
            avatarPh.style.display = 'none';
        };
        reader.readAsDataURL(file);
    });

    return (

        <>
        <Navbar/>
            <div class="stars" id="stars" aria-hidden="true"></div>


            <nav class="navbar" role="navigation" aria-label="Navegação principal">
                <div class="nav-left">
                    <img src="imagens/logo_animespot.png" alt="Logo AnimeSpot" class="nav-logo-img" id="nav-logo" />
                    <a href="index.html" class="nav-logo-text">AnimeSpot</a>
                </div>
                <div class="nav-right">
                    <span>Já tem uma conta?</span>
                    <a href="cadastro.html" class="nav-login-link" id="nav-fazer-login">Fazer login</a>
                </div>
            </nav>


            <main class="page-wrapper">
                <div class="login-card" role="main">


                    <div class="avatar-wrapper">
                        <div class="avatar-circle" id="avatar-circle" title="Clique para adicionar uma foto de perfil">
                            <img src="" alt="Foto de perfil" class="avatar-img" id="avatar-img" />
                            <div class="avatar-placeholder" id="avatar-placeholder">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                    <circle cx="12" cy="8" r="4" />
                                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                </svg>
                                <span>Foto</span>
                            </div>
                            <div class="avatar-overlay" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                            </div>
                        </div>
                        <input type="file" id="avatar-input" class="avatar-input" accept="image/*" aria-label="Selecionar foto de perfil" />
                    </div>

                    <h1 class="welcome-title">Boas vindas ao AnimeSpot</h1>
                    <p class="subtitle">Faça login para continuar:</p>

                    <form id="login-form" novalidate>


                        <div class="form-group">
                            <label class="form-label" for="input-email">E-mail</label>
                            <div class="input-wrapper">
                                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                    <rect x="2" y="4" width="20" height="16" rx="2" />
                                    <path d="m2 7 10 7 10-7" />
                                </svg>
                                <input type="email" id="input-email" name="email" class="form-input" placeholder="seu@email.com" autocomplete="email" required />
                            </div>
                        </div>


                        <div class="form-group">
                            <div class="senha-row">
                                <label class="form-label" for="input-senha" style="margin-bottom:0;">Senha</label>
                                <a href="#" class="forgot-link" id="link-esqueceu-senha">Esqueceu sua senha?</a>
                            </div>
                            <div class="input-wrapper">
                                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                    <rect x="3" y="11" width="18" height="11" rx="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                <input type="password" id="input-senha" name="senha" class="form-input" placeholder="••••••••" autocomplete="current-password" required />
                                <button type="button" class="toggle-senha" id="toggle-senha-btn" aria-label="Mostrar/ocultar senha">
                                    <svg id="eye-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <button type="submit" class="btn btn-primary" id="btn-entrar">Entrar</button>

                        <div class="divider" aria-hidden="true">Ou</div>

                        <button type="button" class="btn btn-secondary" id="btn-criar-conta">Criar uma conta</button>

                    </form>
                </div>
            </main>

        </>

    );
}

export default Login;