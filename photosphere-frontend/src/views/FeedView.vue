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
  <div class="feed-view container py-4">
    <!-- Cabeçalho -->
    <div class="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary pb-3">
      <div>
        <h2 class="text-white mb-1 fw-bold">
          <i class="bi bi-grid-3x3-gap-fill text-orange me-2"></i> Feed de Fotografias
        </h2>
        <p class="text-muted mb-0">Confira as publicações mais recentes da comunidade PhotoSphere</p>
      </div>

      <RouterLink to="/upload" class="btn btn-brand">
        <i class="bi bi-plus-lg me-1"></i> Publicar Foto
      </RouterLink>
    </div>

    <!-- Alerta de Erro -->
    <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
      <div>{{ errorMessage }}</div>
    </div>

    <!-- Grid de Fotos -->
    <div v-if="photos.length > 0" class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4 mb-4">
      <div v-for="photo in photos" :key="photo.id" class="col">
        <PhotoCard :photo="photo" />
      </div>
    </div>

    <!-- Estado Vazio -->
    <div v-else-if="!loading" class="text-center py-5 bg-dark rounded border border-secondary my-4">
      <i class="bi bi-images text-muted fs-1 d-block mb-3"></i>
      <h4 class="text-white">Nenhuma foto encontrada</h4>
      <p class="text-muted">Seja o primeiro a compartilhar uma fotografia incrível!</p>
      <RouterLink to="/upload" class="btn btn-brand mt-2">
        <i class="bi bi-cloud-arrow-up-fill me-1"></i> Publicar Agora
      </RouterLink>
    </div>

    <!-- Botão Carregar Mais e Spinner -->
    <div class="text-center py-3">
      <button
        v-if="hasMore && photos.length > 0"
        @click="fetchPhotos(true)"
        :disabled="loading"
        class="btn btn-outline-brand px-4 py-2"
      >
        <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
        <i v-else class="bi bi-arrow-down-circle me-2"></i>
        {{ loading ? 'Carregando...' : 'Carregar mais' }}
      </button>

      <p v-else-if="photos.length > 0 && !hasMore" class="text-muted small">
        <i class="bi bi-check-circle me-1"></i> Você chegou ao fim das publicações recentes.
      </p>
    </div>
  </div>
</template>

<style scoped>
.feed-view {
  max-width: 1100px;
}

.text-orange {
  color: #FF6622;
}

.btn-brand {
  background-color: #FF6622;
  color: #fff;
  border: none;
  font-weight: 600;

  transition: background-color 0.2s ease;
}

.btn-brand:hover {
  background-color: #E74800;
  color: #fff;
}

.btn-outline-brand {
  border: 1px solid #FF6622;
  color: #FF6622;
  font-weight: 600;
  border-radius: 20px;
  transition: all 0.2s ease;
}

.btn-outline-brand:hover {
  background-color: #FF6622;
  color: #fff;
}
</style>
