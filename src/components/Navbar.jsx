import"./Navbar.css"
function Navbar() {
    return ( 
        <div>
            <nav class="navbar">
                <div class="nav-left">
                    <img src="public/logo_animespot.png" alt="Logo AnimeSpot" className="nav-logo-img" />
                    <Link to="/" class="nav-logo-text">AnimeSpot</Link>
                </div>
                       
                <div class="nav-right">
                    <span>Já tem uma conta?</span>
                    <Link to="/Cadastro" className="nav-login-link">Crie uma conta</Link>
                </div>
            </nav>
        </div>
     );
}

export default Navbar;