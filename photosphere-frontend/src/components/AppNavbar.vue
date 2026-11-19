<script setup>
/**
 * AppNavbar.vue — Barra de navegação principal.
 *
 * Aula 09: os links soltos "Meu Perfil / Olá / Sair" viraram um MENU SUSPENSO
 * no avatar, controlado por estado (isMenuOpen). Ele fecha:
 *  - ao clicar fora (composable useClickOutside);
 *  - ao escolher um item (closeMenu no @click de cada item);
 *  - com a tecla Esc;
 *  - ao trocar de rota (watch na rota, cobre o botão Voltar do navegador).
 *
 * Aula 10: atalho de UM clique para as Fotos Curtidas (coração), além do item no menu.
 * Aula 11: item "Seguindo" na navegação principal → /following (feed de quem eu sigo).
 * Aula 13: barra de busca (Enter → /search?q=), item "Explorar" e "Meus Álbuns" no menu.
 * Aula 14: sino com o número de não lidas. A Navbar liga o polling quando a pessoa
 * entra na conta (watch imediato) e desliga ao sair e ao ser desmontada.
 */

import { ref, computed, watch, onMounted, onBeforeUnmount, onUnmounted } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useClickOutside } from '@/composables/useClickOutside'
import { getProfilePictureUrl } from '@/utils/media'
import { useNotificationsStore } from '@/stores/notifications'

const router = useRouter()
const route = useRoute()
const { isAuthenticated, user, logout } = useAuth()

// ─── Menu do avatar ──────────────────────────────────────────────────────────
// ─── Sino (Aula 14) ──────────────────────────────────────────────────────────
const notificationsStore = useNotificationsStore()
const unreadCount = computed(() => notificationsStore.unreadCount)
const badgeText = computed(() => (unreadCount.value > 99 ? '99+' : String(unreadCount.value)))
const bellLabel = computed(() =>
  unreadCount.value > 0
    ? `Notificações (${unreadCount.value} não ${unreadCount.value === 1 ? 'lida' : 'lidas'})`
    : 'Notificações'
)

watch(
  isAuthenticated,
  (logged) => {
    if (logged) notificationsStore.startPolling()
    else notificationsStore.stopPolling()
  },
  { immediate: true }
)
onUnmounted(() => notificationsStore.stopPolling())

// ─── Busca (Aula 13) ─────────────────────────────────────────────────────────
const searchText = ref('')

function submitSearch() {
  const q = searchText.value.trim()
  if (!q) return // campo vazio: não navega
  router.push({ name: 'search', query: { q } })
  searchText.value = ''
}

const isMenuOpen = ref(false)
const menuRef = ref(null)

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}

useClickOutside(menuRef, closeMenu)

function onKeydown(event) {
  if (event.key === 'Escape') closeMenu()
}
onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))

watch(() => route.fullPath, closeMenu)

const avatarUrl = computed(() => getProfilePictureUrl(user.value?.profilePicture))
const displayName = computed(() => user.value?.fullName || user.value?.username || '')

