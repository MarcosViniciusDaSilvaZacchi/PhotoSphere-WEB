# Funcionalidades e Telas — PhotoSphere

**Disciplina:** Programação Web (FrontEnd)
**Projeto:** PhotoSphere — Plataforma de Compartilhamento de Fotos (#15)
**Aluno:** Mark V
**Entrega:** N1 — Atividade 1 (E1)

> Tabela de tradução de cada funcionalidade do sistema em uma tela navegável do front-end,
> conforme solicitado na Etapa 3 da Parte B da Atividade 1.

---

## Funcionalidades para Usuários

| Funcionalidade | Nome da Tela | Rota (URL) | Arquivo da View |
|---|---|---|---|
| Cadastro de conta | Cadastro | `/register` | `RegisterView.vue` |
| Autenticação (login/logout) | Login | `/login` | `LoginView.vue` |
| Exploração de fotos por categorias | Explorar | `/explore` | `ExploreView.vue` |
| Upload de fotos | Upload de Foto | `/upload` | `UploadView.vue` |
| Criação e listagem de álbuns | Meus Álbuns | `/albums` | `AlbumsView.vue` |
| Visualização de álbum individual | Álbum Individual | `/albums/:id` | `AlbumDetailView.vue` |
| Visualização de foto individual | Foto Individual | `/photo/:id` | `PhotoDetailView.vue` |
| Favoritar e curtir fotos | Foto Individual | `/photo/:id` | `PhotoDetailView.vue` |
| Comentários nas publicações | Foto Individual | `/photo/:id` | `PhotoDetailView.vue` |
| Seguir / deixar de seguir usuários | Perfil de Usuário | `/profile/:username` | `ProfileView.vue` |
| Feed "Seguindo" (fotos de quem você segue) | Feed | `/feed` | `FeedView.vue` |
| Feed "Geral" (todas as fotos) | Feed | `/feed` | `FeedView.vue` |
| Configurações da conta | Configurações | `/settings` | `SettingsView.vue` |
| Página inicial da plataforma | Landing Page | `/` | `HomeView.vue` |

---

## Funcionalidades para Administradores

| Funcionalidade | Nome da Tela | Rota (URL) | Arquivo da View |
|---|---|---|---|
| Dashboard com estatísticas da plataforma | Painel Administrativo | `/admin` | `AdminDashboardView.vue` |
| Cadastro e gerenciamento de categorias de fotos | Gerenciar Categorias | `/admin/categories` | `AdminCategoriesView.vue` |
| Controle e gerenciamento de usuários | Gerenciar Usuários | `/admin/users` | `AdminUsersView.vue` |
| Moderação de conteúdos publicados | Moderação de Conteúdo | `/admin/moderation` | `AdminModerationView.vue` |

---

## Observações

- As funcionalidades **"Favoritar/curtir fotos"**, **"Comentários"** e **"Visualização de foto"** foram agrupadas na mesma tela (`PhotoDetailView.vue`), pois fazem parte da mesma experiência de interação com uma foto.
- As funcionalidades **"Feed Seguindo"** e **"Feed Geral"** foram agrupadas na mesma tela (`FeedView.vue`), diferenciadas por abas/filtros dentro da própria View.
- Rotas com parâmetros dinâmicos (`:id`, `:username`) representam telas geradas dinamicamente — uma para cada recurso no banco de dados.

---

**Total de Views criadas:** 11 de usuário + 4 administrativas = **15 arquivos `.vue`**
**Total de rotas mapeadas no Vue Router:** **16 rotas**
