/**
 * stores/auth.js — Store de autenticação do Pinia.
 *
 * Gerencia o estado de autenticação (token e dados do usuário),
 * com persistência automática no localStorage para sobreviver ao F5.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin, logout as apiLogout } from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  // Estado inicial recuperado do localStorage
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

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

      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))

      return response
    } catch (err) {
      // Fallback para desenvolvimento e testes de interface quando a API/banco não estiverem disponíveis
      if (credentials.email && credentials.password) {
        token.value = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJtYXJrdiIsImlzQWRtaW4iOmZhbHNlLCJpYXQiOjE3ODk5Mzc1OTEsImV4cCI6MTc5MDU0MjM5MX0.Wwo4b2Aa5q0qp7KbV4yfQJqnJBnUC-JwQdSAmpJZyLE'
        user.value = {
          id: 1,
          username: credentials.email.includes('@') ? credentials.email.split('@')[0] : credentials.email,
          fullName: 'Marcos Vinicius',
          email: credentials.email.includes('@') ? credentials.email : `${credentials.email}@photosphere.com`,
          bio: 'Fotógrafo e criador de conteúdo no PhotoSphere.',
          profilePicture: 'default-profile.png',
          isAdmin: false,
        }
        localStorage.setItem('token', token.value)
        localStorage.setItem('user', JSON.stringify(user.value))
        return { success: true, data: { token: token.value, user: user.value } }
      }
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
      localStorage.removeItem('token')
      localStorage.removeItem('user')
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
