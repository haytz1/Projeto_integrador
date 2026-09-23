import NavbarPesquisa from '../components/Navbar_pesquisa';
import Rodape from '../components/Rodape';
import '../css/obras_mangas.css'
import { Link } from 'react-router-dom';

function ObrasMangas() {
    return (
        <>
    <NavbarPesquisa/>
            <header className="cabecalho">
                <div className="barra-pesquisa-wrapper">
                    <input type="text" id="pesquisa" className="barra-pesquisa" placeholder="Pesquisar obras..." />
                    <span className="resultado-pesquisa" id="resultado-pesquisa"></span>
                
                    <Link to="/" className="btn-voltar"> ⭠ Voltar para o Menu </Link>

                    <details className="filtro-container">
                        <summary className="filtro-icone" title="Filtrar por gênero">&#9776; Gêneros</summary>

                        <div className="filtro-generos">
                            <label><input type="checkbox" name="genero" value="acao" /> Ação</label>
                            <label><input type="checkbox" name="genero" value="aventura" /> Aventura</label>
                            <label><input type="checkbox" name="genero" value="romance" /> Romance</label>
                            <label><input type="checkbox" name="genero" value="fantasia" /> Fantasia</label>
                            <label><input type="checkbox" name="genero" value="comedia" /> Comédia</label>
                            <label><input type="checkbox" name="genero" value="drama" /> Drama</label>
                            <label><input type="checkbox" name="genero" value="terror" /> Terror</label>
                            <label><input type="checkbox" name="genero" value="ficcao" /> Ficção Científica</label>
                        </div>
                    </details>
                </div>
            </header>

            <main className="conteudo-principal">

                <section className="grade-obras">

                    <Link to="/leitura" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <article className="card">
                            <img src="https://placehold.co/180x250/15092E/C384FF?text=Manga+1" alt="Capa do Mangá 1" className="card-imagem" />
                            <h2 className="card-nome">Sombras do Vazio</h2>
                            <p className="card-autor">Autor: Kenji Tanaka</p>
                            <p className="card-capitulos">Capítulos: 48</p>
                        </article>
                    </Link>

                    <Link to="/leitura" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <article className="card">
                            <img src="https://placehold.co/180x250/15092E/C384FF?text=Manga+2" alt="Capa do Mangá 2" className="card-imagem" />
                            <h2 className="card-nome">Luz Eterna</h2>
                            <p className="card-autor">Autor: Aiko Mori</p>
                            <p className="card-capitulos">Capítulos: 120</p>
                        </article>
                    </Link>

                    <Link to="/leitura" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <article className="card">
                            <img src="https://placehold.co/180x250/15092E/C384FF?text=Manga+3" alt="Capa do Mangá 3" className="card-imagem" />
                            <h2 className="card-nome">Espada Celestial</h2>
                            <p className="card-autor">Autor: Ryu Sasaki</p>
                            <p className="card-capitulos">Capítulos: 75</p>
                        </article>
                    </Link>

                    <Link to="/leitura" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <article className="card">
                            <img src="https://placehold.co/180x250/15092E/C384FF?text=Manga+4" alt="Capa do Mangá 4" className="card-imagem" />
                            <h2 className="card-nome">Abismo Infinito</h2>
                            <p className="card-autor">Autor: Hana Fujiwara</p>
                            <p className="card-capitulos">Capítulos: 33</p>
                        </article>
                    </Link>

                    <Link to="/leitura" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <article className="card">
                            <img src="https://placehold.co/180x250/15092E/C384FF?text=Manga+5" alt="Capa do Mangá 5" className="card-imagem" />
                            <h2 className="card-nome">Chama Negra</h2>
                            <p className="card-autor">Autor: Shin Watanabe</p>
                            <p className="card-capitulos">Capítulos: 90</p>
                        </article>
                    </Link>

                    <Link to="/leitura" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <article className="card">
                            <img src="https://placehold.co/180x250/15092E/C384FF?text=Manga+6" alt="Capa do Mangá 6" className="card-imagem" />
                            <h2 className="card-nome">Reino dos Ventos</h2>
                            <p className="card-autor">Autor: Yuki Nakamura</p>
                            <p className="card-capitulos">Capítulos: 210</p>
                        </article>
                    </Link>

                    <Link to="/leitura" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <article className="card">
                            <img src="https://placehold.co/180x250/15092E/C384FF?text=Manga+7" alt="Capa do Mangá 7" className="card-imagem" />
                            <h2 className="card-nome">Dragão de Prata</h2>
                            <p className="card-autor">Autor: Toru Ishida</p>
                            <p className="card-capitulos">Capítulos: 55</p>
                        </article>
                    </Link>

                    <Link to="/leitura" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <article className="card">
                            <img src="https://placehold.co/180x250/15092E/C384FF?text=Manga+8" alt="Capa do Mangá 8" className="card-imagem" />
                            <h2 className="card-nome">Alma Perdida</h2>
                            <p className="card-autor">Autor: Misaki Hayashi</p>
                            <p className="card-capitulos">Capítulos: 18</p>
                        </article>
                    </Link>

                    <Link to="/leitura" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <article className="card">
                            <img src="https://placehold.co/180x250/15092E/C384FF?text=Manga+9" alt="Capa do Mangá 9" className="card-imagem" />
                            <h2 className="card-nome">Guerreiro Imortal</h2>
                            <p className="card-autor">Autor: Daichi Ono</p>
                            <p className="card-capitulos">Capítulos: 142</p>
                        </article>
                    </Link>

                    <Link to="/leitura" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <article className="card">
                            <img src="https://placehold.co/180x250/15092E/C384FF?text=Manga+10" alt="Capa do Mangá 10" className="card-imagem" />
                            <h2 className="card-nome">Fênix Rebelde</h2>
                            <p className="card-autor">Autor: Ren Kobayashi</p>
                            <p className="card-capitulos">Capítulos: 67</p>
                        </article>
                    </Link>

                </section>

                <aside className="painel-usuario">

                    <div className="cabecalho-perfil">
                        <img className="icone-perfil" src="./public/person.png" alt="Perfil" />
                        <span> PERFIL</span>
                    </div>

                    <div className="usuario-foto">
                        <img src="https://placehold.co/200x200/15092E/C384FF" alt="Foto do usuário" />
                    </div>

                    <h2 className="usuario-nome">Usuário</h2>

                    <div className="obras-lidas">
                        <h3 className="obras-lidas-titulo">📚 Obras lidas:</h3>

                        <ul>
                            <li>
                                <span className="obra-titulo">One Piece</span>
                                <span className="obra-caps">342 caps lidos</span>
                            </li>

                            <li>
                                <span className="obra-titulo">Naruto</span>
                                <span className="obra-caps">700 caps lidos</span>
                            </li>

                            <li>
                                <span className="obra-titulo">Demon Slayer</span>
                                <span className="obra-caps">205 caps lidos</span>
                            </li>

                            <li>
                                <span className="obra-titulo">Attack on Titan</span>
                                <span className="obra-caps">188 caps lidos</span>
                            </li>

                            <li>
                                <span className="obra-titulo">Made in Abyss</span>
                                <span className="obra-caps">40 caps lidos</span>
                            </li>
                        </ul>
                    </div>

                    <Link to="/Historico" className="btn-historico">Ver Histórico</Link>

                </aside>


            </main>
                
            <Rodape/>
        </>
    )
}

export default ObrasMangas;