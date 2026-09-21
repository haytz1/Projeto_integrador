import './css/moedas.css'

function Moedas() {



    return (

        <>

            <nav class="navbar">
                <div class="nav-left">
                    <a href="#" class="notification-icon" aria-label="Notificações">
                        <i class="ph ph-bell"></i>
                    </a>
                    <a href="index.html" class="site-logo">Anime Spot</a>
                    <a href="index.html" class="nav-link">Início</a>
                    <a href="planos.html" class="nav-link">Planos</a>
                    <a href="moedas.html" class="nav-link active">Moedas</a>
                </div>

                <div class="nav-center">
                    <div class="search-bar">
                        <i class="ph ph-magnifying-glass"></i>
                        <input type="text" placeholder="Pesquisar animes, autores..."/>
                    </div>
                </div>

                <div class="nav-right">
                    <a href="#" class="nav-link">Login / Cadastro</a>
                    <a href="#" class="nav-link profile-link">
                        <i class="ph ph-user-circle"></i> Perfil
                    </a>
                </div>
            </nav>

            
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