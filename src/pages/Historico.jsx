import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '/supabase';
import '../css/historico.css';
import NavbarPesquisa from '../components/Navbar_pesquisa';

function Historico() {
    const [historico, setHistorico] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Usuário logado: busca o histórico salvo no banco (tabela "leitura")
        async function carregarHistoricoBanco(usuarioId) {
            setLoading(true);

            const { data: leituras, error } = await supabase
                .from('leitura')
                .select('obra_titulo, ultimo_capitulo, created_at')
                .eq('id_usuario', usuarioId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Erro ao carregar histórico do banco:', error.message);
                carregarHistoricoLocal();
                return;
            }

            // Junta as linhas por obra, guardando o maior capítulo lido
            const porObra = {};
            (leituras || []).forEach((l) => {
                if (!l.obra_titulo) return;
                const atual = porObra[l.obra_titulo];
                if (!atual) {
                    porObra[l.obra_titulo] = { ...l };
                } else if (l.ultimo_capitulo > atual.ultimo_capitulo) {
                    atual.ultimo_capitulo = l.ultimo_capitulo;
                }
            });

            const titulos = Object.keys(porObra);

            if (titulos.length === 0) {
                setHistorico([]);
                setLoading(false);
                return;
            }

            // Busca capa e total de capítulos de cada obra
            const { data: obras } = await supabase
                .from('obras')
                .select('titulo, capa_url, capitulos(numero_capitulo)')
                .in('titulo', titulos);

            const lista = titulos.map((titulo) => {
                const item = porObra[titulo];
                const obra = (obras || []).find((o) => o.titulo === titulo);
                const numeros = obra?.capitulos?.map((c) => c.numero_capitulo) || [];
                const ultimoDaObra = numeros.length > 0 ? Math.max(...numeros) : null;

                // Leu o último capítulo da obra = Concluído
                const concluido = ultimoDaObra !== null && item.ultimo_capitulo >= ultimoDaObra;

                return {
                    obra_titulo: titulo,
                    ultimo_capitulo: item.ultimo_capitulo,
                    capa_url: obra?.capa_url || null,
                    status: concluido ? 'Concluído' : 'Lendo'
                };
            });

            setHistorico(lista);
            setLoading(false);
        }

        // Visitante (ou erro no banco): usa o histórico salvo no navegador
        function carregarHistoricoLocal() {
            setLoading(true);
            try {
                // 1. Pega o identificador exato do utilizador logado no localStorage
                const usuarioId = localStorage.getItem('usuario_id') || localStorage.getItem('usuario_email') || 'convidado';

                // 2. Cria uma chave única por utilizador (ex: 'manga_historico_1')
                const chaveHistorico = `manga_historico_${usuarioId}`;

                // 3. Lê o histórico específico desta conta
                const dadosSalvos = localStorage.getItem(chaveHistorico);

                if (dadosSalvos) {
                    const listaParseada = JSON.parse(dadosSalvos);
                    const agora = new Date().getTime();
                    const umAnoEmMs = 365 * 24 * 60 * 60 * 1000; // 1 ano em milissegundos

                    // Processa cada item para verificar o status com base no tempo e capítulos
                    const historicoProcessado = listaParseada.map(item => {
                        const ultimaLeitura = new Date(item.ultima_atualizacao || item.dataCriacao || agora).getTime();
                        const tempoInativo = agora - ultimaLeitura;

                        let statusAtual = item.status || 'Lendo';

                        // Se o utilizador não lê há mais de 1 ano e não concluiu, marca como 'Abandonado'
                        if (tempoInativo > umAnoEmMs && statusAtual !== 'Concluído') {
                            statusAtual = 'Abandonado';
                        }

                        return {
                            ...item,
                            status: statusAtual
                        };
                    });

                    setHistorico(historicoProcessado);
                } else {
                    setHistorico([]);
                }
            } catch (error) {
                console.error("Erro ao carregar o histórico do localStorage:", error);
                setHistorico([]);
            } finally {
                setLoading(false);
            }
        }

        const usuarioId = localStorage.getItem('usuario_id');

        if (usuarioId) {
            carregarHistoricoBanco(usuarioId);
        } else {
            carregarHistoricoLocal();
        }
    }, []);

    // Função auxiliar para definir a classe CSS com base no status
    function getStatusClass(status) {
        if (!status) return 'lendo';
        const s = status.toLowerCase();
        if (s.includes('concluído') || s.includes('concluido')) return 'concluido';
        if (s.includes('abandonado')) return 'abandonado';
        return 'lendo';
    }

    return (
        <>
            <NavbarPesquisa />
            <Link to="/ObrasMangas" className="btn-voltar">← Voltar</Link>

            <main className="container">
                <header className="cabecalho-historico">
                    <h1>Histórico das histórias que você leu</h1>
                    <p>Histórias que você leu e pode continuar de onde parou</p>
                </header>

                <section className="lista-historico" aria-label="Histórico de leituras">
                    {loading ? (
                        <p style={{ color: '#fff', textAlign: 'center' }}>A carregar histórico...</p>
                    ) : historico.length === 0 ? (
                        <p style={{ color: '#fff', textAlign: 'center' }}>Nenhuma história encontrada no seu histórico.</p>
                    ) : (
                        historico.map((item, index) => {
                            const numeroCapa = (index % 20) + 1;

                            return (
                                <Link
                                    to={`/Leitura/${encodeURIComponent(item.obra_titulo || '')}`}
                                    key={item.obra_titulo || index}
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                <article className="item-historico">
                                    <div className="item-esquerda">
                                        <div
                                            className={`capa capa-${numeroCapa}`}
                                            style={item.capa_url ? { backgroundImage: `url(${item.capa_url})`, backgroundSize: 'cover' } : {}}
                                        >
                                            {!item.capa_url && (item.obra_titulo ? item.obra_titulo.charAt(0).toUpperCase() : 'M')}
                                        </div>
                                        <div className="informacoes">
                                            <h2>{item.obra_titulo || 'Obra sem título'}</h2>
                                            <p>Último capítulo: {item.ultimo_capitulo || 1}</p>
                                        </div>
                                    </div>
                                    <div className={`status ${getStatusClass(item.status)}`}>
                                        {(item.status === 'Concluído' || item.status === 'concluido') && (
                                            <span className="icone">✓ </span>
                                        )}
                                        {item.status}
                                    </div>
                                </article>
                                </Link>
                            );
                        })
                    )}
                </section>
            </main>
        </>
    );
}

export default Historico;