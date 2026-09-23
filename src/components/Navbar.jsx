function Navbar() {
    return ( 
        <div>
            <nav className="navbar">
                <div className="nav-left">
                    <img src="imagens/logo_animespot.png" alt="Logo AnimeSpot" className="nav-logo-img" />
                    <a href="index.html" className="nav-logo-text">AnimeSpot</a>
                </div>
                <div className="nav-right">
                    <span>Já tem uma conta?</span>
                    <a href="cadastro.html" className="nav-login-link">Crie uma conta</a>
                </div>
            </nav>
        </div>
     );
}

export default Navbar;