import Navbar from '../components/Navbar';
import '../css/cadastro.css'

function Cadastro() {
   

    (function () {
        const c = document.getElementById('stars');
        for (let i = 0; i < 80; i++) {
            const s = document.createElement('div'); s.className = 'star';
            const sz = (Math.random() * 2.5 + .5).toFixed(1);
            s.style.cssText = `width:${sz}px;height:${sz}px;top:${(Math.random() * 100).toFixed(1)}%;left:${(Math.random() * 100).toFixed(1)}%;--dur:${(Math.random() * 4 + 2).toFixed(1)}s;--del:${(Math.random() * 6).toFixed(1)}s;--op:${(Math.random() * .5 + .2).toFixed(2)};`;
            c.appendChild(s);
        }
    })();

    document.getElementById('cadastro-form').addEventListener('submit', function (e) {
        e.preventDefault();
        alert('Cadastro realizado com sucesso! Bem-vindo(a) ao AnimeSpot.');
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


            <nav className="navbar" role="navigation" aria-label="Navegação principal">
                <div className="nav-left">
                    <img src="imagens/logo_animespot.png" alt="Logo AnimeSpot" className="nav-logo-img" id="nav-logo" />
                    <Link to="/" className="nav-logo-text">AnimeSpot</Link>
                </div>
                <div className="nav-right">
                    <span>Já tem uma conta?</span>
                    <Link to="/Login" className="nav-login-link">Fazer login</Link>
                </div>
            </nav>


            <main className="page-wrapper">
                <div className="cadastro-card" role="main">


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

                    <h1 className="welcome-title">É rápido é grátis!</h1>

                    <form id="cadastro-form" novalidate>

                        <div className="form-group">
                            <label className="form-label" for="input-email">E-mail</label>
                            <div className="input-wrapper">
                                <input type="email" id="input-email" name="email" className="form-input" placeholder="seu@email.com" required />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" for="input-senha">Senha</label>
                            <div className="input-wrapper">
                                <input type="password" id="input-senha" name="senha" className="form-input" placeholder="••••••••" required />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" for="input-confirmar-senha">Confirmar senha</label>
                            <div className="input-wrapper">
                                <input type="password" id="input-confirmar-senha" name="confirmar_senha" className="form-input" placeholder="••••••••" required />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Data de nascimento (opcional)</label>
                            <div className="select-group">
                                <select className="form-select" id="select-dia" aria-label="Dia">
                                    <option value="" disabled selected>Dia</option>
                                    <option value="01">01</option><option value="02">02</option><option value="03">03</option><option value="04">04</option><option value="05">05</option><option value="06">06</option><option value="07">07</option><option value="08">08</option><option value="09">09</option><option value="10">10</option>
                                    <option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option>
                                    <option value="21">21</option><option value="22">22</option><option value="23">23</option><option value="24">24</option><option value="25">25</option><option value="26">26</option><option value="27">27</option><option value="28">28</option><option value="29">29</option><option value="30">30</option><option value="31">31</option>
                                </select>
                                <select className="form-select" id="select-mes" aria-label="Mês">
                                    <option value="" disabled selected>Mês</option>
                                    <option value="01">Jan</option><option value="02">Fev</option><option value="03">Mar</option><option value="04">Abr</option>
                                    <option value="05">Mai</option><option value="06">Jun</option><option value="07">Jul</option><option value="08">Ago</option>
                                    <option value="09">Set</option><option value="10">Out</option><option value="11">Nov</option><option value="12">Dez</option>
                                </select>
                                <select className="form-select" id="select-ano" aria-label="Ano">
                                    <option value="" disabled selected>Ano</option>
                                    <option value="2010">2010</option><option value="2009">2009</option><option value="2008">2008</option><option value="2007">2007</option>
                                    <option value="2006">2006</option><option value="2005">2005</option><option value="2004">2004</option><option value="2003">2003</option>
                                    <option value="2002">2002</option><option value="2001">2001</option><option value="2000">2000</option><option value="1999">1999</option>
                                    <option value="1998">1998</option><option value="1997">1997</option><option value="1996">1996</option><option value="1995">1995</option>
                                </select>
                            </div>
                        </div>

                        <div className="checkbox-wrapper">
                            <input type="checkbox" id="check-newsletter" className="checkbox-input" />
                            <label for="check-newsletter" className="checkbox-label">Quero receber novidades, dicas e ofertas do anime spot</label>
                        </div>

                        <button type="submit" className="btn btn-primary">Criar conta</button>

                        <div className="divider" aria-hidden="true">Ou</div>

                        <button type="button" className="btn btn-secondary">
                            <svg className="btn-social-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continuar com o Google
                        </button>

                        <button type="button" className="btn btn-secondary">
                            <svg className="btn-social-icon" viewBox="0 0 384 512" fill="currentColor" style="color: #ffffff;">
                                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                            </svg>
                            Continuar com a Apple
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