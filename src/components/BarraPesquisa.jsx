import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { createClient } from '@supabase/supabase-js';

import './BarraPesquisa.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(
    supabaseUrl,
    supabaseKey
);

const animesClassicos = [
    { id: 20, nome: 'Naruto' },
    { id: 1735, nome: 'Naruto Shippuden' },
    { id: 21, nome: 'One Piece' },
    { id: 223, nome: 'Dragon Ball' },
    { id: 813, nome: 'Dragon Ball Z' },
    { id: 269, nome: 'Bleach' },
    { id: 527, nome: 'Pokémon' },
    { id: 1535, nome: 'Death Note' },
    { id: 101922, nome: 'Demon Slayer' },
    { id: 113415, nome: 'Jujutsu Kaisen' },
    { id: 16498, nome: 'Attack on Titan' },
    { id: 21459, nome: 'My Hero Academia' }
];

function BarraPesquisa() {

    const [pesquisa, setPesquisa] = useState('');
    const [resultados, setResultados] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [carregando, setCarregando] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {

        if (pesquisa.trim().length < 2) {
            setResultados([]);
            setUsuarios([]);
            return;
        }

        const buscar = async () => {

            setCarregando(true);

            try {

                const texto =
                    pesquisa.trim().toLowerCase();

                // =========================
                // BUSCAR USUÁRIOS
                // =========================

                const {
                    data: usuariosEncontrados,
                    error: erroUsuarios
                } = await supabase
                    .from('usuarios')
                    .select('id, username, foto')
                    .ilike(
                        'username',
                        `%${texto}%`
                    )
                    .limit(5);

                if (erroUsuarios) {

                    console.error(
                        'Erro ao buscar usuários:',
                        erroUsuarios
                    );

                    setUsuarios([]);

                } else {

                    setUsuarios(
                        usuariosEncontrados || []
                    );

                }


                // =========================
                // BUSCAR ANIMES
                // =========================

                const classicosEncontrados =
                    animesClassicos.filter(
                        (anime) =>
                            anime.nome
                                .toLowerCase()
                                .includes(texto)
                    );


                const query = `
                    query ($search: String) {
                        Page(
                            page: 1,
                            perPage: 10
                        ) {
                            media(
                                search: $search,
                                type: ANIME
                            ) {
                                id

                                title {
                                    romaji
                                    english
                                    native
                                }

                                coverImage {
                                    large
                                }
                            }
                        }
                    }
                `;


                const resposta = await fetch(
                    'https://graphql.anilist.co',
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json',

                            'Accept':
                                'application/json'
                        },

                        body: JSON.stringify({
                            query: query,

                            variables: {
                                search:
                                    pesquisa.trim()
                            }
                        })
                    }
                );


                const dados =
                    await resposta.json();


                const resultadosApi =
                    dados?.data?.Page?.media || [];


                const classicosFormatados =
                    classicosEncontrados.map(
                        (anime) => ({
                            id: anime.id,

                            title: {
                                english:
                                    anime.nome,

                                romaji:
                                    anime.nome,

                                native:
                                    anime.nome
                            },

                            coverImage: null,

                            classico: true
                        })
                    );


                const idsClassicos =
                    new Set(
                        classicosFormatados.map(
                            (anime) =>
                                anime.id
                        )
                    );


                const outrosResultados =
                    resultadosApi.filter(
                        (anime) =>
                            !idsClassicos.has(
                                anime.id
                            )
                    );


                setResultados([
                    ...classicosFormatados,
                    ...outrosResultados
                ]);

            } catch (erro) {

                console.error(
                    'Erro ao pesquisar:',
                    erro
                );

                setResultados([]);
                setUsuarios([]);

            } finally {

                setCarregando(false);

            }
        };


        const tempo =
            setTimeout(
                buscar,
                400
            );


        return () =>
            clearTimeout(tempo);

    }, [pesquisa]);


    function abrirAnime(anime) {

        setPesquisa('');

        setResultados([]);

        setUsuarios([]);

        navigate(
            `/anime/${anime.id}`
        );
    }


    function abrirUsuario(usuario) {

        setPesquisa('');

        setResultados([]);

        setUsuarios([]);

        navigate(
            `/Perfil/${usuario.id}`
        );
    }


    function pegarNome(anime) {

        return (
            anime.title?.english ||
            anime.title?.romaji ||
            anime.title?.native ||
            'Anime sem título'
        );
    }


    return (

        <div className="pesquisa-container">

            <div className="barra-pesquisa">

                <span className="icone-pesquisa">
                    ⌕
                </span>


                <input
                    type="text"
                    placeholder="Buscar animes, mangás, notícias..."
                    value={pesquisa}
                    onChange={(e) =>
                        setPesquisa(
                            e.target.value
                        )
                    }
                />

            </div>


            {pesquisa.trim().length >= 2 && (

                <div className="resultados-pesquisa">

                    {carregando ? (

                        <div className="nenhum-resultado">
                            Pesquisando...
                        </div>

                    ) : (

                        <>

                            {/* USUÁRIOS */}

                            {usuarios.length > 0 && (

                                <>

                                    <div className="titulo-resultados">
                                        Usuários
                                    </div>


                                    {usuarios.map(
                                        (usuario) => (

                                            <div
                                                className="resultado-anime"
                                                key={`usuario-${usuario.id}`}
                                                onClick={() =>
                                                    abrirUsuario(
                                                        usuario
                                                    )
                                                }
                                            >

                                                <div className="resultado-imagem">

                                                    {usuario.foto ? (

                                                        <>
                                                            <img
                                                                src={
                                                                    usuario.foto
                                                                }
                                                                alt=""
                                                                onError={(e) => {

                                                                    e.currentTarget.style.display =
                                                                        'none';

                                                                    const fallback =
                                                                        e.currentTarget.nextElementSibling;

                                                                    if (fallback) {
                                                                        fallback.style.display =
                                                                            'flex';
                                                                    }

                                                                }}
                                                            />

                                                            <i
                                                                className="ph ph-user"
                                                                style={{
                                                                    display:
                                                                        'none',

                                                                    width:
                                                                        '100%',

                                                                    height:
                                                                        '100%',

                                                                    alignItems:
                                                                        'center',

                                                                    justifyContent:
                                                                        'center',

                                                                    fontSize:
                                                                        '22px'
                                                                }}
                                                            ></i>

                                                        </>

                                                    ) : (

                                                        <i className="ph ph-user"></i>

                                                    )}

                                                </div>


                                                <span className="resultado-nome">

                                                    {usuario.username}

                                                </span>

                                            </div>

                                        )
                                    )}

                                </>

                            )}


                            {/* ANIMES */}

                            {resultados.length > 0 && (

                                <>

                                    <div className="titulo-resultados">
                                        Animes
                                    </div>


                                    {resultados.map(
                                        (anime) => (

                                            <div
                                                className="resultado-anime"
                                                key={`anime-${anime.id}`}
                                                onClick={() =>
                                                    abrirAnime(
                                                        anime
                                                    )
                                                }
                                            >

                                                <div className="resultado-imagem">

                                                    {anime.coverImage?.large ? (

                                                        <img
                                                            src={
                                                                anime.coverImage.large
                                                            }
                                                            alt=""
                                                            onError={(e) => {

                                                                e.currentTarget.style.display =
                                                                    'none';

                                                                const fallback =
                                                                    e.currentTarget.nextElementSibling;

                                                                if (fallback) {
                                                                    fallback.style.display =
                                                                        'flex';
                                                                }

                                                            }}
                                                        />

                                                    ) : null}


                                                    <span
                                                        style={{
                                                            display:
                                                                anime.coverImage?.large
                                                                    ? 'none'
                                                                    : 'flex',

                                                            width:
                                                                '100%',

                                                            height:
                                                                '100%',

                                                            alignItems:
                                                                'center',

                                                            justifyContent:
                                                                'center'
                                                        }}
                                                    >
                                                        🍥
                                                    </span>

                                                </div>


                                                <span className="resultado-nome">

                                                    {pegarNome(
                                                        anime
                                                    )}

                                                </span>

                                            </div>

                                        )
                                    )}

                                </>

                            )}


                            {/* NENHUM RESULTADO */}

                            {usuarios.length === 0 &&
                                resultados.length === 0 && (

                                    <div className="nenhum-resultado">
                                        Nenhum resultado encontrado
                                    </div>

                                )}

                        </>

                    )}

                </div>

            )}

        </div>
    );
}

export default BarraPesquisa;