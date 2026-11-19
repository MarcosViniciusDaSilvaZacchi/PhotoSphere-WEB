<script setup>
/**
 * AdminPhotosView.vue — Fotos (Aula 15). Rota filha /admin/photos. A "AdminVideosView" do roteiro.
 *
 * - Mesma busca com debounce da tela de usuários;
 * - selo "N denúncias pendentes" (pendingReportsCount, contado pela API numa
 *   segunda consulta agrupada);
 * - Excluir: photoToDelete é ao mesmo tempo o interruptor do ConfirmModal e o dado
 *   que ele mostra; a mensagem diz tudo o que some e que não dá para desfazer;
 * - confirmDelete ESPERA a API: só depois do sucesso a linha sai da lista, aparece o
 *   toast e o modal fecha. Falha (Offline) → o modal continua aberto + toast vermelho.
 */

import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { getAdminPhotos, deleteAdminPhoto } from '@/services/adminService'
import { usePaginatedList } from '@/composables/usePaginatedList'
import { useDebouncedValue } from '@/composables/useDebouncedValue'
import { useToast } from '@/composables/useToast'
import { getPhotoUrl } from '@/utils/media'
import { pluralize } from '@/utils/format'
import { SEARCH } from '@/config/constants'
import ConfirmModal from '@/components/base/ConfirmModal.vue'

const toast = useToast()
const typedText = ref('')
const term = useDebouncedValue(typedText, SEARCH.DEBOUNCE_MS)

const { items, hasMore, isLoading, isLoadingMore, error, loadMore } = usePaginatedList(
  (page, limit) => getAdminPhotos(term.value.trim(), page, limit),
  undefined,
  { watch: term }
)

const photoToDelete = ref(null)
const isDeleting = ref(false)
const deleteMessage = computed(() =>
  photoToDelete.value
    ? `"${photoToDelete.value.title}", de @${photoToDelete.value.author?.username}, será apagada junto com as curtidas, os comentários, as denúncias, as notificações e o arquivo da imagem; ela também sai de todos os álbuns. Não dá para desfazer.`
    : ''
)

async function confirmDelete() {
  if (!photoToDelete.value || isDeleting.value) return
  isDeleting.value = true
  try {
    const removed = photoToDelete.value
    await deleteAdminPhoto(removed.id)
    items.value = items.value.filter((photo) => photo.id !== removed.id)
    toast.success(`"${removed.title}" foi excluída.`)
    photoToDelete.value = null
  } catch {
    // toast de erro do interceptor; o modal continua aberto
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <section>
    <div class="admin-search ps-surface mb-3">
      <i class="bi bi-search"></i>
      <input v-model="typedText" type="search" placeholder="Buscar fotos pelo título" aria-label="Buscar fotos" />
    </div>

    <div v-if="isLoading" class="admin-list">
      <div v-for="n in 4" :key="n" class="ps-skeleton" style="height: 88px"></div>
    </div>

    <div v-else-if="error" class="alert alert-danger d-flex align-items-center gap-2 border-0" role="alert">
      <i class="bi bi-shield-exclamation"></i> {{ error.message || 'Não foi possível carregar as fotos.' }}
    </div>

    <ul v-else-if="items.length" class="admin-list">
      <li v-for="photo in items" :key="photo.id" class="admin-row">
        <RouterLink :to="{ name: 'photo-detail', params: { id: photo.id } }" class="admin-row__thumb">
          <img :src="getPhotoUrl(photo.imageUrl)" :alt="photo.title" />
        </RouterLink>
        <div class="admin-row__body">
          <RouterLink :to="{ name: 'photo-detail', params: { id: photo.id } }" class="admin-row__title">{{ photo.title }}</RouterLink>
          <span class="admin-row__meta">
            de @{{ photo.author?.username }} · {{ pluralize(photo.likesCount, 'curtida') }} · {{ pluralize(photo.commentsCount, 'comentário') }}
          </span>
          <div v-if="photo.pendingReportsCount > 0" class="admin-row__tags">
            <span class="admin-tag admin-tag--warn">
              <i class="bi bi-flag-fill"></i>
              {{ pluralize(photo.pendingReportsCount, 'denúncia pendente', 'denúncias pendentes') }}
            </span>
          </div>
        </div>
        <button type="button" class="ps-btn ps-btn--danger ps-btn--sm admin-row__action" @click="photoToDelete = photo">
          <i class="bi bi-trash3"></i> Excluir
        </button>
      </li>
    </ul>

    <div v-else class="ps-empty">
      <div class="ps-empty__icon"><i class="bi bi-images"></i></div>
      <h2 class="h5 fw-bold">Nenhuma foto encontrada</h2>
    </div>

    <div v-if="hasMore && items.length" class="text-center pt-4">
      <button type="button" class="ps-btn ps-btn--ghost px-4" :disabled="isLoadingMore" @click="loadMore">
        {{ isLoadingMore ? 'Carregando...' : 'Carregar mais' }}
      </button>
    </div>

    <ConfirmModal
      v-if="photoToDelete"
      title="Excluir esta foto?"
      :message="deleteMessage"
      confirm-label="Excluir foto"
      :busy="isDeleting"
      @confirm="confirmDelete"
      @close="photoToDelete = null"
    />
  </section>
</template>
