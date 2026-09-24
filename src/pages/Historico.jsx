import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { supabase } from '../../supabase';
import '../css/historico.css';

export default function Historico() {
    const [historico, setHistorico] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        carregarHistorico();
    }, []);

    async function carregarHistorico() {
        // 1. Obtém o utilizador atualmente logado no Supabase
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setLoading(false);
            return;
        }

        // 2. Busca na tabela 'leitura' filtrando pelo email_usuario do utilizador
        const { data, error } = await supabase
            .from('leitura')
            .select('*')
            .eq('email_usuario', user.email);

        if (error) {
            console.error("Erro ao carregar o histórico:", error.message);
        } else {
            setHistorico(data || []);
        }

        setLoading(false);
    }

    // Função para definir a classe CSS de acordo com o status
    function getStatusClass(status) {
        switch (status?.toLowerCase()) {
            case 'concluído':
            case 'concluido':
                return 'status-concluido';
            case 'em andamento':
                return 'status-andamento';
            case 'abandonado':
                return 'status-abandonado';
            default:
                return 'status-andamento';
        }
    }

    return (
        <>
            <Navbar />
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
                        historico.map((item) => (
                            <article className="item-historico" key={item.id}>
                                <div className="item-esquerda">
                                    <div className="capa capa-1">
                                        {item.obra_titulo ? item.obra_titulo.charAt(0).toUpperCase() : 'M'}
                                    </div>
                                    <div className="informacoes">
                                        <h2>{item.obra_titulo}</h2>
                                        <p>Último capítulo: {item.ultimo_capitulo}</p>
                                    </div>
                                </div>
                                <div className={`status ${getStatusClass(item.status)}`}>
                                    {(item.status === 'Concluído' || item.status === 'concluido') && (
                                        <span className="icone">✓</span>
                                    )}
                                    {item.status}
                                </div>
                            </article>
                        ))
                    )}
                </section>
            </main>
        </>
    );
}