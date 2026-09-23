import Navbar from '../components/Navbar';
import '../css/leitura.css'
import { Link } from 'react-router-dom'

function Leitura() {
    return (
        <>
    <Navbar/>
            <a href="obras_mangas.html" class="btn btn-voltar">⭠ Voltar</a>

            <div class="header">
                <h1>Sombras do Vazio</h1>
                {/* Definimos o valor inicial no defaultValue do select */}
                <select className="capitulos" defaultValue="3">
                    <optgroup label="Capítulos">
                        <option value="1">Capítulo 1</option>
                        <option value="2">Capítulo 2</option>
                        <option value="3">Capítulo 3</option>
                        <option value="4">Capítulo 4</option>
                        <option value="5">Capítulo 5</option>
                    </optgroup>
                </select>
            </div>

            <div className="info-progresso">
                <span>Progresso da Obra</span>
                <span>50% (Página 10/20)</span>
            </div>
            <div className="progresso-container" title="Progresso da leitura">
                <div className="progresso-barra"></div>
            </div>

            <div className="leitura-container">
                <p>Conteúdo da obra "Sombras do Vazio" sendo visualizado aqui...</p>
            </div>

            <div className="controles">
                <a href="#" className="btn">Página Anterior</a>
                <a href="#" className="btn">Próxima Página</a>
            </div>
        </>
    );
}

export default Leitura;