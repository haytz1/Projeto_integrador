import { Link } from 'react-router-dom';
import './rodape.css'


function Rodape() {



    return ( 

        <footer className="site-footer">
                <div className="footer-container">
                    <div className="footer-about">
                        <h3 className="footer-logo"><span className="logo-highlight">Anime</span>Spot</h3>
                        <p>O seu destino final para ler e descobrir os melhores animes, mangás e autores em um só lugar.</p>
                    </div>
                    <div className="footer-links">
                        <h4>Navegação</h4>
                        <ul>
                            <li><Link to="/">Início</Link></li>
                            <li><Link to ="/Planos">Planos</Link></li>
                            <li><Link to ="#">Explorar</Link></li>
                            <li><Link to ="#">Eventos</Link></li>
                        </ul>
                    </div>
                    <div className="footer-links">
                        <h4>Suporte</h4>
                        <ul>
                            <li><a href="#">FAQ</a></li>
                            <li><a href="#">Termos de Uso</a></li>
                            <li><a href="#">Privacidade</a></li>
                            <li><a href="#">Contato</a></li>
                        </ul>
                    </div>
                    <div className="footer-social">
                        <h4>Redes Sociais</h4>
                        <div className="social-icons">
                            <a href="#" aria-label="Instagram"><i className="ph ph-instagram-logo"></i></a>
                            <a href="#" aria-label="Twitter"><i className="ph ph-twitter-logo"></i></a>
                            <a href="#" aria-label="Discord"><i className="ph ph-discord-logo"></i></a>
                            <a href="#" aria-label="YouTube"><i className="ph ph-youtube-logo"></i></a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 Anime Spot — PI_UC3. Todos os direitos reservados.</p>
                </div>
            </footer>

     );
}

export default Rodape;