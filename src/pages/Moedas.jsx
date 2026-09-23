import '../css/moedas.css'

function Moedas() {



    return (

    

        <>

            <Navbar/>

            <main className="container">

                
                <header className="coins-header">
                    <h1 className="main-title">Comprar moedas</h1>
                    <p>Adquira suas moedas e aproveite mais vantagens no site</p>
                </header>

                
                <section className="coins-grid">

                    
                    <article className="coin-card">
                        <div className="coin-header">
                            <div className="coin-icon">
                                <i className="ph ph-coin"></i>
                            </div>
                            <h2>50 Moedas</h2>
                            <div className="coin-price">
                                <span className="currency">R$</span>
                                <span className="amount">5,00</span>
                            </div>
                        </div>
                        <div className="coin-body">
                            <ul className="coin-features">
                                <li><i className="ph ph-check-circle"></i> Desbloquear 1 capítulo extra</li>
                                <li><i className="ph ph-check-circle"></i> Apoiar seu autor favorito</li>
                                <li><i className="ph ph-check-circle"></i> Badge de apoiador iniciante</li>
                            </ul>
                            <button className="btn-cta btn-coin">Comprar 50 Moedas</button>
                        </div>
                    </article>

                    
                    <article className="coin-card coin-featured">
                        <div className="featured-badge">Mais Popular</div>
                        <div className="coin-header">
                            <div className="coin-icon">
                                <i className="ph ph-coins"></i>
                            </div>
                            <h2>100 Moedas</h2>
                            <div className="coin-price">
                                <span className="currency">R$</span>
                                <span className="amount">10,00</span>
                            </div>
                        </div>
                        <div className="coin-body">
                            <ul className="coin-features">
                                <li><i className="ph ph-check-circle"></i> Desbloquear 2 capítulos ou 1 episódio</li>
                                <li><i className="ph ph-check-circle"></i> Apoiar autores favoritos</li>
                                <li><i className="ph ph-check-circle"></i> Badge de apoiador intermediário</li>
                            </ul>
                            <button className="btn-cta btn-coin">Comprar 100 Moedas</button>
                        </div>
                    </article>

                    
                    <article className="coin-card">
                        <div className="coin-header">
                            <div className="coin-icon">
                                <i className="ph ph-money"></i>
                            </div>
                            <h2>150 Moedas</h2>
                            <div className="coin-price">
                                <span className="currency">R$</span>
                                <span className="amount">15,00</span>
                            </div>
                        </div>
                        <div className="coin-body">
                            <ul className="coin-features">
                                <li><i className="ph ph-check-circle"></i> Desbloquear 3 capítulos ou 2 episódios</li>
                                <li><i className="ph ph-check-circle"></i> Apoiar autores favoritos</li>
                                <li><i className="ph ph-check-circle"></i> Badge de apoiador premium</li>
                                <li><i className="ph ph-check-circle"></i> Destaque nos comentários</li>
                            </ul>
                            <button className="btn-cta btn-coin">Comprar 150 Moedas</button>
                        </div>
                    </article>

                </section>

            </main>

            
            <footer className="site-footer">
                <div className="footer-container">
                    <div className="footer-about">
                        <h3 className="site-logo" style="margin:0;">Anime Spot</h3>
                        <p>O seu destino final para ler e descobrir os melhores animes, mangás e autores em um só lugar.</p>
                    </div>
                    <div className="footer-links">
                        <h4>Navegação</h4>
                        <ul>
                            <li><Link to="/">Início</Link></li>
                            <li><Link to="/Planos">Planos</Link></li>
                            <li><Link to="/Moedas">Moedas</Link></li>
                        </ul>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2026 Plataforma PI_UC3 - Anime Spot. Todos os direitos reservados.</p>
                    </div>
                </div>
            </footer>

        </>

    );
}

export default Moedas;