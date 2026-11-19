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
 *
 * Aula 12 — quem AVISA o usuário (notifyIfNeeded):
 *  - 401 → sessão inválida: limpa o login e leva à tela de Login (sem toast);
 *  - requisição marcada com { silent: true } (formulários) → sem toast: o erro
 *    aparece dentro do próprio formulário, ao lado dos campos;
 *  - leitura (GET) → sem toast: a tela que pediu os dados mostra o erro no lugar
 *    do conteúdo (um toast + uma tela de erro seria aviso duplicado);
 *  - qualquer outra AÇÃO que falha (curtir, seguir, comentar, excluir...) → toast de erro.
 */

import axios from 'axios'
import { STORAGE_KEYS, MESSAGES } from '@/config/constants'
import { useToast } from '@/composables/useToast'

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
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

function redirectToLogin() {
  localStorage.removeItem(STORAGE_KEYS.TOKEN)
  localStorage.removeItem(STORAGE_KEYS.USER)

  // Se não estivermos já na tela de login, redireciona guardando a rota pretendida
  if (window.location.pathname !== '/login') {
    const redirect = encodeURIComponent(window.location.pathname + window.location.search)
    window.location.href = `/login?redirect=${redirect}`
  }
}

/**
 * Decide se o erro vira toast. Recebe o erro já normalizado e a config da requisição.
 */
function notifyIfNeeded(normalized, config = {}) {
  if (normalized.status === 401) {
    redirectToLogin()
    return
  }
  if (config.silent) return

  const method = (config.method || 'get').toLowerCase()
  if (method === 'get') return

  useToast().error(normalized.message)
}

api.interceptors.response.use(
  // Ramo 1 — Sucesso: descasca o envelope do Axios, entrega direto o body da API
  (response) => response.data,

  // Ramo 2, 3 e else — Erros: normaliza tudo no mesmo formato { message, errors, status }
  (error) => {
    let normalized

    if (error.response) {
      // Ramo 2: API respondeu com erro (4xx / 5xx)
      const apiError = error.response.data || {}
      normalized = {
        message: apiError.message || MESSAGES.UNEXPECTED_ERROR,
        errors: apiError.errors || [],
        status: error.response.status,
      }
    } else if (error.request) {
      // Ramo 3: requisição enviada, nenhuma resposta recebida (API fora do ar)
      normalized = { message: MESSAGES.NETWORK_ERROR, errors: [], status: null }
    } else {
      // else: erro ao montar a própria requisição
      normalized = { message: MESSAGES.REQUEST_ERROR, errors: [], status: null }
    }

    notifyIfNeeded(normalized, error.config)
    return Promise.reject(normalized)
  }
)

export default api
