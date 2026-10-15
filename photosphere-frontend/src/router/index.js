import { createRouter, createWebHistory } from 'vue-router'

// ── Rotas Públicas ──────────────────────────────────────────────────────────
import HomeView          from '@/views/HomeView.vue'
import LoginView         from '@/views/LoginView.vue'
import RegisterView      from '@/views/RegisterView.vue'
import ExploreView       from '@/views/ExploreView.vue'

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
import SettingsView      from '@/views/SettingsView.vue'

// ── Rotas de Administrador ──────────────────────────────────────────────────
import AdminDashboardView   from '@/views/admin/AdminDashboardView.vue'
import AdminCategoriesView  from '@/views/admin/AdminCategoriesView.vue'
import AdminUsersView       from '@/views/admin/AdminUsersView.vue'
import AdminModerationView  from '@/views/admin/AdminModerationView.vue'

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
      path: '/explore',
      name: 'explore',
      component: ExploreView,
    },

    // ── Usuário autenticado (exigem login) ───────────────────────────────
    {
      path: '/feed',
      name: 'feed',
      component: FeedView,
      meta: { requiresAuth: true },
    },
    {
      path: '/upload',
      name: 'upload',
      component: UploadView,
      meta: { requiresAuth: true },
    },
    {
      path: '/albums',
      name: 'albums',
      component: AlbumsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/albums/:id',       // :id = parâmetro dinâmico (ex: /albums/42)
      name: 'album-detail',
      component: AlbumDetailView,
      meta: { requiresAuth: true },
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
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { requiresAuth: true },
    },

    // ── Administrador (exigem login e perfil admin) ────────────────────────
    {
      path: '/admin',
      name: 'admin',
      component: AdminDashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/categories',
      name: 'admin-categories',
      component: AdminCategoriesView,
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: AdminUsersView,
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/moderation',
      name: 'admin-moderation',
      component: AdminModerationView,
      meta: { requiresAuth: true },
    },
  ],
})

// ── Guarda de Navegação Global (Navigation Guard) ───────────────────────────
// Atualizado na Aula 06 para utilizar o composable useAuth()
import { useAuth } from '@/composables/useAuth'

router.beforeEach((to, from, next) => {
  const { isAuthenticated } = useAuth()

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    // Usuário deslogado tentando acessar rota protegida: redireciona ao Login
    next({
      name: 'login',
      query: { redirect: to.fullPath },
    })
  } else {
    next()
  }
})

export default router
