function Perfil() {



    return (

        <>
            <nav class="navbar">
                <div class="nav-left">
                    <img src="imagens/logo_animespot.png" alt="Logo AnimeSpot" class="nav-logo-img" />
                    <a href="index.html" class="nav-logo-text">AnimeSpot</a>
                </div>
                <div class="nav-right">
                    <span>Já tem uma conta?</span>
                    <a href="cadastro.html" class="nav-login-link">Crie uma conta</a>
                </div>
            </nav>

            <main class="page-wrapper">
                <div class="profile-container">

                    <div class="profile-header-row">


                        <section class="user-info-section">
                            <div class="avatar-col">
                                <div class="avatar-circle">
                                    <i class="ph ph-user"></i>
                                </div>
                                <button class="edit-photo-btn"><i class="ph ph-pencil-simple"></i> Editar foto</button>
                            </div>
                            <div class="info-col">
                                <h2 class="section-title" style="margin-bottom: 0.5rem;">Perfil de usuário</h2>
                                <div class="info-item">
                                    <span class="info-label">Nome do usuario:</span>
                                    <span class="info-value">@usuario12</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">E-mail:</span>
                                    <span class="info-value">usuario1@gmail.com</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Data de cadastro:</span>
                                    <span class="info-value">12/08/2026</span>
                                </div>
                            </div>
                        </section>


                        <section class="plan-section">
                            <h2 class="section-title" style="margin-bottom: 0.5rem;">Plano atual</h2>
                            <div class="plan-coins">
                                <i class="ph-fill ph-coin"></i>
                                <i class="ph-fill ph-coin"></i>
                            </div>
                            <div class="plan-name">Plano 1</div>
                            <p class="plan-desc">Aproveite os recursos mais populares do nosso site.</p>
                            <a href="planos.html" class="plan-link">Ver planos</a>
                        </section>

                    </div>


                    <section class="preferences-section">
                        <h2 class="section-title">Preferências de animes</h2>
                        <p class="section-subtitle">Personalize sua experiência no site</p>

                        <div class="prefs-grid">

                            <div class="pref-col">
                                <h3 class="pref-title">Animes favoritos</h3>
                                <p class="pref-desc">Adicione os animes que você mais gosta.</p>
                                <div class="tags-container">
                                    <span class="tag">Naruto <button class="tag-remove">&times;</button></span>
                                    <span class="tag">One Piece <button class="tag-remove">&times;</button></span>
                                    <span class="tag">Attack on Titan <button class="tag-remove">&times;</button></span>
                                    <span class="tag">Haikyuu <button class="tag-remove">&times;</button></span>
                                </div>
                                <button class="btn-add">+ Adicionar</button>
                            </div>

                            <div class="pref-col">
                                <h3 class="pref-title">Gêneros favoritos</h3>
                                <p class="pref-desc">Selecione seus gêneros favoritos.</p>
                                <div class="tags-container">
                                    <span class="tag">Ação <button class="tag-remove">&times;</button></span>
                                    <span class="tag">Aventura <button class="tag-remove">&times;</button></span>
                                    <span class="tag">Drama <button class="tag-remove">&times;</button></span>
                                    <span class="tag">Fantasia <button class="tag-remove">&times;</button></span>
                                </div>
                                <button class="btn-add">+ Adicionar</button>
                            </div>

                            <div class="pref-col">
                                <h3 class="pref-title">Tags de interesse</h3>
                                <p class="pref-desc">Escolha as tags que mais te interessam.</p>
                                <div class="tags-container">
                                    <span class="tag">Shounen <button class="tag-remove">&times;</button></span>
                                    <span class="tag">Séries longas <button class="tag-remove">&times;</button></span>
                                    <span class="tag">Mundos fantásticos <button class="tag-remove">&times;</button></span>
                                </div>
                                <button class="btn-add">+ Adicionar</button>
                            </div>

                        </div>
                    </section>


                    <section class="security-section">
                        <h2 class="section-title"><i class="ph ph-shield-check"></i> Segurança da conta</h2>
                        <p class="pref-desc" style="margin-bottom: 0;">Mantenha sua conta segura.</p>

                        <div class="sec-buttons">
                            <button class="btn-sec btn-password">
                                <i class="ph ph-lock-key"></i> Alterar Senha
                            </button>
                            <button class="btn-sec btn-logout">
                                <i class="ph ph-door-open"></i> Sair da conta
                            </button>
                        </div>
                    </section>


                    <footer class="actions-footer">
                        <button class="btn-action btn-cancel">Cancelar</button>
                        <button class="btn-action btn-save">Salvar alterações</button>
                    </footer>

                </div>
            </main>
        </>

    );
}

export default Perfil;