
import"./Navbar.css"
function NavbarPesquisa() {
    return ( 
        <div>
            <nav class="navbar">
                <div class="nav-left">
                    <img src="public/logo_animespot.png" alt="Logo AnimeSpot" className="nav-logo-img" />
                    <a href="index.html" class="nav-logo-text">AnimeSpot</a>
                </div>
                        <div class="nav-center">
                    <div class="search-bar">
                        <i class="ph ph-magnifying-glass"></i>
                        <input type="text" id="search-input" placeholder="Buscar animes, mangás, notícias..."
                            aria-label="Buscar conteúdo"/>
                    </div>
                </div>

                <div class="nav-right">
                    
                </div>
                <div class="nav-right">
                    <a href="login.html" class="btn-entrar" id="btn-entrar">Entrar</a>
                    <a href="login.html" class="btn-criar-conta" id="btn-criar-conta">
                        Criar conta <i class="ph ph-user"></i>
                    </a>
                </div>
            </nav>
        </div>
     );
}

export default NavbarPesquisa;