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
 * Mesma estrutura do FeedView: Aula 12 — os dois usam o usePaginatedList.
 */
import { RouterLink } from 'vue-router'
import { getFollowingPhotos } from '@/services/followService'
import { usePaginatedList } from '@/composables/usePaginatedList'
import { PAGE_SIZE } from '@/config/constants'
import PhotoCard from '@/components/PhotoCard.vue'

const ERROR_TEXT = 'Falha ao carregar as fotos de quem você segue.'

// Aula 12: page / hasMore / "Carregar mais" e os estados de carregamento/erro vêm do composable
const { items: photos, hasMore, isLoading, isLoadingMore, error, loadMore, reload } = usePaginatedList(getFollowingPhotos)
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

    <div v-if="error" class="alert alert-danger d-flex align-items-center gap-2 border-0" role="alert">
      <i class="bi bi-exclamation-triangle-fill"></i>
      <div>{{ error.message || ERROR_TEXT }}</div>
      <button type="button" class="ps-btn ps-btn--ghost ps-btn--sm ms-auto" @click="reload">Tentar de novo</button>
    </div>

    <!-- Carregando a primeira página -->
    <div v-if="isLoading" class="ps-grid">
      <div v-for="n in 6" :key="n" class="ps-skeleton" style="height: 330px"></div>
    </div>

    <!-- Grade -->
    <div v-else-if="photos.length > 0" class="ps-grid">
      <div v-for="(photo, i) in photos" :key="photo.id" class="ps-fade-up" :style="{ animationDelay: `${(i % PAGE_SIZE) * 40}ms` }">
        <PhotoCard :photo="photo" />
      </div>
    </div>

    <!-- Vazio: não segue ninguém, ou quem segue ainda não publicou -->
    <div v-else-if="!error" class="ps-empty">
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
        @click="loadMore"
        :disabled="isLoadingMore"
        class="ps-btn ps-btn--ghost px-4"
      >
        <span v-if="isLoadingMore" class="spinner-border spinner-border-sm"></span>
        <i v-else class="bi bi-arrow-down-circle"></i>
        {{ isLoadingMore ? 'Carregando...' : 'Carregar mais' }}
      </button>

      <p v-else-if="photos.length > 0 && !hasMore" class="text-muted small">
        <i class="bi bi-check2-circle me-1"></i> Você viu todas as fotos de quem você segue.
      </p>
    </div>
  </div>
</template>
