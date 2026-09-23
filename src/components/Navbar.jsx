import"./Navbar.css"
function Navbar() {
    return ( 
        <div>
            <nav class="navbar">
                <div class="nav-left">
                    <img src="public/logo_animespot.png" alt="Logo AnimeSpot" className="nav-logo-img" />
                    <a href="index.html" class="nav-logo-text">AnimeSpot</a>
                </div>
                       
                <div class="nav-right">
                    <span>Já tem uma conta?</span>
                    <a href="cadastro.html" class="nav-login-link">Crie uma conta</a>
                </div>
            </nav>
        </div>
     );
}

export default Navbar;