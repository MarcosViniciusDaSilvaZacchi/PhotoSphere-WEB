/**
 * src/composables/usePaginatedList.js — Lista com "Carregar mais" (Aula 12; Aula 15: watch + lastCallId).
 *
 * Junta o que o Feed e o Feed "Seguindo" repetiam: page, hasMore, a primeira
 * página, a próxima página e os estados de carregamento/erro.
 *
 * Aula 15:
 *  - terceiro parâmetro { watch }: quando o filtro/termo muda (denúncias por situação,
 *    busca de usuários e de fotos no painel), a lista recomeça da página 1 sozinha;
 *  - lastCallId: trocar o filtro rápido deixa duas "primeiras páginas" no ar; só a
 *    resposta da mais recente vale (no try, no catch e no finally). O loadMore guarda
 *    o lastCallId do momento em que começou e descarta a resposta se, enquanto ela
 *    vinha, a lista foi recomeçada (senão a página 2 do filtro VELHO entraria no novo).
 *
 * @param {(page: number, limit: number) => Promise<{ data: any[] }>} fetchPage
 * @param {number} pageSize
 * @param {{ watch?: import('vue').WatchSource }} options
 */

import { ref, watch } from 'vue'
import { PAGE_SIZE } from '@/config/constants'

export function usePaginatedList(fetchPage, pageSize = PAGE_SIZE, { watch: source = null } = {}) {
  const items = ref([])
  const page = ref(1)
  const hasMore = ref(true)
  const isLoading = ref(false)      // primeira página
  const isLoadingMore = ref(false)  // páginas seguintes
  const error = ref(null)
  let lastCallId = 0

  async function loadFirstPage() {
    const callId = ++lastCallId
    isLoading.value = true
    error.value = null
    try {
      const response = await fetchPage(1, pageSize)
      if (callId !== lastCallId) return
      const list = response.data || []
      items.value = list
      page.value = 1
      hasMore.value = list.length === pageSize
    } catch (err) {
      if (callId === lastCallId) error.value = err
    } finally {
      if (callId === lastCallId) isLoading.value = false
    }
  }

  async function loadMore() {
    if (isLoadingMore.value || !hasMore.value) return
    const startedAt = lastCallId
    isLoadingMore.value = true
    try {
      const next = page.value + 1
      const response = await fetchPage(next, pageSize)
      if (startedAt !== lastCallId) return // a lista recomeçou enquanto esta página vinha
      const list = response.data || []
      items.value = [...items.value, ...list]
      page.value = next
      hasMore.value = list.length === pageSize
    } catch {
      // ler a próxima página é uma leitura: a tela continua com o que já tinha
      // e o botão "Carregar mais" segue disponível para tentar de novo
    } finally {
      isLoadingMore.value = false
    }
  }

  loadFirstPage()
  if (source) watch(source, loadFirstPage)

  return { items, hasMore, isLoading, isLoadingMore, error, loadMore, reload: loadFirstPage }
}