async function handleLogout() {
  closeMenu()
  await logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="navbar-ps">
    <div class="navbar-ps__inner">
      <!-- Marca -->
      <RouterLink to="/" class="brand">
        <img src="@/assets/minilogo.jpg" alt="PhotoSphere" class="brand__logo" />
        <span class="brand__name">Photo<span>Sphere</span></span>
      </RouterLink>

      <!-- Navegação central: apenas rotas funcionais reais (ADR-013) -->
      <nav class="nav-links" aria-label="Navegação principal">
        <RouterLink to="/" class="nav-link-ps" exact-active-class="is-active">
          <i class="bi bi-house"></i><span>Início</span>
        </RouterLink>
        <!-- Aula 13: "Explorar" abre a busca (o campo já vem com o foco) -->
        <RouterLink :to="{ name: 'search' }" class="nav-link-ps" active-class="is-active">
          <i class="bi bi-compass"></i><span>Explorar</span>
        </RouterLink>
        <RouterLink v-if="isAuthenticated" to="/feed" class="nav-link-ps" active-class="is-active">
          <i class="bi bi-grid-3x3-gap"></i><span>Feed</span>
        </RouterLink>
        <!-- Aula 11: feed de quem eu sigo (o "item Seguindo da Sidebar" do roteiro) -->
        <RouterLink v-if="isAuthenticated" to="/following" class="nav-link-ps" active-class="is-active">
          <i class="bi bi-people"></i><span>Seguindo</span>
        </RouterLink>
      </nav>

      <!-- Aula 13: barra de busca, visível também para visitantes -->
      <form class="nav-search" role="search" @submit.prevent="submitSearch">
        <input v-model="searchText" type="search" class="nav-search__input" placeholder="Buscar fotos ou pessoas" aria-label="Buscar fotos ou pessoas" />
        <button type="submit" class="nav-search__btn" aria-label="Buscar"><i class="bi bi-search"></i></button>
      </form>

      <div class="nav-actions">
        <template v-if="isAuthenticated">
          <!-- Aula 14: sino, só para quem está logado; o selo só aparece com não lidas -->
          <RouterLink
            :to="{ name: 'notifications' }"
            class="icon-link icon-link--bell position-relative"
            active-class="is-active"
            :aria-label="bellLabel"
            :title="bellLabel"
          >
            <i class="bi bi-bell"></i>
            <span
              v-if="unreadCount > 0"
              class="bell-badge position-absolute top-0 start-100 translate-middle"
              aria-hidden="true"
            >{{ badgeText }}</span>
          </RouterLink>

          <!-- Aula 10: Fotos Curtidas em um clique -->
          <RouterLink to="/liked" class="icon-link icon-link--heart" active-class="is-active" title="Fotos Curtidas" aria-label="Fotos Curtidas">
            <i class="bi bi-heart"></i>
          </RouterLink>

          <!-- Link da Aula 07: Publicar Foto -->
          <RouterLink to="/upload" class="ps-btn ps-btn--primary ps-btn--sm nav-upload">
            <i class="bi bi-plus-lg"></i><span>Publicar</span>
          </RouterLink>

          <!-- Menu suspenso do avatar (Aula 09) -->
          <div ref="menuRef" class="avatar-menu">
            <button
              type="button"
              class="avatar-trigger"
              :class="{ 'is-open': isMenuOpen }"
              :aria-expanded="isMenuOpen"
              aria-haspopup="menu"
              @click="toggleMenu"
            >
              <img :src="avatarUrl" :alt="user?.username" class="avatar-trigger__img" />
              <span class="avatar-trigger__name">{{ user?.username }}</span>
              <i class="bi bi-chevron-down avatar-trigger__chevron"></i>
            </button>

            <Transition name="dropdown">
              <div v-if="isMenuOpen" class="dropdown-ps" role="menu">
                <div class="dropdown-ps__header">
                  <img :src="avatarUrl" alt="" class="dropdown-ps__avatar" />
                  <div class="text-truncate">
                    <strong class="d-block text-truncate">{{ displayName }}</strong>
                    <small>@{{ user?.username }}</small>
                  </div>
                </div>

                <RouterLink to="/profile/me" class="dropdown-ps__item" role="menuitem" @click="closeMenu">
                  <i class="bi bi-pencil-square"></i> Editar Perfil
                </RouterLink>
                <RouterLink
                  :to="{ name: 'profile', params: { username: user?.username } }"
                  class="dropdown-ps__item"
                  role="menuitem"
                  @click="closeMenu"
                >
                  <i class="bi bi-person"></i> Ver Perfil
                </RouterLink>
                <RouterLink to="/my-photos" class="dropdown-ps__item" role="menuitem" @click="closeMenu">
                  <i class="bi bi-images"></i> Minhas Fotos
                </RouterLink>
                <RouterLink to="/liked" class="dropdown-ps__item" role="menuitem" @click="closeMenu">
                  <i class="bi bi-heart"></i> Fotos Curtidas
                </RouterLink>
                <RouterLink :to="{ name: 'albums' }" class="dropdown-ps__item" role="menuitem" @click="closeMenu">
                  <i class="bi bi-collection"></i> Meus Álbuns
                </RouterLink>

                <div class="dropdown-ps__divider"></div>

                <button type="button" class="dropdown-ps__item dropdown-ps__item--danger" role="menuitem" @click="handleLogout">
                  <i class="bi bi-box-arrow-right"></i> Sair
                </button>
              </div>
            </Transition>
          </div>
        </template>

        <!-- Se deslogado: exibe Entrar e Cadastrar -->
        <template v-else>
          <RouterLink to="/login" class="nav-link-ps">Entrar</RouterLink>
          <RouterLink to="/register" class="ps-btn ps-btn--primary ps-btn--sm">Cadastrar</RouterLink>
        </template>
      </div>
    </div>
  </header>
</template>

<style scoped>
.navbar-ps {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(12, 10, 9, 0.72);
  backdrop-filter: saturate(160%) blur(14px);
  border-bottom: 1px solid var(--ps-border);
}

.navbar-ps__inner {
  max-width: 1240px;
  height: 68px;
  margin: 0 auto;
  padding: 0 1.25rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  color: var(--ps-text);
}
.brand__logo {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  object-fit: cover;
  box-shadow: 0 0 0 1px rgba(255, 102, 34, 0.5), 0 6px 18px -6px rgba(255, 102, 34, 0.6);
}
.brand__name { font-weight: 800; font-size: 1.15rem; letter-spacing: -0.02em; }
.brand__name span { color: var(--brand-color); }

.nav-links { display: flex; gap: 0.25rem; margin-right: auto; }

.nav-link-ps {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 0.85rem;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--ps-muted);
  text-decoration: none;
  transition: color 0.2s, background-color 0.2s;
}
.nav-link-ps:hover { color: var(--ps-text); background: var(--ps-surface-2); }
.nav-link-ps.is-active { color: var(--ps-text); background: var(--ps-surface-2); }
.nav-link-ps.is-active i { color: var(--brand-color); }

