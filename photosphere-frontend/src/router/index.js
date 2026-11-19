import { createRouter, createWebHistory } from 'vue-router'

// ── Rotas Públicas ──────────────────────────────────────────────────────────
import HomeView          from '@/views/HomeView.vue'
import LoginView         from '@/views/LoginView.vue'
import RegisterView      from '@/views/RegisterView.vue'
import SearchView        from '@/views/SearchView.vue'        // Aula 13 (substitui o placeholder ExploreView)

// ── Rotas de Usuário Autenticado ────────────────────────────────────────────
import FeedView          from '@/views/FeedView.vue'
import UploadView        from '@/views/UploadView.vue'
import AlbumsView        from '@/views/AlbumsView.vue'
import AlbumDetailView   from '@/views/AlbumDetailView.vue'
import PhotoDetailView   from '@/views/PhotoDetailView.vue'
import MyProfileView     from '@/views/profile/MyProfileView.vue'
import PublicProfileView from '@/views/profile/PublicProfileView.vue'   // Aula 09
import MyPhotosView      from '@/views/MyPhotosView.vue'                 // Aula 09
import EditPhotoView     from '@/views/EditPhotoView.vue'                // Aula 09
import LikedPhotosView   from '@/views/LikedPhotosView.vue'              // Aula 10
import FollowListView    from '@/views/FollowListView.vue'               // Aula 11
import FollowingFeedView from '@/views/FollowingFeedView.vue'            // Aula 11
import NotificationsView from '@/views/NotificationsView.vue'            // Aula 14
import SettingsView      from '@/views/SettingsView.vue'

// ── Rotas de Administrador (Aula 15: rotas filhas dentro do AdminLayout) ─────
import AdminLayout          from '@/components/layout/AdminLayout.vue'
import AdminDashboardView   from '@/views/admin/AdminDashboardView.vue'
import AdminCategoriesView  from '@/views/admin/AdminCategoriesView.vue'
import AdminUsersView       from '@/views/admin/AdminUsersView.vue'
import AdminModerationView  from '@/views/admin/AdminModerationView.vue'
import AdminPhotosView      from '@/views/admin/AdminPhotosView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // Volta ao topo ao trocar de tela (e restaura a posição no botão Voltar)
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  },
  routes: [

    // ── Públicas ─────────────────────────────────────────────────────────
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      // Aula 13: busca de fotos e pessoas — pública, termo na URL (?q=)
      path: '/search',
      name: 'search',
      component: SearchView,
    },
    {
      // links antigos de "Explorar" continuam funcionando
      path: '/explore',
      redirect: { name: 'search' },
    },

    // ── Usuário autenticado (exigem login) ───────────────────────────────
    {
      path: '/feed',
      name: 'feed',
      component: FeedView,
      meta: { requiresAuth: true },
    },
    {
      // Aula 11: feed só com as fotos de quem eu sigo — mesmo path do item "Seguindo" da Navbar
      path: '/following',
      name: 'following-feed',
      component: FollowingFeedView,
      meta: { requiresAuth: true },
    },
    {
      path: '/upload',
      name: 'upload',
      component: UploadView,
      meta: { requiresAuth: true },
    },
    {
      path: '/albums',           // Aula 13: Meus Álbuns (a "Minhas Coleções" do roteiro)
      name: 'albums',
      component: AlbumsView,
      meta: { requiresAuth: true },
    },
    {
      // Aula 13: detalhe PÚBLICO — o visitante vê álbuns públicos; a API responde 403
      // para os privados de outra pessoa (a tela mostra "privado")
      path: '/albums/:id',       // :id = parâmetro dinâmico (ex: /albums/42)
      name: 'album-detail',
      component: AlbumDetailView,
    },
    {
      // Aula 09: detalhe público — a API usa optionalAuth (visitante também vê)
      path: '/photo/:id',        // :id = parâmetro dinâmico (ex: /photo/7)
      name: 'photo-detail',
      component: PhotoDetailView,
    },
    {
      path: '/photo/:id/edit',   // Aula 09: edição, só o dono consegue salvar (a API garante)
      name: 'photo-edit',
      component: EditPhotoView,
      meta: { requiresAuth: true },
    },
    {
      path: '/liked',            // Aula 10: Fotos Curtidas (um clique pelo coração da Navbar)
      name: 'liked-photos',
      component: LikedPhotosView,
      meta: { requiresAuth: true },
    },
    {
      path: '/notifications',    // Aula 14: lista de notificações (o sino da Navbar usa { name: 'notifications' })
      name: 'notifications',
      component: NotificationsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/my-photos',        // Aula 09: Minhas Fotos (editar + excluir)
      name: 'my-photos',
      component: MyPhotosView,
      meta: { requiresAuth: true },
    },
    {
      path: '/profile/me',
      name: 'my-profile',
      component: MyProfileView,
      meta: { requiresAuth: true },
    },
    {
      // Aula 09: perfil público — visitante também acessa (sem requiresAuth)
      path: '/profile/:username', // ex: /profile/markv
      name: 'profile',
      component: PublicProfileView,
    },
    {
      // Aula 11: UMA tela, DUAS rotas — a diferença chega como prop (kind), vinda daqui.
      // Públicas, como o perfil: visitante também vê quem segue quem.
      path: '/profile/:username/followers',
      name: 'profile-followers',
      component: FollowListView,
      props: { kind: 'followers' },
    },
    {
      path: '/profile/:username/following',
      name: 'profile-following',
      component: FollowListView,
      props: { kind: 'following' },
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { requiresAuth: true },
    },

    // ── Administrador (Aula 15) ────────────────────────────────────────────
    // Uma rota PAI com o layout do painel; a meta fica no pai e vale para todas as
    // filhas (o Vue Router junta a meta de todas as rotas que casaram em to.meta).
    // /admin sozinho redireciona para o Dashboard. Paths das filhas são relativos (sem /).
    {
      path: '/admin',
      name: 'admin',
      component: AdminLayout,
      redirect: { name: 'admin-dashboard' },
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        { path: 'dashboard', name: 'admin-dashboard', component: AdminDashboardView },
        { path: 'moderation', name: 'admin-moderation', component: AdminModerationView }, // Denúncias
        { path: 'users', name: 'admin-users', component: AdminUsersView },
        { path: 'photos', name: 'admin-photos', component: AdminPhotosView },
        // Categorias (regra de negócio do PhotoSphere) ainda não fazem parte do roteiro:
        // a tela segue como placeholder, fora das abas, até a aula que tratar delas.
        { path: 'categories', name: 'admin-categories', component: AdminCategoriesView },
      ],
    },
  ],
})

// ── Guarda de Navegação Global (Navigation Guard) ───────────────────────────
// Atualizado na Aula 06 para utilizar o composable useAuth()
// Aula 15: guarda por PAPEL (requiresAdmin), depois da checagem de login.
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

router.beforeEach((to) => {
  const { isAuthenticated, isAdmin } = useAuth()

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    // Usuário deslogado tentando acessar rota protegida: redireciona ao Login
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresAdmin && !isAdmin.value) {
    // ⚠️ Esta guarda é só USABILIDADE: ela lê o isAdmin guardado no navegador
    // (localStorage), que qualquer pessoa pode editar. Quem protege os DADOS é a API
    // (isAuthenticated + isAdmin em /api/admin): com o isAdmin "falsificado", o painel
    // abre, mas todas as chamadas voltam 403.
    useToast().error('Você não tem permissão para acessar a administração.')
    return { name: 'feed' }
  }

  return true
})

export default router
