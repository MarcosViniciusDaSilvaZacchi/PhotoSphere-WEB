/**
 * src/composables/usePaginatedList.js — Lista com "Carregar mais" (Aula 12).
 *
 * Junta o que o Feed e o Feed "Seguindo" repetiam: page, hasMore, a primeira
 * página, a próxima página e os estados de carregamento/erro.
 *
 * @param {(page: number, limit: number) => Promise<{ data: any[] }>} fetchPage
 * @param {number} pageSize
 */

import { ref } from 'vue'
import { PAGE_SIZE } from '@/config/constants'

export function usePaginatedList(fetchPage, pageSize = PAGE_SIZE) {
  const items = ref([])
  const page = ref(1)
  const hasMore = ref(true)
  const isLoading = ref(false)      // primeira página
  const isLoadingMore = ref(false)  // páginas seguintes
  const error = ref(null)

  async function loadFirstPage() {
    isLoading.value = true
    error.value = null
    try {
      const response = await fetchPage(1, pageSize)
      const list = response.data || []
      items.value = list
      page.value = 1
      hasMore.value = list.length === pageSize
    } catch (err) {
      error.value = err
    } finally {
      isLoading.value = false
    }
  }

  async function loadMore() {
    if (isLoadingMore.value || !hasMore.value) return
    isLoadingMore.value = true
    try {
      const next = page.value + 1
      const response = await fetchPage(next, pageSize)
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

  return { items, hasMore, isLoading, isLoadingMore, error, loadMore, reload: loadFirstPage }
}
