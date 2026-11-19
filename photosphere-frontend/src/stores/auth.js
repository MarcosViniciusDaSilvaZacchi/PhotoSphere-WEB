/**
 * stores/auth.js — Store de autenticação do Pinia.
 *
 * Gerencia o estado de autenticação (token e dados do usuário),
 * com persistência automática no localStorage para sobreviver ao F5.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin, logout as apiLogout } from '@/services/authService'
import { STORAGE_KEYS } from '@/config/constants'

export const useAuthStore = defineStore('auth', () => {
  // Estado inicial recuperado do localStorage
  const token = ref(localStorage.getItem(STORAGE_KEYS.TOKEN) || null)
  const user = ref(JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || 'null'))

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => !!user.value?.isAdmin)

  /**
   * Realiza login através da API, armazena token e user, e persiste no localStorage.
   */
  async function login(credentials) {
    try {
      const response = await apiLogin(credentials.email, credentials.password)
      token.value = response.data.token
      user.value = response.data.user

      localStorage.setItem(STORAGE_KEYS.TOKEN, token.value)
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user.value))

      return response
    } catch (err) {
      throw err
    }
  }

  /**
   * Encerra a sessão localmente descartando token e user, e avisa o backend.
   */
  async function logout() {
    try {
      await apiLogout()
    } catch (e) {
      // Mesmo se a API falhar, o logout local deve acontecer
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem(STORAGE_KEYS.TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USER)
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    login,
    logout,
  }
})
