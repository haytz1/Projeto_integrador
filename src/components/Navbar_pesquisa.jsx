import { Link } from 'react-router-dom';
import"./Navbar.css"

function NavbarPesquisa() {
    return ( 
        <div>
            <nav className="navbar">
                <div className="nav-left">
                    <img src="public/logo_animespot.png" alt="Logo AnimeSpot" className="nav-logo-img" />
                    <Link to= "/" className="nav-logo-text">AnimeSpot</Link>
                </div>
                        <div className="nav-center">
                    <div className="search-bar">
                        <i className="ph ph-magnifying-glass"></i>
                        <input type="text" id="search-input" placeholder="Buscar animes, mangás, notícias..."
                            aria-label="Buscar conteúdo"/>
                    </div>
                </div>

                <div className="nav-right">
                    
                </div>
                <div className="nav-right">
                    <Link to="/Login" className="btn-entrar" id="btn-entrar">Entrar</Link>
                    <Link to="/Cadastro" className="btn-criar-conta" id="btn-criar-conta">
                        Criar conta <i className="ph ph-user"></i>
                    </Link>
                </div>
            </nav>
        </div>
     );
}

export default NavbarPesquisa;