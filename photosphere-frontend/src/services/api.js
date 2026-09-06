/**
 * services/api.js — Instância única do Axios para o PhotoSphere.
 *
 * Este é o único arquivo do projeto que importa o axios diretamente.
 * Todo o resto importa 'api' a partir daqui.
 *
 * O interceptor de resposta trata os erros em três ramos:
 *
 * 1. SUCESSO → (response) => response.data
 *    "Descasca" um nível da resposta: em vez de receber o objeto do Axios
 *    com .data, .status etc., já recebemos direto o { success, message, data }
 *    que a nossa API retorna. Evita escrever response.data em todo lugar.
 *
 * 2. error.response → A API respondeu, mas com status de erro (4xx ou 5xx).
 *    O erro já vem formatado pelo apiResponse.js do backend, então
 *    reaproveitamos o { message, errors } que ele manda.
 *
 * 3. error.request → A requisição foi enviada, mas nenhuma resposta chegou.
 *    Acontece quando a API está fora do ar ou sem conexão com a internet.
 *    Não existe error.response.data para ler, então usamos uma mensagem genérica amigável.
 *
 * else → Erro raro na própria montagem da requisição (configuração inválida).
 *
 * Em qualquer caso, o .catch() sempre recebe { message, errors, status } —
 * esse padrão único elimina o "um tratamento de erro por tela".
 */

import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // http://localhost:3000/api
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor de Requisição: anexa o token do localStorage se existir
api.interceptors.request.use(
  (config) => {
    // Ler diretamente do localStorage evita dependência circular entre api.js e stores/auth.js
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  // Ramo 1 — Sucesso: descasca o envelope do Axios, entrega direto o body da API
  (response) => response.data,

  // Ramo 2, 3 e else — Erros: normaliza tudo no mesmo formato { message, errors, status }
  (error) => {
    if (error.response) {
      // Se for 401 (Não autorizado), limpa sessão e redireciona ao Login
      if (error.response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')

        // Se não estivermos já na tela de login, redireciona guardando a rota pretendida
        if (window.location.pathname !== '/login') {
          const redirect = encodeURIComponent(window.location.pathname + window.location.search)
          window.location.href = `/login?redirect=${redirect}`
        }
      }

      // Ramo 2: API respondeu com erro (4xx / 5xx)
      const apiError = error.response.data
      return Promise.reject({
        message: apiError.message || 'Ocorreu um erro na requisição.',
        errors: apiError.errors || [],
        status: error.response.status,
      })
    } else if (error.request) {
      // Ramo 3: requisição enviada, nenhuma resposta recebida (API fora do ar)
      return Promise.reject({
        message: 'Não foi possível se conectar ao servidor. Verifique sua conexão ou tente mais tarde.',
        errors: [],
        status: null,
      })
    } else {
      // else: erro ao montar a própria requisição
      return Promise.reject({
        message: 'Erro inesperado ao preparar a requisição.',
        errors: [],
        status: null,
      })
    }
  }
)

export default api

