/**
 * src/composables/useAsyncData.js — Esqueleto de "tela que lê dados" (Aula 12).
 *
 * Substitui o trio isLoading / apiErrorMessage / try-catch-finally que estava
 * copiado em cada tela.
 *
 * Recebe uma FUNÇÃO que faz a chamada — `() => getPhotoById(id)` — e não a
 * chamada em si (`getPhotoById(id)`). Com a função, o composable decide QUANDO
 * chamar (ao montar, ao mudar a rota, no "Tentar de novo") e pode chamar de novo
 * quantas vezes quiser. Passando `getPhotoById(id)`, a requisição sairia uma vez
 * só, na hora de montar o objeto, e nunca mais.
 *
 * Corrida entre respostas: ao trocar rápido de /photo/1 para /photo/2, a resposta
 * da 1 pode chegar DEPOIS da 2 e sobrescrever a tela com a foto errada. Cada
 * chamada recebe um número (lastCallId); só a resposta da chamada mais recente
 * é aplicada.
 *
 * @param {() => Promise<{ data: any }>} fetcher - função que chama o service
 * @param {{ initialData?: any, immediate?: boolean, watch?: import('vue').WatchSource }} options
 */

import { ref, watch as vueWatch } from 'vue'

export function useAsyncData(fetcher, { initialData = null, immediate = true, watch = null } = {}) {
  const data = ref(initialData)
  const error = ref(null) // { message, errors, status } vindo do interceptor
  const isLoading = ref(false)
  let lastCallId = 0

  async function execute() {
    const callId = ++lastCallId
    isLoading.value = true
    error.value = null
    try {
      const response = await fetcher()
      if (callId === lastCallId) data.value = response.data
    } catch (err) {
      if (callId === lastCallId) error.value = err
    } finally {
      if (callId === lastCallId) isLoading.value = false
    }
  }

  if (watch) {
    vueWatch(watch, execute, { immediate })
  } else if (immediate) {
    execute()
  }

  return { data, error, isLoading, execute }
}
