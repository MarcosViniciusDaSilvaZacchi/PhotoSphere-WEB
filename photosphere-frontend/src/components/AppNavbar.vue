<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { isAuthenticated, user, logout } = useAuth()

async function handleLogout() {
  await logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="navbar">
    <div class="navbar__brand">
      <RouterLink to="/" class="d-flex align-items-center gap-2">
        <img src="@/assets/minilogo.jpg" alt="PhotoSphere" class="navbar-logo rounded" />
        <span>PhotoSphere</span>
      </RouterLink>
    </div>

    <!-- Navegação central: apenas rotas funcionais reais (ADR-013) -->
    <nav class="navbar__links">
      <RouterLink to="/">Início</RouterLink>
      <!-- Link da Aula 07: Publicar Foto (visível apenas para usuários autenticados) -->
      <RouterLink v-if="isAuthenticated" to="/upload" class="nav-upload-link">
        <i class="bi bi-cloud-arrow-up-fill me-1"></i> Publicar Foto
      </RouterLink>
    </nav>

    <div class="navbar__auth">
      <!-- Se logado: exibe Meu Perfil, saudação e botão Sair -->
      <template v-if="isAuthenticated">
        <RouterLink to="/profile/me" class="btn-profile-link">
          <i class="bi bi-person-circle me-1"></i> Meu Perfil
        </RouterLink>
        <span class="user-greeting">Olá, <strong>{{ user?.username }}</strong></span>
        <button @click="handleLogout" class="btn-logout">
          <i class="bi bi-box-arrow-right me-1"></i> Sair
        </button>
      </template>

      <!-- Se deslogado: exibe Entrar e Cadastrar -->
      <template v-else>
        <RouterLink to="/login" class="nav-login-link">Entrar</RouterLink>
        <RouterLink to="/register" class="btn-register-link">Cadastrar</RouterLink>
      </template>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  height: 64px;
  background-color: #1f120c;
  border-bottom: 2px solid #FF6622;
  box-shadow: 0 4px 15px rgba(255, 102, 34, 0.15);
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar__brand a {
  color: #fff;
  text-decoration: none;
  font-size: 1.25rem;
  font-weight: bold;
}

.navbar__links,
.navbar__auth {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.navbar__links a,
.navbar__auth a {
  color: #ccc;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.navbar__links a:hover,
.navbar__auth a:hover,
.navbar__links a.router-link-active,
.navbar__auth a.router-link-active {
  color: #FF6622;
}

.user-greeting {
  font-size: 0.9rem;
  color: #ddd;
}

.user-greeting strong {
  color: #FF6622;
}

.btn-logout {
  background: transparent;
  border: 1px solid #FF6622;
  color: #FF6622;
  padding: 0.35rem 0.9rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout:hover {
  background-color: #FF6622;
  color: #fff;
}

.btn-register-link {
  background-color: #FF6622;
  color: #fff !important;
  padding: 0.35rem 0.9rem;
  border-radius: 6px;
  font-weight: 600;
  transition: background-color 0.2s;
}

.navbar-logo {
  height: 32px;
  width: 32px;
  object-fit: cover;
  border: 1px solid #FF6622;
}

.btn-profile-link {
  color: #fff !important;
  background-color: rgba(255, 102, 34, 0.15);
  border: 1px solid #FF6622;
  padding: 0.35rem 0.8rem;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.2s ease-in-out;
}

.btn-profile-link:hover,
.btn-profile-link.router-link-active {
  background-color: #FF6622 !important;
  color: #fff !important;
}

.btn-register-link:hover {
  background-color: #E74800 !important;
}

.nav-upload-link {
  color: #fff !important;
  background-color: rgba(255, 102, 34, 0.15);
  border: 1px solid #FF6622;
  padding: 0.35rem 0.85rem;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.2s ease-in-out;
  display: inline-flex;
  align-items: center;
}

.nav-upload-link:hover,
.nav-upload-link.router-link-active {
  background-color: #FF6622 !important;
  color: #fff !important;
  box-shadow: 0 0 12px rgba(255, 102, 34, 0.4);
}
</style>
