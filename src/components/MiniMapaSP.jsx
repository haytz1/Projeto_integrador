import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../css/minimapa.css';

// Fix do ícone padrão do Leaflet (quebra com bundlers)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Ícone customizado roxo para os pins de evento
const criarIconePin = (cor = '#7c3aed') => L.divIcon({
    className: '',
    html: `
        <div class="map-pin-custom" style="color: ${cor}">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
                <ellipse cx="16" cy="38" rx="6" ry="2.5" fill="rgba(0,0,0,0.25)"/>
                <path d="M16 0C8.268 0 2 6.268 2 14c0 9.5 14 26 14 26s14-16.5 14-26C30 6.268 23.732 0 16 0z" fill="${cor}" stroke="#fff" stroke-width="1.5"/>
                <circle cx="16" cy="14" r="6" fill="white" opacity="0.9"/>
                <text x="16" y="19" text-anchor="middle" font-size="9" fill="${cor}" font-weight="bold" font-family="sans-serif">📅</text>
            </svg>
        </div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -42],
});

// Componente para mudar o zoom ao expandir
function MapaControlador({ expandido }) {
    const map = useMap();
    React.useEffect(() => {
        setTimeout(() => map.invalidateSize(), 300);
        if (expandido) {
            map.setView([-23.5505, -46.6333], 12);
        } else {
            map.setView([-23.5505, -46.6333], 11);
        }
    }, [expandido, map]);
    return null;
}

// Eventos fixos no mapa de SP com coordenadas reais
const EVENTOS_MAPA = [
    {
        id: 1,
        nome: 'Anime Friends',
        local: 'São Paulo Expo',
        data: '18 de julho',
        categoria: 'Animes',
        lat: -23.6268,
        lng: -46.6999,
        cor: '#7c3aed',
    },
    {
        id: 2,
        nome: 'Festival de Mangás',
        local: 'Bairro da Liberdade',
        data: '25 de julho',
        categoria: 'Mangás',
        lat: -23.5578,
        lng: -46.6368,
        cor: '#db2777',
    },
    {
        id: 3,
        nome: 'Encontro Otaku',
        local: 'Parque do Ibirapuera',
        data: '2 de agosto',
        categoria: 'Comunidade',
        lat: -23.5874,
        lng: -46.6576,
        cor: '#0891b2',
    },
    {
        id: 4,
        nome: 'SP Cosplay Fest',
        local: 'Centro de SP',
        data: '15 de agosto',
        categoria: 'Cosplay',
        lat: -23.5490,
        lng: -46.6350,
        cor: '#d97706',
    },
    {
        id: 5,
        nome: 'Konbanwa Festival',
        local: 'Vila Mariana',
        data: '30 de agosto',
        categoria: 'Cultura',
        lat: -23.5900,
        lng: -46.6320,
        cor: '#059669',
    },
];

function MiniMapaSP() {
    const [expandido, setExpandido] = useState(false);
    const [eventoAtivo, setEventoAtivo] = useState(null);

    return (
        <>
            {/* MINI MAPA NA SIDEBAR */}
            <div className="minimapa-wrapper" onClick={() => setExpandido(true)} title="Clique para expandir o mapa">
                <div className="minimapa-label">
                    <i className="ph-fill ph-map-pin"></i> São Paulo
                    <span className="minimapa-expand-hint">clique para expandir</span>
                </div>
                <div className="minimapa-container">
                    <MapContainer
                        center={[-23.5505, -46.6333]}
                        zoom={11}
                        zoomControl={false}
                        scrollWheelZoom={false}
                        dragging={false}
                        doubleClickZoom={false}
                        style={{ height: '100%', width: '100%', borderRadius: '12px' }}
                        attributionControl={false}
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />
                        {EVENTOS_MAPA.map(ev => (
                            <Marker
                                key={ev.id}
                                position={[ev.lat, ev.lng]}
                                icon={criarIconePin(ev.cor)}
                            />
                        ))}
                    </MapContainer>
                    <div className="minimapa-overlay">
                        <i className="ph ph-arrows-out"></i>
                    </div>
                </div>
                <div className="minimapa-pins-count">
                    <i className="ph-fill ph-map-pin"></i> {EVENTOS_MAPA.length} eventos em SP
                </div>
            </div>

            {/* MODAL DO MAPA EXPANDIDO */}
            {expandido && (
                <div className="mapa-modal-overlay" onClick={() => { setExpandido(false); setEventoAtivo(null); }}>
                    <div className="mapa-modal-container" onClick={e => e.stopPropagation()}>
                        <div className="mapa-modal-header">
                            <div className="mapa-modal-title">
                                <i className="ph-fill ph-map-pin"></i>
                                Eventos em São Paulo
                            </div>
                            <button className="mapa-modal-close" onClick={() => { setExpandido(false); setEventoAtivo(null); }}>
                                <i className="ph ph-x"></i>
                            </button>
                        </div>

                        <div className="mapa-modal-body">
                            {/* Mapa grande */}
                            <div className="mapa-modal-map">
                                <MapContainer
                                    center={[-23.5505, -46.6333]}
                                    zoom={12}
                                    zoomControl={true}
                                    scrollWheelZoom={true}
                                    style={{ height: '100%', width: '100%' }}
                                    attributionControl={false}
                                >
                                    <MapaControlador expandido={expandido} />
                                    <TileLayer
                                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                    />
                                    {EVENTOS_MAPA.map(ev => (
                                        <Marker
                                            key={ev.id}
                                            position={[ev.lat, ev.lng]}
                                            icon={criarIconePin(ev.cor)}
                                            eventHandlers={{ click: () => setEventoAtivo(ev) }}
                                        >
                                            <Popup className="mapa-popup-custom">
                                                <div className="popup-content">
                                                    <span className="popup-categoria" style={{ background: ev.cor }}>{ev.categoria}</span>
                                                    <strong className="popup-nome">{ev.nome}</strong>
                                                    <span className="popup-local"><i className="ph-fill ph-map-pin"></i> {ev.local}</span>
                                                    <span className="popup-data"><i className="ph ph-calendar-blank"></i> {ev.data}</span>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                                </MapContainer>
                            </div>

                            {/* Lista de eventos lateral */}
                            <div className="mapa-modal-lista">
                                <h3 className="lista-titulo">Eventos no mapa</h3>
                                <div className="lista-eventos">
                                    {EVENTOS_MAPA.map(ev => (
                                        <div
                                            key={ev.id}
                                            className={`lista-evento-item ${eventoAtivo?.id === ev.id ? 'ativo' : ''}`}
                                            style={{ borderLeftColor: ev.cor }}
                                            onClick={() => setEventoAtivo(ev)}
                                        >
                                            <span className="lista-evento-cat" style={{ color: ev.cor }}>{ev.categoria}</span>
                                            <strong className="lista-evento-nome">{ev.nome}</strong>
                                            <span className="lista-evento-local">
                                                <i className="ph-fill ph-map-pin"></i> {ev.local}
                                            </span>
                                            <span className="lista-evento-data">
                                                <i className="ph ph-calendar-blank"></i> {ev.data}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default MiniMapaSP;
