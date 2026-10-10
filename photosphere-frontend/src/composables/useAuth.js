/**
 * src/composables/useAuth.js — Composable de Autenticação.
 *
 * Centraliza e abstrai o acesso ao estado e operações de autenticação da aplicação,
 * desacoplando componentes (Navbar, Sidebar, etc.) e o Vue Router da implementação
 * direta da Store Pinia (authStore).
 */

import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export function useAuth() {
  const authStore = useAuthStore()

  // Propriedades computadas reativas
  const user = computed(() => authStore.user)
  const token = computed(() => authStore.token)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isAdmin = computed(() => authStore.isAdmin)

  /**
   * Realiza login através do authStore
   * @param {Object} credentials - { email, password }
   */
  async function login(credentials) {
    return await authStore.login(credentials)
  }

  /**
   * Realiza logout e limpa a sessão local
   */
  async function logout() {
    return await authStore.logout()
  }

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    login,
    logout,
  }
}
