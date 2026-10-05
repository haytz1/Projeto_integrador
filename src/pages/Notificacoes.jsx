import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import NavbarPesquisa from '../components/Navbar_pesquisa';
import Rodape from '../components/Rodape';
import '../css/notificacoes.css';

// Ícone de cada tipo de notificação
const ICONES = {
    seguidor: 'ph-user-plus',
    capitulo: 'ph-book-open',
    comentario: 'ph-chat-circle',
    curtida: 'ph-heart',
};

// Mostra "há 5 min", "há 2 h", "há 3 dias"...
function tempoAtras(data) {
    const minutos = Math.floor((Date.now() - new Date(data)) / 60000);

    if (minutos < 1) return 'agora';
    if (minutos < 60) return `há ${minutos} min`;

    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `há ${horas} h`;

    const dias = Math.floor(horas / 24);
    if (dias < 30) return `há ${dias} ${dias === 1 ? 'dia' : 'dias'}`;

    return new Date(data).toLocaleDateString('pt-BR');
}

function Notificacoes() {
    const [notificacoes, setNotificacoes] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [meuId, setMeuId] = useState(null);
    const [filtro, setFiltro] = useState('todas');

    const navigate = useNavigate();

    async function buscarNotificacoes() {
        setCarregando(true);

        // Descobre o id do usuário logado na tabela usuarios
        const { data: authData } = await supabase.auth.getUser();

        if (!authData || !authData.user) {
            setCarregando(false);
            return;
        }

        const { data: usuario } = await supabase
            .from('usuarios')
            .select('id')
            .eq('auth_id', authData.user.id)
            .maybeSingle();

        if (!usuario) {
            setCarregando(false);
            return;
        }

        setMeuId(usuario.id);

        const { data, error } = await supabase
            .from('notificacoes')
            .select('*')
            .eq('id_usuario', usuario.id)
            .order('criado_em', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Erro ao buscar notificações:', error);
            alert('Não foi possível carregar as notificações.');
        } else {
            setNotificacoes(data);
        }

        setCarregando(false);
    }

    useEffect(() => {
        buscarNotificacoes();
    }, []);

    // Marca como lida e abre a página da notificação
    async function abrirNotificacao(notificacao) {
        if (!notificacao.lida) {
            await supabase
                .from('notificacoes')
                .update({ lida: true })
                .eq('id', notificacao.id);
        }

        if (notificacao.link) {
            navigate(notificacao.link);
        } else {
            buscarNotificacoes();
        }
    }

    async function marcarTodasComoLidas() {
        const { error } = await supabase
            .from('notificacoes')
            .update({ lida: true })
            .eq('id_usuario', meuId)
            .eq('lida', false);

        if (error) {
            alert('Erro ao marcar as notificações como lidas.');
            return;
        }

        buscarNotificacoes();
    }

    async function apagarNotificacao(e, id) {
        // Não deixa o clique abrir a notificação
        e.stopPropagation();

        const { error } = await supabase
            .from('notificacoes')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Erro ao apagar a notificação.');
            return;
        }

        setNotificacoes(notificacoes.filter((n) => n.id !== id));
    }

    const naoLidas = notificacoes.filter((n) => !n.lida).length;

    const listaFiltrada =
        filtro === 'nao-lidas'
            ? notificacoes.filter((n) => !n.lida)
            : notificacoes;

    return (
        <div id="tela-notificacoes">
            <NavbarPesquisa />

            <main className="notif-conteudo">
                <header className="notif-cabecalho">
                    <div>
                        <h1>Notificações</h1>
                        <p>
                            {naoLidas > 0
                                ? `Você tem ${naoLidas} ${naoLidas === 1 ? 'notificação não lida' : 'notificações não lidas'}`
                                : 'Você está em dia!'}
                        </p>
                    </div>

                    {naoLidas > 0 && (
                        <button className="notif-botao-lidas" onClick={marcarTodasComoLidas}>
                            <i className="ph ph-checks"></i> Marcar todas como lidas
                        </button>
                    )}
                </header>

                <div className="notif-filtros">
                    <button
                        className={filtro === 'todas' ? 'ativo' : ''}
                        onClick={() => setFiltro('todas')}
                    >
                        Todas
                    </button>
                    <button
                        className={filtro === 'nao-lidas' ? 'ativo' : ''}
                        onClick={() => setFiltro('nao-lidas')}
                    >
                        Não lidas
                    </button>
                </div>

                {carregando ? (
                    <p className="notif-mensagem">Carregando...</p>
                ) : listaFiltrada.length === 0 ? (
                    <div className="notif-vazio">
                        <i className="ph ph-bell-slash"></i>
                        <p>Nenhuma notificação por aqui.</p>
                        <span>
                            Você será avisado quando alguém te seguir, comentar ou curtir
                            suas postagens, ou quando sair capítulo novo das suas obras favoritas.
                        </span>
                    </div>
                ) : (
                    <ul className="notif-lista">
                        {listaFiltrada.map((n) => (
                            <li
                                key={n.id}
                                className={n.lida ? 'notif-item' : 'notif-item nao-lida'}
                                onClick={() => abrirNotificacao(n)}
                            >
                                <i className={`ph ${ICONES[n.tipo] || 'ph-bell'} notif-icone`}></i>

                                <div className="notif-texto">
                                    <p>{n.mensagem}</p>
                                    <span>{tempoAtras(n.criado_em)}</span>
                                </div>

                                <button
                                    className="notif-apagar"
                                    onClick={(e) => apagarNotificacao(e, n.id)}
                                    aria-label="Apagar notificação"
                                >
                                    <i className="ph ph-x"></i>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </main>

            <Rodape />
        </div>
    );
}

export default Notificacoes;
