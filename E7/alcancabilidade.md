# Resposta ao Checklist de Alcançabilidade — Etapa 4 (Atividade 07)

**Disciplina:** Programação Web (FrontEnd)  
**Projeto:** PhotoSphere (#15)  
**Aluno:** Marcos Vinicius da Silva Zacchi  

---

## Perguntas e Respostas da Etapa 4 (Alcançabilidade da Tela de Envio)

### 1. Existe um link ou botão visível na interface para acessar a tela de envio sem precisar digitar a URL manualmente?
**Resposta:** **Sim.**  
Foi adicionado o link com destaque de botão **"Publicar Foto"** (acompanhado do ícone `bi-cloud-arrow-up-fill`) na barra de navegação central (`AppNavbar.vue`). O usuário não precisa conhecer ou digitar `/upload` na barra de endereços do navegador para iniciar o fluxo de publicação.

### 2. Esse link só é exibido para usuários autenticados?
**Resposta:** **Sim.**  
O link utiliza a diretiva `v-if="isAuthenticated"` do composable `useAuth()`. Quando o usuário é um visitante não autenticado, a Navbar exibe exclusivamente os atalhos públicos (*Início*, *Entrar* e *Cadastrar*). Somente após a realização do login o link torna-se visível e clicável.

### 3. Ao clicar no link, a URL muda no navegador sem recarregar a página?
**Resposta:** **Sim.**  
A navegação é implementada via componente `<RouterLink to="/upload">` do Vue Router. A transição ocorre como uma Single Page Application (SPA) pura, atualizando o `<RouterView />` e a URL instantaneamente sem qualquer recarregamento da página (zero refresh).

### 4. Se um usuário deslogado tentar acessar a URL digitando diretamente `/upload`, o que acontece?
**Resposta:**  
O **Navigation Guard global** configurado em `src/router/index.js` intercepta a navegação através da meta-propriedade `requiresAuth: true`. Como `isAuthenticated` é falso, o roteador redireciona o usuário imediatamente para a tela de login (`/login?redirect=%2Fupload`), exibindo a mensagem explicativa: *"Faça login para acessar esta página restrita."*.