.nav-actions { display: flex; align-items: center; gap: 0.75rem; }

/* ─── Busca (Aula 13) ───────────────────────────────────────────────────── */
.nav-search {
  display: flex;
  align-items: center;
  width: min(260px, 26vw);
  border: 1px solid var(--ps-border-strong);
  border-radius: 999px;
  background: var(--ps-surface);
  transition: border-color 0.2s;
}
.nav-search:focus-within { border-color: var(--brand-color); }
.nav-search__input {
  flex: 1;
  min-width: 0;
  padding: 0.45rem 0 0.45rem 0.9rem;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--ps-text);
  font-size: 0.85rem;
}
.nav-search__btn { border: 0; background: transparent; color: var(--ps-muted); padding: 0.4rem 0.75rem; }
.nav-search__btn:hover { color: var(--brand-color); }

/* ─── Atalho das curtidas (Aula 10) ─────────────────────────────────────── */
.icon-link {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: var(--ps-muted);
  font-size: 1.1rem;
  text-decoration: none;
  transition: color 0.2s, background-color 0.2s;
}
.icon-link--heart:hover { color: #ff4d67; background: var(--ps-surface-2); }
.icon-link--heart.is-active { color: #ff4d67; background: rgba(255, 77, 103, 0.12); }
.icon-link--heart.is-active i::before { content: '\f415'; } /* bi-heart-fill */

/* ─── Sino (Aula 14) ────────────────────────────────────────────────────── */
.icon-link--bell:hover { color: var(--brand-color); background: var(--ps-surface-2); }
.icon-link--bell.is-active { color: var(--brand-color); background: rgba(255, 102, 34, 0.12); }
.bell-badge {
  min-width: 1.15rem;
  padding: 0.1rem 0.32rem;
  border-radius: 999px;
  background: #ff4d4f;
  color: #fff;
  font-size: 0.62rem;
  font-weight: 800;
  line-height: 1.1;
  text-align: center;
  box-shadow: 0 0 0 2px var(--ps-bg);
}

/* ─── Avatar + dropdown ───────────────────────────────────────────────────── */
.avatar-menu { position: relative; }

.avatar-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.7rem 0.25rem 0.25rem;
  border-radius: 999px;
  border: 1px solid var(--ps-border-strong);
  background: var(--ps-surface);
  color: var(--ps-text);
  font-weight: 600;
  font-size: 0.88rem;
  transition: border-color 0.2s, background-color 0.2s;
}
.avatar-trigger:hover, .avatar-trigger.is-open { border-color: var(--brand-color); background: var(--ps-surface-2); }
.avatar-trigger__img { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
.avatar-trigger__chevron { font-size: 0.7rem; color: var(--ps-muted); transition: transform 0.2s; }
.avatar-trigger.is-open .avatar-trigger__chevron { transform: rotate(180deg); }

/* Alinhado à DIREITA do botão, para não vazar da tela */
.dropdown-ps {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 248px;
  padding: 0.45rem;
  background: var(--ps-surface);
  border: 1px solid var(--ps-border-strong);
  border-radius: 16px;
  box-shadow: 0 24px 60px -20px rgba(0, 0, 0, 0.85);
  transform-origin: top right;
}

.dropdown-ps__header {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.6rem 0.6rem 0.75rem;
  margin-bottom: 0.3rem;
  border-bottom: 1px solid var(--ps-border);
}
.dropdown-ps__header small { color: var(--ps-muted); }
.dropdown-ps__avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }

.dropdown-ps__item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.6rem 0.7rem;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--ps-text);
  font-size: 0.9rem;
  font-weight: 500;
  text-align: left;
  text-decoration: none;
  transition: background-color 0.15s, color 0.15s;
}
.dropdown-ps__item i { color: var(--ps-muted); width: 1rem; }
.dropdown-ps__item:hover { background: var(--ps-surface-2); }
.dropdown-ps__item:hover i { color: var(--brand-color); }
.dropdown-ps__item--danger { color: #ff8a8e; }
.dropdown-ps__item--danger i { color: #ff8a8e; }
.dropdown-ps__divider { height: 1px; margin: 0.3rem 0; background: var(--ps-border); }

.dropdown-enter-active, .dropdown-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-6px) scale(0.97); }

@media (max-width: 720px) {
  .nav-link-ps span, .avatar-trigger__name, .nav-upload span { display: none; }
  .nav-search { display: none; } /* no celular, a busca fica no item "Explorar" */
  .navbar-ps__inner { gap: 0.5rem; }
}
</style>
