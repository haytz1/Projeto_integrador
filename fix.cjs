const fs = require('fs');

try {
    let app = fs.readFileSync('src/App.jsx', 'utf8');
    app = app.replace(/<Route path='\/leitura\/:tituloObra' element={<Leitura\/>} \/>\r?\n\s*<Route path='\/leitura' element={<Leitura\/>} \/>\r?\n/, '');
    app = app.replace(/<Route path='Denuncias' element={<Denuncias\/>} \/>/, "<Route path='/Denuncias' element={<Denuncias/>} />");
    fs.writeFileSync('src/App.jsx', app);
    console.log('App.jsx fixed');
} catch (e) { console.log(e.message); }

try {
    let cad = fs.readFileSync('src/pages/Cadastro.jsx', 'utf8');
    if(!cad.includes('fotoPreview')) {
        cad = cad.replace(/const \[carregando, setCarregando\] = useState\(false\);/, 
            'const [carregando, setCarregando] = useState(false);\n    const [foto, setFoto] = useState(null);\n    const [fotoPreview, setFotoPreview] = useState(null);');
        cad = cad.replace(/const navigate = useNavigate\(\);/,
            'const navigate = useNavigate();\n\n    const handleFotoChange = (e) => {\n        if (e.target.files && e.target.files[0]) {\n            setFoto(e.target.files[0]);\n            setFotoPreview(URL.createObjectURL(e.target.files[0]));\n        }\n    };');
        
        const uploadLogic = `            let fotoUrl = null;\n\n            if (foto) {\n                const fileExt = foto.name.split('.').pop();\n                const fileName = \\\`\\\${Math.random()}.\\\${fileExt}\\\`;\n                const { error: uploadError } = await supabase.storage\n                    .from('avatars_usuarios')\n                    .upload(fileName, foto);\n\n                if (!uploadError) {\n                    const { data: urlData } = supabase.storage\n                        .from('avatars_usuarios')\n                        .getPublicUrl(fileName);\n                    fotoUrl = urlData.publicUrl;\n                } else {\n                    console.error(\"Erro no upload da foto\", uploadError);\n                }\n            }\n\n            const { data, error } = await supabase.auth.signUp({\n                email: email,\n                password: senha,\n                options: {\n                    data: {\n                        username: username,\n                        ...(fotoUrl && { foto: fotoUrl })\n                    }\n                }\n            });`;
        
        cad = cad.replace(/const \{ data, error \} = await supabase\.auth\.signUp\(\{[\s\S]*?\}\);/, uploadLogic);
        
        cad = cad.replace(/<div\s+className=\"avatar-circle\"[\s\S]*?id=\"avatar-circle\"[\s\S]*?title=\"Clique para adicionar uma foto de perfil\"\s*>/,
            '<div\n                            className=\"avatar-circle\"\n                            id=\"avatar-circle\"\n                            title=\"Clique para adicionar uma foto de perfil\"\n                            style={{ \n                                backgroundImage: fotoPreview ? `url(${fotoPreview})` : \'none\',\n                                backgroundSize: \'cover\',\n                                backgroundPosition: \'center\'\n                            }}\n                        >');
            
        cad = cad.replace(/<div\s+className=\"avatar-placeholder\"[\s\S]*?id=\"avatar-placeholder\"\s*>/,
            '{!fotoPreview && (\n                                <div\n                                    className=\"avatar-placeholder\"\n                                    id=\"avatar-placeholder\"\n                                >');
            
        cad = cad.replace(/<span>Foto<\/span>\s*<\/div>/, '<span>Foto</span>\n\n                                </div>\n                            )}');
        
        cad = cad.replace(/<input\s+type=\"file\"\s+id=\"avatar-input\"[\s\S]*?\/>/,
            '<input\n                            type=\"file\"\n                            id=\"avatar-input\"\n                            className=\"avatar-input\"\n                            accept=\"image/*\"\n                            aria-label=\"Selecionar foto de perfil\"\n                            onChange={handleFotoChange}\n                        />');
        fs.writeFileSync('src/pages/Cadastro.jsx', cad);
        console.log('Cadastro.jsx fixed');
    }
} catch (e) { console.log(e.message); }

try {
    let seg = fs.readFileSync('src/pages/Seguindo.jsx', 'utf8');
    const estadoVazioBlockRegex = /const EstadoVazio = \(\{[\s\S]*?<\/div>\r?\n\s*\);/;
    if(seg.indexOf('const EstadoVazio =') > seg.indexOf('function Seguindo()')) {
        const match = seg.match(estadoVazioBlockRegex);
        if(match) {
            seg = seg.replace(estadoVazioBlockRegex, '');
            seg = seg.replace(/function Seguindo\(\) \{/, match[0] + '\n\nfunction Seguindo() {');
            fs.writeFileSync('src/pages/Seguindo.jsx', seg);
            console.log('Seguindo.jsx fixed');
        }
    }
} catch (e) { console.log(e.message); }

try {
    let lei = fs.readFileSync('src/pages/Leitura.jsx', 'utf8');
    if(!lei.includes('eslint-disable-next-line react-hooks/exhaustive-deps')) {
        lei = lei.replace(/carregarObraECapitulos\(\);\r?\n\s*\}, \[identificador\]\);/, 'carregarObraECapitulos();\n        // eslint-disable-next-line react-hooks/exhaustive-deps\n    }, [identificador]);');
        fs.writeFileSync('src/pages/Leitura.jsx', lei);
        console.log('Leitura.jsx fixed');
    }
} catch (e) { console.log(e.message); }

try {
    let den = fs.readFileSync('src/pages/Denuncias.jsx', 'utf8');
    if(den.includes('const buscarDenuncias = async () => {')) {
        den = den.replace(/const buscarDenuncias = async \(\) => \{/, 'async function buscarDenuncias() {');
        den = den.replace(/if \(!usuarioAutorizado\) \{\r?\n\s*setCarregando\(false\);/, 'if (!usuarioAutorizado) {\n            // eslint-disable-next-line react/set-state-in-effect\n            setCarregando(false);');
        fs.writeFileSync('src/pages/Denuncias.jsx', den);
        console.log('Denuncias.jsx fixed');
    }
} catch (e) { console.log(e.message); }

try {
    let pag = fs.readFileSync('src/pages/PaginaInicial.jsx', 'utf8');
    if(pag.includes('const [usuariosBloqueados')) {
        pag = pag.replace(/const \[usuariosBloqueados, setUsuariosBloqueados\] = useState\(\[\]\);\r?\n/, '');
        fs.writeFileSync('src/pages/PaginaInicial.jsx', pag);
        console.log('PaginaInicial.jsx fixed');
    }
} catch (e) { console.log(e.message); }

try {
    let per = fs.readFileSync('src/pages/Perfil.jsx', 'utf8');
    per = per.replace(/replace\(\/\\[\\'\\\\"\\]\/g, ''\)/g, "replace(/['\"]/g, '')");
    fs.writeFileSync('src/pages/Perfil.jsx', per);
    console.log('Perfil.jsx fixed');
} catch (e) { console.log(e.message); }
