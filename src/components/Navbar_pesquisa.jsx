
import"./Navbar.css"
function NavbarPesquisa() {
    return ( 
        <div>
            <nav class="navbar">
                <div class="nav-left">
                    <img src="public/logo_animespot.png" alt="Logo AnimeSpot" className="nav-logo-img" />
                    <Link to="/" class="nav-logo-text">AnimeSpot</Link>
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
                    <Link to="/Login" class="btn-entrar" id="btn-entrar">Entrar</Link>
                    <Link to="/Cadastro" class="btn-criar-conta" id="btn-criar-conta">
                        Criar conta <i class="ph ph-user"></i>
                    </Link>
                </div>
            </nav>
        </div>
     );
}

export default NavbarPesquisa;