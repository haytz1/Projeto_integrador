import { Link } from 'react-router-dom';
import NavbarPesquisa from '../components/Navbar_pesquisa';
import '../css/naoencontrada.css';

function NaoEncontrada() {
    return (
        <div id="tela-nao-encontrada">
            <NavbarPesquisa />

            <main className="nao-encontrada-conteudo">
                <i className="ph ph-ghost nao-encontrada-icone"></i>
                <h1>404</h1>
                <h2>Página não encontrada</h2>
                <p>O endereço que você tentou acessar não existe ou foi removido.</p>
                <Link to="/" className="nao-encontrada-botao">
                    Voltar para o início
                </Link>
            </main>
        </div>
    );
}

export default NaoEncontrada;
