<script setup>
import { ref, onMounted } from 'vue'
import { getFeed } from '@/services/photoService'
import PhotoCard from '@/components/PhotoCard.vue'

const photos = ref([])
const page = ref(1)
const limit = 6
const loading = ref(false)
const hasMore = ref(true)
const errorMessage = ref('')

async function fetchPhotos(isLoadMore = false) {
  if (loading.value) return
  loading.value = true
  errorMessage.value = ''

  try {
    const targetPage = isLoadMore ? page.value + 1 : 1
    const response = await getFeed(targetPage, limit)
    const newPhotos = response.data || []

    if (isLoadMore) {
      photos.value = [...photos.value, ...newPhotos]
      page.value = targetPage
    } else {
      photos.value = newPhotos
      page.value = 1
    }

    if (newPhotos.length < limit) {
      hasMore.value = false
    } else {
      hasMore.value = true
    }
  } catch (error) {
    errorMessage.value = error.message || 'Falha ao carregar o feed de fotos.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPhotos()
})
</script>

<template>
  <div class="ps-page feed-view">
    <!-- Cabeçalho -->
    <header class="ps-page-header">
      <div>
        <span class="ps-eyebrow">Comunidade</span>
        <h1 class="ps-title">Feed de Fotografias</h1>
        <p class="text-muted mb-0">As publicações mais recentes da comunidade PhotoSphere.</p>
      </div>
      <RouterLink to="/upload" class="ps-btn ps-btn--primary">
        <i class="bi bi-plus-lg"></i> Publicar Foto
      </RouterLink>
    </header>

    <!-- Alerta de Erro -->
    <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center gap-2 border-0" role="alert">
      <i class="bi bi-exclamation-triangle-fill"></i>
      <div>{{ errorMessage }}</div>
    </div>

    <!-- Carregando a primeira página -->
    <div v-if="loading && photos.length === 0" class="ps-grid">
      <div v-for="n in 6" :key="n" class="ps-skeleton" style="height: 330px"></div>
    </div>

    <!-- Grade de Fotos -->
    <div v-else-if="photos.length > 0" class="ps-grid">
      <div v-for="(photo, i) in photos" :key="photo.id" class="ps-fade-up" :style="{ animationDelay: `${(i % limit) * 40}ms` }">
        <PhotoCard :photo="photo" />
      </div>
    </div>

    <!-- Estado Vazio -->
    <div v-else-if="!errorMessage" class="ps-empty">
      <div class="ps-empty__icon"><i class="bi bi-images"></i></div>
      <h2 class="h5 fw-bold">Nenhuma foto encontrada</h2>
      <p class="text-muted">Seja o primeiro a compartilhar uma fotografia incrível!</p>
      <RouterLink to="/upload" class="ps-btn ps-btn--primary mt-2">
        <i class="bi bi-cloud-arrow-up"></i> Publicar Agora
      </RouterLink>
    </div>

    <!-- Botão Carregar Mais -->
    <div class="text-center pt-5">
      <button
        v-if="hasMore && photos.length > 0"
        @click="fetchPhotos(true)"
        :disabled="loading"
        class="ps-btn ps-btn--ghost px-4"
      >
        <span v-if="loading" class="spinner-border spinner-border-sm"></span>
        <i v-else class="bi bi-arrow-down-circle"></i>
        {{ loading ? 'Carregando...' : 'Carregar mais' }}
      </button>

      <p v-else-if="photos.length > 0 && !hasMore" class="text-muted small">
        <i class="bi bi-check2-circle me-1"></i> Você chegou ao fim das publicações recentes.
      </p>
    </div>
  </div>
</template>
