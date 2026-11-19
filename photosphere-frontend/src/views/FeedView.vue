<script setup>
/**
 * FeedView.vue — Feed geral (Aula 08; Aula 12: usePaginatedList).
 */
import { RouterLink } from 'vue-router'
import { getFeed } from '@/services/photoService'
import { usePaginatedList } from '@/composables/usePaginatedList'
import { PAGE_SIZE } from '@/config/constants'
import PhotoCard from '@/components/PhotoCard.vue'

const ERROR_TEXT = 'Falha ao carregar o feed de fotos.'

// Aula 12: page / hasMore / "Carregar mais" e os estados de carregamento/erro vêm do composable
const { items: photos, hasMore, isLoading, isLoadingMore, error, loadMore, reload } = usePaginatedList(getFeed)
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
    <div v-if="error" class="alert alert-danger d-flex align-items-center gap-2 border-0" role="alert">
      <i class="bi bi-exclamation-triangle-fill"></i>
      <div>{{ error.message || ERROR_TEXT }}</div>
    </div>

    <!-- Carregando a primeira página -->
    <div v-if="isLoading" class="ps-grid">
      <div v-for="n in 6" :key="n" class="ps-skeleton" style="height: 330px"></div>
    </div>

    <!-- Grade de Fotos -->
    <div v-else-if="photos.length > 0" class="ps-grid">
      <div v-for="(photo, i) in photos" :key="photo.id" class="ps-fade-up" :style="{ animationDelay: `${(i % PAGE_SIZE) * 40}ms` }">
        <PhotoCard :photo="photo" />
      </div>
    </div>

    <!-- Estado Vazio -->
    <div v-else-if="!error" class="ps-empty">
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
        @click="loadMore"
        :disabled="isLoadingMore"
        class="ps-btn ps-btn--ghost px-4"
      >
        <span v-if="isLoadingMore" class="spinner-border spinner-border-sm"></span>
        <i v-else class="bi bi-arrow-down-circle"></i>
        {{ isLoadingMore ? 'Carregando...' : 'Carregar mais' }}
      </button>

      <p v-else-if="photos.length > 0 && !hasMore" class="text-muted small">
        <i class="bi bi-check2-circle me-1"></i> Você chegou ao fim das publicações recentes.
      </p>
    </div>
  </div>
</template>
