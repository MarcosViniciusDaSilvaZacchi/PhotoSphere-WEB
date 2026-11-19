<script setup>
/**
 * MyPhotosView.vue — Minhas Fotos (Aula 09).
 *
 * Lista as fotos do usuário logado com as ações Editar e Excluir, injetadas
 * no slot "actions" do PhotoCard.
 *
 * O modal de confirmação fica AQUI, fora do v-for e fora do card:
 *  - um único modal para a tela inteira (não um por card);
 *  - se estivesse dentro do card, herdaria o transform do :hover do card e o
 *    position: fixed passaria a ser relativo ao card — o modal "andaria" com o mouse.
 *    (O BaseModal ainda usa <Teleport to="body"> como segunda garantia.)
 *
 * Exclusão: isDeleting deixa o modal "ocupado" (persistent + botões desabilitados)
 * e, no sucesso, a foto é removida da lista local — sem recarregar a página.
 *
 * Aula 12: leitura pelo useAsyncData; sucesso da exclusão vira toast verde e a
 * falha vira o toast vermelho do interceptor (o modal continua aberto).
 */

import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getMyPhotos, deletePhoto } from '@/services/photoService'
import { useAsyncData } from '@/composables/useAsyncData'
import { useToast } from '@/composables/useToast'
import PhotoCard from '@/components/PhotoCard.vue'
import BaseModal from '@/components/base/BaseModal.vue'

const toast = useToast()

// Aula 12: leitura pelo useAsyncData
const { data: photos, error, isLoading } = useAsyncData(getMyPhotos, { initialData: [] })

// Estado do modal de exclusão
const isDeleteModalOpen = ref(false)
const photoToDelete = ref(null)
const isDeleting = ref(false)

function askDelete(photo) {
  photoToDelete.value = photo
  isDeleteModalOpen.value = true
}

async function confirmDelete() {
  if (!photoToDelete.value || isDeleting.value) return
  isDeleting.value = true

  try {
    const removed = photoToDelete.value
    await deletePhoto(removed.id)
    // Remoção local: a grade atualiza na hora, sem nova requisição de listagem
    photos.value = photos.value.filter((p) => p.id !== removed.id)
    toast.success(`"${removed.title}" foi excluída.`)
    isDeleteModalOpen.value = false
    photoToDelete.value = null
  } catch {
    // O toast de erro é do interceptor (e aparece NA FRENTE do modal, que continua aberto
    // para a pessoa tentar de novo ou cancelar). Um toast.error aqui duplicaria o aviso.
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div class="ps-page">
    <header class="ps-page-header">
      <div>
        <span class="ps-eyebrow">Sua galeria</span>
        <h1 class="ps-title">Minhas Fotos</h1>
        <p class="text-muted mb-0">Edite ou exclua as fotos que você publicou.</p>
      </div>
      <RouterLink to="/upload" class="ps-btn ps-btn--primary">
        <i class="bi bi-plus-lg"></i> Publicar foto
      </RouterLink>
    </header>


    <div v-if="error" class="alert alert-danger d-flex align-items-center gap-2 border-0" role="alert">
      <i class="bi bi-exclamation-triangle-fill"></i> {{ error.message || 'Não foi possível carregar suas fotos.' }}
    </div>

    <!-- Carregando -->
    <div v-if="isLoading" class="ps-grid">
      <div v-for="n in 3" :key="n" class="ps-skeleton" style="height: 360px"></div>
    </div>

    <!-- Grade com ações -->
    <div v-else-if="photos.length" class="ps-grid">
      <div v-for="(photo, i) in photos" :key="photo.id" class="ps-fade-up" :style="{ animationDelay: `${i * 40}ms` }">
        <PhotoCard :photo="photo" :show-author="false">
          <template #actions>
            <RouterLink :to="{ name: 'photo-edit', params: { id: photo.id } }" class="ps-btn ps-btn--ghost ps-btn--sm">
              <i class="bi bi-pencil"></i> Editar
            </RouterLink>
            <button type="button" class="ps-btn ps-btn--danger ps-btn--sm" @click="askDelete(photo)">
              <i class="bi bi-trash3"></i> Excluir
            </button>
          </template>
        </PhotoCard>
      </div>
    </div>

    <!-- Estado vazio com link -->
    <div v-else-if="!error" class="ps-empty">
      <div class="ps-empty__icon"><i class="bi bi-camera"></i></div>
      <h2 class="h5 fw-bold">Você ainda não publicou nenhuma foto</h2>
      <p class="text-muted">Suas publicações aparecem aqui para você editar ou excluir.</p>
      <RouterLink to="/upload" class="ps-btn ps-btn--primary mt-2">
        <i class="bi bi-cloud-arrow-up"></i> Publicar minha primeira foto
      </RouterLink>
    </div>

    <!-- Modal único, fora do card e fora do v-for -->
    <BaseModal
      v-model="isDeleteModalOpen"
      title="Excluir esta foto?"
      icon="bi-trash3"
      variant="danger"
      :persistent="isDeleting"
    >
      <p class="mb-0">
        <strong class="text-white">"{{ photoToDelete?.title }}"</strong> será removida permanentemente,
        junto com o arquivo da imagem. Essa ação não pode ser desfeita.
      </p>

      <template #footer="{ close }">
        <button type="button" class="ps-btn ps-btn--ghost" :disabled="isDeleting" @click="close">Cancelar</button>
        <button type="button" class="ps-btn ps-btn--danger" :disabled="isDeleting" @click="confirmDelete">
          <span v-if="isDeleting" class="spinner-border spinner-border-sm"></span>
          <i v-else class="bi bi-trash3"></i>
          {{ isDeleting ? 'Excluindo...' : 'Excluir foto' }}
        </button>
      </template>
    </BaseModal>
  </div>
</template>

