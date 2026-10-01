import NavbarPesquisa from '../components/Navbar_pesquisa';
import Rodape from '../components/Rodape';
import '../css/obras_mangas.css';
import { Link } from 'react-router-dom';
import { useEffect, useState } from "react";
import { supabase } from '/supabase';

// Subcomponente de Card otimizado com fallback visual de segurança
function CardObra({ obra }) {
    const [erroImagem, setErroImagem] = useState(false);

    // Descomente a linha abaixo para inspecionar no F12 se a capa_url está chegando
    //console.log(`Obra: ${obra.titulo} | Capa: ${obra.capa_url}`);

    // Se obra.capa_url existir e não deu erro, usa ela. Senão, usa o placehold.co
    const imagemSrc = !erroImagem && obra.capa_url ? obra.capa_url : `https://placehold.co/180x250/15092E/C384FF?text=${encodeURIComponent(obra.titulo)}`;

    return (
        <Link
            to={`/Leitura/${encodeURIComponent(obra.titulo)}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
        >
            <article className="card">
                <div className="card-imagem-container">
                    <img
                        src={imagemSrc}
                        alt={`Capa de ${obra.titulo}`}
                        className="card-imagem"
                        onError={() => {
                            console.error(`Erro ao carregar a imagem da obra: ${obra.titulo} | URL tentada: ${obra.capa_url}`);
                            setErroImagem(true);
                        }}
                    />
                </div>
                <div className="card-info">
                    <h2 className="card-nome">{obra.titulo}</h2>
                    <p className="card-autor">
                        {obra.sinopse ? `${obra.sinopse.substring(0, 100)}...` : 'Sem sinopse'}
                    </p>
                    <p className="card-capitulos">
                        Capítulos: {obra.capitulos ? obra.capitulos.length : 0}
                    </p>
                </div>
            </article>
        </Link>
    );
}

function ObrasMangas() {
    const [obras, setObras] = useState([]);
    const [historicoLidas, setHistoricoLidas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [usuarioLogado, setUsuarioLogado] = useState(null);
    const [fotoPerfil, setFotoPerfil] = useState('');
    const [termoPesquisa, setTermoPesquisa] = useState('');

    // Estados para o Modal de Inserção de Obra
    const [modalAberto, setModalAberto] = useState(false);
    const [novoTitulo, setNovoTitulo] = useState('');
    const [novaSinopse, setNovaSinopse] = useState('');
    const [novaCapaUrl, setNovaCapaUrl] = useState('');
    const [salvando, setSalvando] = useState(false);

    // Estado para os gêneros selecionados
    const [generosSelecionados, setGenerosSelecionados] = useState([]);

    // Paginação
    const OBRAS_POR_PAGINA = 9;
    const [paginaAtual, setPaginaAtual] = useState(1);

    // 1. Lê o utilizador guardado no localStorage e busca a foto atualizada no Supabase
    useEffect(() => {
        async function verificarSessaoUsuario() {
            const id = localStorage.getItem('usuario_id');
            const email = localStorage.getItem('usuario_email');
            const usernameSalvo = localStorage.getItem('username');

            if (email || id) {
                setUsuarioLogado({ id, email, nome: usernameSalvo });

                if (email) {
                    const { data } = await supabase
                        .from('usuarios')
                        .select('foto')
                        .eq('email', email)
                        .single();

                    if (data && data.foto) {
                        setFotoPerfil(data.foto);
                    }
                }
            }
        }

        verificarSessaoUsuario();
    }, []);

    // 2. Busca todas as obras diretamente do Supabase
    async function procurar_todas_obras() {
        const { data, error } = await supabase
            .from("obras")
            .select(`
                *,
                capitulos (
                    id
                )
            `)
            .order('titulo', { ascending: true }); // <--- Adicionado para ordenar alfabeticamente

        if (error) {
            console.error("Erro ao carregar obras:", error.message);
        } else {
            const obrasUnicas = Array.from(
                new Map((data || []).map(obra => [obra.titulo, obra])).values()
            );

            setObras(obrasUnicas);
        }
    }

    // 3. Carrega o histórico de leituras diretamente do localStorage
    function procurar_historico_local() {
        try {
            const usuarioId = localStorage.getItem('usuario_id');

            const chaveEspecifica = usuarioId ? `manga_historico_${usuarioId}` : null;
            let dadosSalvos = chaveEspecifica ? localStorage.getItem(chaveEspecifica) : null;

            if (!dadosSalvos) {
                dadosSalvos = localStorage.getItem('manga_historico');
            }

            if (dadosSalvos) {
                const listaParseada = JSON.parse(dadosSalvos);
                setHistoricoLidas(listaParseada);
            } else {
                setHistoricoLidas([]);
            }
        } catch (error) {
            console.error("Erro ao carregar histórico local:", error);
            setHistoricoLidas([]);
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

        const { error } = await supabase
            .from('obras')
            .insert([
                {
                    titulo: novoTitulo.trim(),
                    sinopse: novaSinopse.trim() || null,
                    capa_url: novaCapaUrl.trim() || null,
                    autor_id: usuarioId,
                    status: 'Em andamento'
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
            procurar_todas_obras();
        }
    }

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            await procurar_todas_obras();
            procurar_historico_local();
            setLoading(false);
        }

        loadData();

        window.addEventListener('focus', procurar_historico_local);
        window.addEventListener('storage', procurar_historico_local);
        window.addEventListener('historicoAtualizado', procurar_historico_local);

        return () => {
            window.removeEventListener('focus', procurar_historico_local);
            window.removeEventListener('storage', procurar_historico_local);
            window.removeEventListener('historicoAtualizado', procurar_historico_local);
        };
    }, []);

    return (
        <>
            <NavbarPesquisa />

            <div className="pagina-obras-mangas">
                {/* Cabeçalho Fixo Superior Limpo */}
                <header className="cabecalho-obras">
                    <div className="acoes-esquerda">
                        <Link to="/" className="btn-voltar">⭠ Voltar ao Menu</Link>
                        {/* Botão Voltar movido para a secao-hero abaixo */}
                    </div>

                    <div className="acoes-direita">
                        <input
                            type="text"
                            id="pesquisa"
                            className="barra-pesquisa"
                            placeholder="Pesquisar obras..."
                            value={termoPesquisa}
                            onChange={(e) => setTermoPesquisa(e.target.value)}
                        />

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

                        <details className="filtro-container">
                            <summary className="filtro-icone" title="Filtrar por gênero">&#9776; Gêneros</summary>
                            <div className="filtro-generos">
                                {['acao', 'aventura', 'comedia', 'drama', 'esporte', 'fantasia', 'ficcao', 'misterio', 'romance', 'sobrenatural', 'terror'].map((gen, idx) => {
                                    const labels = {
                                        'acao': 'Ação', 'aventura': 'Aventura', 'comedia': 'Comédia',
                                        'drama': 'Drama', 'esporte': 'Esporte', 'fantasia': 'Fantasia',
                                        'ficcao': 'Ficção Científica', 'misterio': 'Mistério',
                                        'romance': 'Romance', 'sobrenatural': 'Sobrenatural', 'terror': 'Terror'
                                    };
                                    return (
                                        <label
                                            key={idx}
                                            className={`genero-pill ${generosSelecionados.includes(gen) ? 'ativo' : ''}`}
                                        >
                                            <input
                                                type="checkbox"
                                                name="genero"
                                                value={gen}
                                                checked={generosSelecionados.includes(gen)}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (e.target.checked) {
                                                        setGenerosSelecionados([...generosSelecionados, value]);
                                                    } else {
                                                        setGenerosSelecionados(generosSelecionados.filter(g => g !== value));
                                                    }
                                                }}
                                            />
                                            {labels[gen]}
                                        </label>
                                    );
                                })}
                            </div>
                        </details>
                    </div>
                </header>

                <div className="layout-dashboard">
                    {/* Painel Lateral Fixo */}
                    <aside className="painel-usuario">
                        <div className="cabecalho-perfil">
                            <span style={{ marginLeft: '0' }}> PERFIL</span>
                        </div>

                        <div className="usuario-foto">
                            {fotoPerfil ? (
                                <img src={fotoPerfil} alt="Foto do usuário" />
                            ) : (
                                <img src="https://placehold.co/200x200/15092E/C384FF" alt="Foto padrão" />
                            )}
                        </div>

                        <h2 className="usuario-nome">
                            {usuarioLogado ? (usuarioLogado.nome || usuarioLogado.email?.split('@')[0]) : 'Visitante'}
                        </h2>

                        <div className="obras-lidas">
                            <h3 className="obras-lidas-titulo">📚 Obras lidas:</h3>
                            <ul>
                                {historicoLidas.length === 0 ? (
                                    <li>
                                        <span className="obra-titulo">Nenhuma leitura salva</span>
                                    </li>
                                ) : (
                                    historicoLidas.slice(0, 6).map((item, index) => (
                                        <li key={`hist-${index}`}>
                                            <span className="obra-titulo" style={{ fontWeight: 'bold' }}>{item.obra_titulo}</span>
                                            <span className="obra-caps" style={{ fontSize: '0.75rem', opacity: 0.8 }}>Cap. {item.ultimo_capitulo} - {item.status}</span>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>

                        <Link to="/Historico" className="btn-historico">Ver Histórico</Link>
                    </aside>

                    {/* Grade de Cards das Obras */}
                    <main className="conteudo-principal">
                        {/* Cabeçalho Hero da Seção */}
                        <div className="secao-hero">
                            <div className="secao-hero-esquerda">
                                <div className="secao-hero-icone">📚</div>
                                <div className="secao-hero-texto">
                                    <h1>Biblioteca de <span>Mangás</span></h1>
                                    <p>Explore, leia e acompanhe suas histórias favoritas.</p>
                                </div>
                            </div>
                            
                        </div>

                        <section className="grade-obras">
                            {loading ? (
                                <p style={{ color: '#fff' }}>Carregando obras...</p>
                            ) : obras.length === 0 ? (
                                <p style={{ color: '#fff' }}>Nenhuma obra cadastrada.</p>
                            ) : (() => {
                                const obrasFiltradas = obras
                                    .filter(obra => obra.titulo.toLowerCase().includes(termoPesquisa.toLowerCase()))
                                    .filter(obra => {
                                        if (generosSelecionados.length === 0) return true;

                                        if (!obra.genero_principal) return false;

                                        const labelsMap = {
                                            'acao': 'Ação', 'aventura': 'Aventura', 'comedia': 'Comédia',
                                            'drama': 'Drama', 'esporte': 'Esporte', 'fantasia': 'Fantasia',
                                            'ficcao': 'Ficção Científica', 'misterio': 'Mistério',
                                            'romance': 'Romance', 'sobrenatural': 'Sobrenatural', 'terror': 'Terror'
                                        };

                                        let principalGenero = obra.genero_principal.trim().toLowerCase();

                                        // Força "Dr Stone" para Ficção Científica
                                        const tituloLower = obra.titulo.toLowerCase();
                                        if (tituloLower.includes("dr stone") || tituloLower.includes("dr. stone")) {
                                            principalGenero = "ficção científica";
                                        }

                                        const principalNormalizado = principalGenero.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                                        return generosSelecionados.some(g => {
                                            const gNorm = labelsMap[g] ? labelsMap[g].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : g.toLowerCase();
                                            return principalNormalizado === gNorm || principalGenero.includes(gNorm);
                                        });
                                    });

                                const totalPaginas = Math.ceil(obrasFiltradas.length / OBRAS_POR_PAGINA);
                                const paginaSegura = Math.min(paginaAtual, totalPaginas || 1);
                                const inicio = (paginaSegura - 1) * OBRAS_POR_PAGINA;
                                const obrasPagina = obrasFiltradas.slice(inicio, inicio + OBRAS_POR_PAGINA);

                                return obrasPagina.map((i, index) => (
                                    <CardObra key={`obra-card-${index}`} obra={i} />
                                ));
                            })()}
                        </section>

                        {/* Controles de Paginação */}
                        {(() => {
                            const obrasFiltradas = obras
                                .filter(obra => obra.titulo.toLowerCase().includes(termoPesquisa.toLowerCase()))
                                .filter(obra => {
                                    if (generosSelecionados.length === 0) return true;
                                    if (!obra.genero_principal) return false;
                                    const labelsMap = {
                                        'acao': 'Ação', 'aventura': 'Aventura', 'comedia': 'Comédia',
                                        'drama': 'Drama', 'esporte': 'Esporte', 'fantasia': 'Fantasia',
                                        'ficcao': 'Ficção Científica', 'misterio': 'Mistério',
                                        'romance': 'Romance', 'sobrenatural': 'Sobrenatural', 'terror': 'Terror'
                                    };
                                    let principalGenero = obra.genero_principal.trim().toLowerCase();
                                    const tituloLower = obra.titulo.toLowerCase();
                                    if (tituloLower.includes("dr stone") || tituloLower.includes("dr. stone")) {
                                        principalGenero = "ficção científica";
                                    }
                                    const principalNormalizado = principalGenero.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                                    return generosSelecionados.some(g => {
                                        const gNorm = labelsMap[g] ? labelsMap[g].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : g.toLowerCase();
                                        return principalNormalizado === gNorm || principalGenero.includes(gNorm);
                                    });
                                });
                            const totalPaginas = Math.ceil(obrasFiltradas.length / OBRAS_POR_PAGINA);
                            if (totalPaginas <= 1) return null;
                            return (
                                <div className="paginacao">
                                    <button
                                        className="btn-paginacao"
                                        onClick={() => { setPaginaAtual(p => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
                                        disabled={paginaAtual === 1}
                                    >
                                        ← Anterior
                                    </button>
                                    <span className="paginacao-info">
                                        Página {paginaAtual} de {totalPaginas}
                                    </span>
                                    <button
                                        className="btn-paginacao"
                                        onClick={() => { setPaginaAtual(p => Math.min(totalPaginas, p + 1)); window.scrollTo(0, 0); }}
                                        disabled={paginaAtual === totalPaginas}
                                    >
                                        Próxima →
                                    </button>
                                </div>
                            );
                        })()}
                    </main>
                </div>

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