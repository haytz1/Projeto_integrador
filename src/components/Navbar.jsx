import { Link } from 'react-router-dom';
import"./Navbar.css"

function Navbar() {
    return ( 
        <div>
            <nav className="navbar">
                <div className="nav-left">
                    <img src="public/logo_animespot.png" alt="Logo AnimeSpot" className="nav-logo-img" />
                    <Link to="/" className="nav-logo-text">AnimeSpot</Link>
                </div>
                       
                <div className="nav-right">
                    <span>Já tem uma conta?</span>
                    <Link to="/Cadastro" className="nav-login-link">Crie uma conta</Link>
                </div>
            </nav>
        </div>
     );
}

export default Navbar;