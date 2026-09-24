import React, { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Inicialize o seu cliente Supabase (ou importe de um arquivo de configuração)
const supabase = createClient( supabaseUrl, supabaseKey )

export default function AtualizarFoto({ userId }) {
  const [arquivo, setArquivo] = useState(null)
  const [carregando, setCarregando] = useState(false)

  // Função disparada quando o usuário escolhe um arquivo no <input type="file" />
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setArquivo(e.target.files[0])
    }
  }

  // Função que faz o envio quando clica no botão de salvar
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!arquivo) return alert('Selecione uma imagem primeiro!')

    setCarregando(true)

    try {
      // 1. Definir um nome único para o arquivo para evitar substituir fotos de outros
      const fileExt = arquivo.name.split('.').pop()
      const nomeDoArquivo = `${userId}_${Date.now()}.${fileExt}`

      // 2. Enviar a foto para o bucket 'avatars_usuarios'
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars_usuarios')
        .upload(nomeDoArquivo, arquivo)

      if (uploadError) throw uploadError

      // 3. Pegar a URL pública da foto que acabou de ser enviada
      const { data: urlData } = supabase.storage
        .from('avatars_usuarios')
        .getPublicUrl(uploadData.path)

      const linkDaFoto = urlData.publicUrl

      // 4. Salvar essa URL na coluna 'foto' da tabela 'usuarios' do usuário logado
      const { error: dbError } = await supabase
        .from('usuarios')
        .update({ foto: linkDaFoto })
        .eq('id', userId) // Certifique-se de filtrar pelo ID correto do usuário

      if (dbError) throw dbError

      alert('Foto de perfil atualizada com sucesso!')
    } catch (error) {
      console.error('Erro:', error.message)
      alert('Ocorreu um erro ao atualizar a foto.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Alterar Foto de Perfil</h3>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button type="submit" disabled={carregando}>
        {carregando ? 'Enviando...' : 'Salvar Foto'}
      </button>
    </form>
  )
}