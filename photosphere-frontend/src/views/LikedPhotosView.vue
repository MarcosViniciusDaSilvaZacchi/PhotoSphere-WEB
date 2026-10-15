<script setup>
/**
 * LikedPhotosView.vue — Fotos Curtidas (Aula 10).
 *
 * Rota /liked (requiresAuth), alcançável com UM clique pelo coração da Navbar.
 * A lista é buscada a cada visita: descurtir uma foto no detalhe e voltar
 * aqui já mostra a lista sem ela; se o dono excluir a foto, ela também some
 * (a exclusão apaga as curtidas na mesma transação).
 */

import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { getLikedPhotos } from '@/services/likeService'
import PhotoCard from '@/components/PhotoCard.vue'

const photos = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

async function loadLiked() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const response = await getLikedPhotos()
    photos.value = response.data || []
  } catch (error) {
    errorMessage.value = error.message || 'Não foi possível carregar suas curtidas.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadLiked)
</script>

<template>
  <div class="ps-page">
    <header class="ps-page-header">
      <div>
        <span class="ps-eyebrow">Coleção</span>
        <h1 class="ps-title"><i class="bi bi-heart-fill liked-icon"></i> Fotos Curtidas</h1>
        <p class="text-muted mb-0">Tudo o que você curtiu, da curtida mais recente para a mais antiga.</p>
      </div>
      <span v-if="!isLoading && photos.length" class="ps-chip">
        {{ photos.length }} {{ photos.length === 1 ? 'foto' : 'fotos' }}
      </span>
    </header>

    <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center gap-2 border-0" role="alert">
      <i class="bi bi-exclamation-triangle-fill"></i> {{ errorMessage }}
      <button type="button" class="ps-btn ps-btn--ghost ps-btn--sm ms-auto" @click="loadLiked">Tentar de novo</button>
    </div>

    <div v-if="isLoading" class="ps-grid">
      <div v-for="n in 3" :key="n" class="ps-skeleton" style="height: 330px"></div>
    </div>

    <div v-else-if="photos.length" class="ps-grid">
      <div v-for="(photo, i) in photos" :key="photo.id" class="ps-fade-up" :style="{ animationDelay: `${i * 40}ms` }">
        <PhotoCard :photo="photo" />
      </div>
    </div>

    <div v-else-if="!errorMessage" class="ps-empty">
      <div class="ps-empty__icon"><i class="bi bi-heart"></i></div>
      <h2 class="h5 fw-bold">Você ainda não curtiu nenhuma foto</h2>
      <p class="text-muted">Toque no coração de uma foto para guardá-la aqui.</p>
      <RouterLink to="/feed" class="ps-btn ps-btn--primary mt-2"><i class="bi bi-grid-3x3-gap"></i> Explorar o Feed</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.liked-icon { color: #ff4d67; font-size: 0.8em; vertical-align: 0.05em; }
</style>
