/**
 * stores/notifications.js — O número do sino, com polling (Aula 14).
 *
 * Polling: perguntar de tempos em tempos (setInterval) "quantas não lidas eu tenho?".
 *  - 30 s: rápido o bastante para o aviso parecer "ao vivo" e leve para o servidor
 *    (cada aba logada faz 2 requisições por minuto, e a rota é só um COUNT indexado);
 *  - quem LIGA é a Navbar, quando a pessoa entra na conta; quem DESLIGA é a Navbar,
 *    ao sair (e ao ser desmontada);
 *  - if (timerId !== null) return: startPolling chamado duas vezes (login, F5, watch
 *    imediato) NÃO cria um segundo temporizador — senão as requisições dobrariam;
 *  - aba escondida não pergunta (document.visibilityState); ao voltar, pergunta na hora.
 *
 * A corrida do contador: o polling pede o número, a pessoa marca uma notificação como
 * lida (o número desce para 2), e a resposta VELHA do polling (3) chega depois e
 * sobrescreve o 2. Cada refresh recebe um número (lastRefreshId) e só a resposta da
 * chamada mais recente vale. setUnreadCount (chamado com o número que a API devolveu
 * ao marcar como lida) também SOBE o lastRefreshId: assim, qualquer refresh que
 * estava no ar antes dele vira "velho" e é descartado.
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUnreadCount } from '@/services/notificationService'
import { NOTIFICATIONS } from '@/config/constants'

export const useNotificationsStore = defineStore('notifications', () => {
  const unreadCount = ref(0)
  let lastRefreshId = 0
  let timerId = null

  async function refresh() {
    const refreshId = ++lastRefreshId
    try {
      const response = await getUnreadCount()
      if (refreshId === lastRefreshId) unreadCount.value = response.data.unreadCount
    } catch {
      // polling é leitura silenciosa: se falhar, tenta de novo no próximo ciclo
    }
  }

  function setUnreadCount(value) {
    lastRefreshId++ // invalida qualquer refresh que ainda esteja no ar
    unreadCount.value = Math.max(0, value)
  }

  function refreshIfVisible() {
    if (document.visibilityState === 'visible') refresh()
  }

  function startPolling() {
    if (timerId !== null) return
    refresh() // uma pergunta imediata ao entrar
    timerId = setInterval(refreshIfVisible, NOTIFICATIONS.POLL_MS)
    document.addEventListener('visibilitychange', refreshIfVisible)
  }

  function stopPolling() {
    if (timerId !== null) {
      clearInterval(timerId)
      timerId = null
    }
    // a MESMA referência de função do addEventListener — senão o ouvinte não sai
    document.removeEventListener('visibilitychange', refreshIfVisible)
    lastRefreshId++ // uma resposta que chegue depois do logout não acende o sino
    unreadCount.value = 0
  }

  return { unreadCount, refresh, setUnreadCount, refreshIfVisible, startPolling, stopPolling }
})
