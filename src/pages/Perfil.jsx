import '../css/perfil.css'

function Perfil() {

    return (

        <>

        <Navbar/>

            <main className="page-wrapper">
                <div className="profile-container">

                    <div className="profile-header-row">


                        <section className="user-info-section">
                            <div className="avatar-col">
                                <div className="avatar-circle">
                                    <i className="ph ph-user"></i>
                                </div>
                                <button className="edit-photo-btn"><i className="ph ph-pencil-simple"></i> Editar foto</button>
                            </div>
                            <div className="info-col">
                                <h2 className="section-title" style="margin-bottom: 0.5rem;">Perfil de usuário</h2>
                                <div className="info-item">
                                    <span className="info-label">Nome do usuario:</span>
                                    <span className="info-value">@usuario12</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">E-mail:</span>
                                    <span className="info-value">usuario1@gmail.com</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Data de cadastro:</span>
                                    <span className="info-value">12/08/2026</span>
                                </div>
                            </div>
                        </section>


                        <section className="plan-section">
                            <h2 className="section-title" style="margin-bottom: 0.5rem;">Plano atual</h2>
                            <div className="plan-coins">
                                <i className="ph-fill ph-coin"></i>
                                <i className="ph-fill ph-coin"></i>
                            </div>
                            <div className="plan-name">Plano 1</div>
                            <p className="plan-desc">Aproveite os recursos mais populares do nosso site.</p>
                            <Link to="/Planos" className="plan-link">Ver planos</Link>
                        </section>

                    </div>


                    <section className="preferences-section">
                        <h2 className="section-title">Preferências de animes</h2>
                        <p className="section-subtitle">Personalize sua experiência no site</p>

                        <div className="prefs-grid">

                            <div className="pref-col">
                                <h3 className="pref-title">Animes favoritos</h3>
                                <p className="pref-desc">Adicione os animes que você mais gosta.</p>
                                <div className="tags-container">
                                    <span className="tag">Naruto <button className="tag-remove">&times;</button></span>
                                    <span className="tag">One Piece <button className="tag-remove">&times;</button></span>
                                    <span className="tag">Attack on Titan <button className="tag-remove">&times;</button></span>
                                    <span className="tag">Haikyuu <button className="tag-remove">&times;</button></span>
                                </div>
                                <button className="btn-add">+ Adicionar</button>
                            </div>

                            <div className="pref-col">
                                <h3 className="pref-title">Gêneros favoritos</h3>
                                <p className="pref-desc">Selecione seus gêneros favoritos.</p>
                                <div className="tags-container">
                                    <span className="tag">Ação <button className="tag-remove">&times;</button></span>
                                    <span className="tag">Aventura <button className="tag-remove">&times;</button></span>
                                    <span className="tag">Drama <button className="tag-remove">&times;</button></span>
                                    <span className="tag">Fantasia <button className="tag-remove">&times;</button></span>
                                </div>
                                <button className="btn-add">+ Adicionar</button>
                            </div>

                            <div className="pref-col">
                                <h3 className="pref-title">Tags de interesse</h3>
                                <p className="pref-desc">Escolha as tags que mais te interessam.</p>
                                <div className="tags-container">
                                    <span className="tag">Shounen <button className="tag-remove">&times;</button></span>
                                    <span className="tag">Séries longas <button className="tag-remove">&times;</button></span>
                                    <span className="tag">Mundos fantásticos <button className="tag-remove">&times;</button></span>
                                </div>
                                <button className="btn-add">+ Adicionar</button>
                            </div>

                        </div>
                    </section>


                    <section className="security-section">
                        <h2 className="section-title"><i className="ph ph-shield-check"></i> Segurança da conta</h2>
                        <p className="pref-desc" style="margin-bottom: 0;">Mantenha sua conta segura.</p>

                        <div className="sec-buttons">
                            <button className="btn-sec btn-password">
                                <i className="ph ph-lock-key"></i> Alterar Senha
                            </button>
                            <button className="btn-sec btn-logout">
                                <i className="ph ph-door-open"></i> Sair da conta
                            </button>
                        </div>
                    </section>


                    <footer className="actions-footer">
                        <button className="btn-action btn-cancel">Cancelar</button>
                        <button className="btn-action btn-save">Salvar alterações</button>
                    </footer>

                </div>
            </main>
        </>

    );
}

export default Perfil;