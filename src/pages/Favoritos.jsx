import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NavbarPesquisa from '../components/Navbar_pesquisa';
import Rodape from '../components/Rodape';
import { supabase } from '/supabase';
import '../css/historico.css';
import '../css/obras_mangas.css';

function CardObraFav({ obra }) {
    const imagemSrc = obra.capa_url ? obra.capa_url : `https://placehold.co/180x250/15092E/C384FF?text=${encodeURIComponent(obra.titulo)}`;
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
                    />
                </div>
                <div className="card-info">
                    <h2 className="card-nome">{obra.titulo}</h2>
                    <p className="card-autor">
                        {obra.sinopse ? `${obra.sinopse.substring(0, 100)}...` : 'Sem sinopse'}
                    </p>
                </div>
            </article>
        </Link>
    );
}

function Favoritos() {
    const [favoritos, setFavoritos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchFavoritos() {
            const uId = localStorage.getItem('usuario_id');
            if (!uId) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('favoritos')
                .select(`
                    id,
                    obras (
                        id,
                        titulo,
                        sinopse,
                        capa_url
                    )
                `)
                .eq('usuario_id', uId)
                .order('created_at', { ascending: false });

            if (!error && data) {
                // Filtra possíveis nulos caso a obra tenha sido deletada
                setFavoritos(data.map(f => f.obras).filter(o => o !== null));
            }
            setLoading(false);
        }
        fetchFavoritos();
    }, []);

    return (
        <>
            <NavbarPesquisa />

            <main className="container" style={{ padding: '2rem 2rem 4rem', paddingTop: 'calc(64px + 2rem)', minHeight: '80vh', backgroundColor: '#0d1117' }}>
                <header className="cabecalho-historico" style={{ marginBottom: '2rem' }}>
                    <h1 style={{ color: '#fff', fontSize: '2rem', marginBottom: '0.5rem' }}>
                        Meus Favoritos
                    </h1>
                    <p style={{ color: '#aaa', fontSize: '1rem' }}>
                        Suas postagens e obras favoritas salvas em um só lugar
                    </p>
                </header>

                <section aria-label="Favoritos">
                    {loading ? (
                        <p style={{ color: '#fff' }}>Carregando favoritos...</p>
                    ) : favoritos.length === 0 ? (
                        <div style={{
                            background: 'rgba(168, 85, 247, 0.07)',
                            border: '1px dashed rgba(168, 85, 247, 0.3)',
                            padding: '4rem 2rem',
                            borderRadius: '16px',
                            textAlign: 'center'
                        }}>
                            <i className="ph ph-heart" style={{
                                fontSize: '4.5rem',
                                color: '#a855f7',
                                display: 'block',
                                marginBottom: '1.2rem'
                            }}></i>
                            <p style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                Você ainda não adicionou nenhum favorito
                            </p>
                            <p style={{ color: '#888', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                                Clique no coração nas postagens ou obras para salvá-las aqui!
                            </p>
                            <Link to="/ObrasMangas" style={{
                                display: 'inline-block',
                                padding: '10px 24px',
                                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                                color: '#fff',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontWeight: '600',
                                fontSize: '0.95rem'
                            }}>
                                Explorar Obras
                            </Link>
                        </div>
                    ) : (
                        <div className="grade-obras" style={{ margin: '0' }}>
                            {favoritos.map((obra, index) => (
                                <CardObraFav key={`fav-${index}`} obra={obra} />
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <Rodape />
        </>
    );
}

export default Favoritos;
