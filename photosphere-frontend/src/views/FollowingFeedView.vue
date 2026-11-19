<script setup>
/**
 * FollowingFeedView.vue — Feed "Seguindo": só as fotos de quem eu sigo (Aula 11).
 *
 * Checagem de Alcançabilidade (ADR-012):
 *  - Seguir / deixar de seguir → botão no perfil público de outra pessoa;
 *    visitante → login → volta ao perfil.
 *  - Listas de seguidores/seguindo → os números "Seguidores"/"Seguindo" do perfil
 *    são links; abas entre as duas listas; link "Voltar ao perfil".
 *  - Feed filtrado (esta tela) → um clique a partir de qualquer tela: item
 *    "Seguindo" da navegação principal (o PhotoSphere não tem TheSidebar.vue;
 *    a navegação principal fica na AppNavbar). Rota /following, requiresAuth.
 *
 * Mesma estrutura do FeedView (Aula 08): page / hasMore / "Carregar mais".
 */

import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { getFollowingPhotos } from '@/services/followService'
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
    const response = await getFollowingPhotos(targetPage, limit)
    const newPhotos = response.data || []

    photos.value = isLoadMore ? [...photos.value, ...newPhotos] : newPhotos
    page.value = targetPage
    hasMore.value = newPhotos.length === limit
  } catch (error) {
    errorMessage.value = error.message || 'Falha ao carregar as fotos de quem você segue.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPhotos()
})
</script>

<template>
  <div class="ps-page">
    <header class="ps-page-header">
      <div>
        <span class="ps-eyebrow">Seguindo</span>
        <h1 class="ps-title">Fotos de quem você segue</h1>
        <p class="text-muted mb-0">As publicações mais recentes das pessoas que você acompanha.</p>
      </div>
      <RouterLink to="/feed" class="ps-btn ps-btn--ghost">
        <i class="bi bi-grid-3x3-gap"></i> Feed geral
      </RouterLink>
    </header>

    <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center gap-2 border-0" role="alert">
      <i class="bi bi-exclamation-triangle-fill"></i>
      <div>{{ errorMessage }}</div>
      <button type="button" class="ps-btn ps-btn--ghost ps-btn--sm ms-auto" @click="fetchPhotos()">Tentar de novo</button>
    </div>

    <!-- Carregando a primeira página -->
    <div v-if="loading && photos.length === 0" class="ps-grid">
      <div v-for="n in 6" :key="n" class="ps-skeleton" style="height: 330px"></div>
    </div>

    <!-- Grade -->
    <div v-else-if="photos.length > 0" class="ps-grid">
      <div v-for="(photo, i) in photos" :key="photo.id" class="ps-fade-up" :style="{ animationDelay: `${(i % limit) * 40}ms` }">
        <PhotoCard :photo="photo" />
      </div>
    </div>

    <!-- Vazio: não segue ninguém, ou quem segue ainda não publicou -->
    <div v-else-if="!errorMessage" class="ps-empty">
      <div class="ps-empty__icon"><i class="bi bi-person-plus"></i></div>
      <h2 class="h5 fw-bold">Nada por aqui ainda</h2>
      <p class="text-muted">Siga pessoas para ver as fotos delas aqui. Comece pelo Feed e abra o perfil de quem você gostar.</p>
      <RouterLink to="/feed" class="ps-btn ps-btn--primary mt-2">
        <i class="bi bi-grid-3x3-gap"></i> Ir para o Feed
      </RouterLink>
    </div>

    <!-- Carregar mais -->
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
        <i class="bi bi-check2-circle me-1"></i> Você viu todas as fotos de quem você segue.
      </p>
    </div>
  </div>
</template>
