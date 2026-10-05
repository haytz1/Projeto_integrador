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
                            <li><Link to ="/Moedas">Moedas</Link></li>
                            
                        </ul>
                    </div>
                    <div className="footer-links">
                        <h4>Suporte</h4>
                        <ul>
                            <li><Link to="/Sobre#faq">FAQ</Link></li>
                            <li><Link to="/Sobre#contato">Contato</Link></li>
                        </ul>
                    </div>
                    <div className="footer-links">
                        <h4>Legal</h4>
                        <ul>
                            <li><Link to="/Sobre#termos">Termos de Uso</Link></li>
                            <li><Link to="/Sobre#privacidade">Privacidade</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 Anime Spot . Todos os direitos reservados.</p>
                </div>
            </footer>

     );
}

export default Rodape;