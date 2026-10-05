import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NavbarPesquisa from '../components/Navbar_pesquisa';
import Rodape from '../components/Rodape';
import { supabase } from '/supabase';
import '../css/historico.css';
import '../css/obras_mangas.css';
import '../css/favoritos.css';

function CardObraFav({ obra }) {
    const imagemSrc = obra.capa_url ? obra.capa_url : `https://placehold.co/180x250/15092E/C384FF?text=${encodeURIComponent(obra.titulo)}`;
    return (
        <Link
            to={`/Leitura/${encodeURIComponent(obra.titulo)}`}
            className="favorito-link"
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

            <main className="container" id="tela-favoritos">
                <header className="cabecalho-historico favoritos-cabecalho">
                    <h1>Meus Favoritos</h1>
                    <p>Suas postagens e obras favoritas salvas em um só lugar</p>
                </header>

                <section aria-label="Favoritos">
                    {loading ? (
                        <p className="favoritos-carregando">Carregando favoritos...</p>
                    ) : favoritos.length === 0 ? (
                        <div className="estado-vazio">
                            <i className="ph ph-heart"></i>
                            <p className="estado-vazio-titulo">
                                Você ainda não adicionou nenhum favorito
                            </p>
                            <p className="estado-vazio-texto">
                                Clique no coração nas postagens ou obras para salvá-las aqui!
                            </p>
                            <Link to="/ObrasMangas" className="estado-vazio-botao">
                                Explorar Obras
                            </Link>
                        </div>
                    ) : (
                        <div className="grade-obras">
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
