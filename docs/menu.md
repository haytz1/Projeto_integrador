Quero fazer uma alteração no menu da foto de perfil da tela inicial do AnimeSpot.

Na tela inicial, existe uma foto/ícone de perfil no canto superior direito do header.

Quero que, quando o usuário CLICAR nessa foto de perfil, seja aberto um menu dropdown abaixo dela, semelhante ao comportamento do menu de perfil do GitHub.

Use os screenshots que estou enviando como REFERÊNCIA VISUAL e de comportamento.

REQUISITOS:

1. Ao clicar na foto de perfil no canto superior direito:
   - Abrir um menu dropdown imediatamente abaixo da foto.
   - O menu deve ficar visualmente conectado à foto de perfil.
   - Clicar novamente na foto deve fechar o menu.
   - Clicar fora do menu também deve fechá-lo.

2. O dropdown deve conter estas opções:
   - "Ver perfil"
   - "Configurações"
   - "Sair" (somente se a funcionalidade de logout já existir no projeto)

3. "Ver perfil":
   - Ao clicar, deve navegar para a página de perfil do usuário que já existe no projeto.
   - NÃO criar uma nova página de perfil se já existir uma.
   - Reutilizar a rota/componente existente.

4. "Configurações":
   - Ao clicar, deve navegar para a página de configurações que já existe no projeto.
   - NÃO criar uma nova página de configurações se já existir uma.
   - Reutilizar a rota/componente existente.

5. DESIGN:
   - O dropdown deve seguir o mesmo estilo visual do AnimeSpot.
   - Usar o tema escuro com detalhes em roxo.
   - Bordas arredondadas.
   - Sombra/glow discreto em roxo.
   - Os itens devem ter hover visual.
   - O menu deve ficar alinhado à foto de perfil.
   - O menu não deve quebrar o layout do header.
   - Deve funcionar corretamente em desktop e mobile.

6. IMPORTANTE:
   - Antes de alterar o código, analise a estrutura atual do projeto e descubra:
     a - onde o header/navbar está implementado;
     b - onde o botão/foto de perfil está implementado;
     c - qual é a rota atual da página de perfil;
     d - qual é a rota atual da página de configurações;
     e - quais componentes de menu/dropdown já existem e podem ser reutilizados.

7. Não recrie funcionalidades que já existem.
   Apenas conecte o menu da foto de perfil às páginas/rotas existentes.

8. Preserve completamente o restante da tela inicial e do header.
   Não altere cores, espaçamentos ou componentes que não sejam necessários para essa funcionalidade.

9. Depois de implementar:
   - verifique se o clique na foto abre o menu;
   - verifique se "Ver perfil" funciona;
   - verifique se "Configurações" funciona;
   - verifique se clicar fora fecha o menu;
   - verifique se não existem erros no console;
   - verifique se o layout continua responsivo.

