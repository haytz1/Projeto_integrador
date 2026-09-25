import NavbarPesquisa from '../components/Navbar_pesquisa';
import Rodape from '../components/Rodape';
import '../css/obras_mangas.css';
import { Link } from 'react-router-dom';
import { useEffect, useState } from "react";
import { supabase } from '/supabase';

function ObrasMangas() {
    const [obras, setObras] = useState([]);
    const [historicoLidas, setHistoricoLidas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [usuarioLogado, setUsuarioLogado] = useState(null);

    // Estados para o Modal de Inserção de Obra
    const [modalAberto, setModalAberto] = useState(false);
    const [novoTitulo, setNovoTitulo] = useState('');
    const [novaSinopse, setNovaSinopse] = useState('');
    const [novaCapaUrl, setNovaCapaUrl] = useState('');
    const [salvando, setSalvando] = useState(false);

    // 1. Lê o utilizador guardado no localStorage ao carregar a página
    useEffect(() => {
        const id = localStorage.getItem('usuario_id');
        const email = localStorage.getItem('usuario_email');
        const nome = localStorage.getItem('usuario_nome');

        if (id) {
            setUsuarioLogado({ id, email, nome });
        }
    }, []);

    // 2. Busca todas as obras e a contagem de capítulos relacionados
    async function procurar_todas_obras() {
        const { data, error } = await supabase
            .from("obras")
            .select(`
                *,
                capitulos (
                    id
                )
            `);

        if (error) {
            console.error("Erro ao carregar obras:", error.message);
        } else {
            setObras(data || []);
        }
    }

    // 3. Busca o histórico de leituras do usuário autenticado
    async function procurar_historico_usuario() {
        const email = localStorage.getItem('usuario_email');
        if (!email) return;

        const { data, error } = await supabase
            .from("leitura")
            .select('*')
            .eq('email_usuario', email);

        if (error) {
            console.error("Erro ao carregar histórico:", error.message);
        } else {
            setHistoricoLidas(data || []);
        }
    }

    // 4. Função para inserir uma nova obra no banco vinculada ao usuário logado
    async function handleCadastrarObra(e) {
        e.preventDefault();

        if (!novoTitulo.trim()) {
            alert('Por favor, informe o título da obra.');
            return;
        }

        const usuarioId = localStorage.getItem('usuario_id');

        if (!usuarioId) {
            alert("Você precisa estar logado para cadastrar uma obra. Por favor, faça login.");
            return;
        }

        setSalvando(true);

        // Insere na tabela 'obras' incluindo o autor_id e o status obrigatório
        const { error } = await supabase
            .from('obras')
            .insert([
                {
                    titulo: novoTitulo.trim(),
                    sinopse: novaSinopse.trim() || null,
                    capa_url: novaCapaUrl.trim() || null,
                    autor_id: usuarioId,
                    status: 'Em andamento' // 👈 Adicionado para satisfazer a restrição do banco
                }
            ]);

        setSalvando(false);

        if (error) {
            console.error("Erro ao inserir obra no Supabase:", error.message);
            alert("Erro ao cadastrar obra: " + error.message);
        } else {
            alert("Obra cadastrada com sucesso!");
            setNovoTitulo('');
            setNovaSinopse('');
            setNovaCapaUrl('');
            setModalAberto(false);
            procurar_todas_obras(); // Atualiza a lista no ecrã
        }
    }

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            await procurar_todas_obras();
            await procurar_historico_usuario();
            setLoading(false);
        }

        loadData();
    }, []);

    return (
        <>
            <NavbarPesquisa />

            <div className="pagina-obras-mangas">
                <header className="cabecalho">
                    <div className="barra-pesquisa-wrapper">
                        <input type="text" id="pesquisa" className="barra-pesquisa" placeholder="Pesquisar obras..." />
                        <span className="resultado-pesquisa" id="resultado-pesquisa"></span>

                        {/* Botão para abrir modal de adição com validação correta */}
                        <button
                            type="button"
                            className="btn-add-obra"
                            onClick={() => {
                                const idVerificacao = localStorage.getItem('usuario_id');
                                if (!idVerificacao) {
                                    alert("Você precisa estar logado para adicionar uma nova obra!");
                                    return;
                                }
                                setModalAberto(true);
                            }}
                        >
                            ➕ Nova Obra
                        </button>

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
                        {loading ? (
                            <p style={{ color: '#fff' }}>Carregando obras...</p>
                        ) : obras.length === 0 ? (
                            <p style={{ color: '#fff' }}>Nenhuma obra cadastrada.</p>
                        ) : (
                            obras.map(i => (
                                <Link
                                    to={`/Leitura/${encodeURIComponent(i.titulo)}`}
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                    key={i.id || i.titulo}
                                >
                                    <article className="card">
                                        <img
                                            src={i.capa_url || `https://placehold.co/180x250/15092E/C384FF?text=${encodeURIComponent(i.titulo)}`}
                                            alt={`Capa de ${i.titulo}`}
                                            className="card-imagem"
                                        />
                                        <h2 className="card-nome">{i.titulo}</h2>

                                        <p className="card-autor">
                                            {i.sinopse ? `${i.sinopse.substring(0, 30)}...` : 'Sem sinopse'}
                                        </p>

                                        <p className="card-capitulos">
                                            Capítulos: {i.capitulos ? i.capitulos.length : 0}
                                        </p>
                                    </article>
                                </Link>
                            ))
                        )}
                    </section>

                    <aside className="painel-usuario">

                        <div className="cabecalho-perfil">
                            <img className="icone-perfil" src="./person.png" alt="Perfil" />
                            <span> PERFIL</span>
                        </div>

                        <div className="usuario-foto">
                            <img src="https://placehold.co/200x200/15092E/C384FF" alt="Foto do usuário" />
                        </div>

                        {/* Exibe o nome do utilizador logado corretamente */}
                        <h2 className="usuario-nome">
                            {usuarioLogado ? (usuarioLogado.nome || usuarioLogado.email.split('@')[0]) : 'Visitante'}
                        </h2>

                        <div className="obras-lidas">
                            <h3 className="obras-lidas-titulo">📚 Obras lidas:</h3>

                            <ul>
                                {historicoLidas.length === 0 ? (
                                    <li>
                                        <span className="obra-titulo">Nenhuma leitura salva</span>
                                    </li>
                                ) : (
                                    // 👇 O .slice(0, 4) limita a exibição a apenas 4 obras (mude o número se preferir)
                                    historicoLidas.slice(0, 7).map(item => (
                                        <li key={item.id}>
                                            <span className="obra-titulo">{item.obra_titulo}</span>
                                            <span className="obra-caps">Cap. {item.ultimo_capitulo} lido</span>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>

                        <Link to="/Historico" className="btn-historico">Ver Histórico</Link>

                    </aside>

                </main>

                {/* Modal de Cadastro de Nova Obra */}
                {modalAberto && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>Cadastrar Nova Obra</h2>
                            <form onSubmit={handleCadastrarObra}>
                                <div className="form-group">
                                    <label>Título da Obra *</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Solo Leveling"
                                        value={novoTitulo}
                                        onChange={(e) => setNovoTitulo(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>URL da Capa (Imagem)</label>
                                    <input
                                        type="url"
                                        placeholder="https://exemplo.com/imagem.jpg"
                                        value={novaCapaUrl}
                                        onChange={(e) => setNovaCapaUrl(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Sinopse</label>
                                    <textarea
                                        rows="3"
                                        placeholder="Escreva um breve resumo da história..."
                                        value={novaSinopse}
                                        onChange={(e) => setNovaSinopse(e.target.value)}
                                    ></textarea>
                                </div>

                                <div className="modal-acoes">
                                    <button type="button" className="btn-cancelar" onClick={() => setModalAberto(false)}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn-salvar" disabled={salvando}>
                                        {salvando ? 'Salvando...' : 'Salvar Obra'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            <Rodape />
        </>
    );
}

export default ObrasMangas;