import '../css/moedas.css'

function Moedas() {



    return (

    

        <>

            <Navbar/>

            <main class="container">

                
                <header class="coins-header">
                    <h1 class="main-title">Comprar moedas</h1>
                    <p>Adquira suas moedas e aproveite mais vantagens no site</p>
                </header>

                
                <section class="coins-grid">

                    
                    <article class="coin-card">
                        <div class="coin-header">
                            <div class="coin-icon">
                                <i class="ph ph-coin"></i>
                            </div>
                            <h2>50 Moedas</h2>
                            <div class="coin-price">
                                <span class="currency">R$</span>
                                <span class="amount">5,00</span>
                            </div>
                        </div>
                        <div class="coin-body">
                            <ul class="coin-features">
                                <li><i class="ph ph-check-circle"></i> Desbloquear 1 capítulo extra</li>
                                <li><i class="ph ph-check-circle"></i> Apoiar seu autor favorito</li>
                                <li><i class="ph ph-check-circle"></i> Badge de apoiador iniciante</li>
                            </ul>
                            <button class="btn-cta btn-coin">Comprar 50 Moedas</button>
                        </div>
                    </article>

                    
                    <article class="coin-card coin-featured">
                        <div class="featured-badge">Mais Popular</div>
                        <div class="coin-header">
                            <div class="coin-icon">
                                <i class="ph ph-coins"></i>
                            </div>
                            <h2>100 Moedas</h2>
                            <div class="coin-price">
                                <span class="currency">R$</span>
                                <span class="amount">10,00</span>
                            </div>
                        </div>
                        <div class="coin-body">
                            <ul class="coin-features">
                                <li><i class="ph ph-check-circle"></i> Desbloquear 2 capítulos ou 1 episódio</li>
                                <li><i class="ph ph-check-circle"></i> Apoiar autores favoritos</li>
                                <li><i class="ph ph-check-circle"></i> Badge de apoiador intermediário</li>
                            </ul>
                            <button class="btn-cta btn-coin">Comprar 100 Moedas</button>
                        </div>
                    </article>

                    
                    <article class="coin-card">
                        <div class="coin-header">
                            <div class="coin-icon">
                                <i class="ph ph-money"></i>
                            </div>
                            <h2>150 Moedas</h2>
                            <div class="coin-price">
                                <span class="currency">R$</span>
                                <span class="amount">15,00</span>
                            </div>
                        </div>
                        <div class="coin-body">
                            <ul class="coin-features">
                                <li><i class="ph ph-check-circle"></i> Desbloquear 3 capítulos ou 2 episódios</li>
                                <li><i class="ph ph-check-circle"></i> Apoiar autores favoritos</li>
                                <li><i class="ph ph-check-circle"></i> Badge de apoiador premium</li>
                                <li><i class="ph ph-check-circle"></i> Destaque nos comentários</li>
                            </ul>
                            <button class="btn-cta btn-coin">Comprar 150 Moedas</button>
                        </div>
                    </article>

                </section>

            </main>

            
            <footer class="site-footer">
                <div class="footer-container">
                    <div class="footer-about">
                        <h3 class="site-logo" style="margin:0;">Anime Spot</h3>
                        <p>O seu destino final para ler e descobrir os melhores animes, mangás e autores em um só lugar.</p>
                    </div>
                    <div class="footer-links">
                        <h4>Navegação</h4>
                        <ul>
                            <li><a href="index.html">Início</a></li>
                            <li><a href="planos.html">Planos</a></li>
                            <li><a href="moedas.html">Moedas</a></li>
                        </ul>
                    </div>
                    <div class="footer-bottom">
                        <p>&copy; 2026 Plataforma PI_UC3 - Anime Spot. Todos os direitos reservados.</p>
                    </div>
                </div>
            </footer>

        </>

    );
}

export default Moedas;