<script setup>
/**
 * PhotoDetailView.vue — Detalhe da foto (Aula 08, atualizado na Aula 09).
 *
 * Aula 09:
 *  - Autor clicável → perfil público.
 *  - Botão "Editar" só aparece quando isOwner (vindo da API) é true.
 *    Esconder o botão é apenas USABILIDADE, não segurança: quem decide se a
 *    edição é permitida é a API (403 em GET /photos/:id/edit e PUT /photos/:id).
 *  - Rota pública: visitantes também veem o detalhe (a API usa optionalAuth).
 */

import { ref, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { getPhotoById } from '@/services/photoService'
import { getPhotoUrl, getProfilePictureUrl } from '@/utils/media'

const route = useRoute()
const router = useRouter()

const photo = ref(null)
const isOwner = ref(false)
const loading = ref(true)
const errorMessage = ref('')

async function fetchPhotoDetails(id) {
  loading.value = true
  errorMessage.value = ''
  photo.value = null

  try {
    const response = await getPhotoById(id)
    const data = response.data || {}
    photo.value = data
    isOwner.value = !!data.isOwner
  } catch (error) {
    // O interceptor do api.js normaliza o erro para { message, errors, status }
    errorMessage.value =
      error.status === 404
        ? 'Foto não encontrada. O item pode ter sido removido.'
        : error.message || 'Erro ao carregar detalhes da foto.'
  } finally {
    loading.value = false
  }
}

watch(
  () => route.params.id,
  (id) => {
    if (id) fetchPhotoDetails(id)
  },
  { immediate: true }
)

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}
</script>

<template>
  <div class="ps-page detail-page">
    <button type="button" class="back-link" @click="goBack"><i class="bi bi-arrow-left"></i> Voltar</button>

    <!-- Carregando -->
    <div v-if="loading" class="detail-grid">
      <div class="ps-skeleton" style="height: 520px"></div>
      <div class="ps-skeleton" style="height: 520px"></div>
    </div>

    <!-- Erro (ex: 404 ID inexistente) -->
    <div v-else-if="errorMessage" class="ps-empty">
      <div class="ps-empty__icon"><i class="bi bi-image-alt"></i></div>
      <h1 class="h4 fw-bold">{{ errorMessage }}</h1>
      <p class="text-muted">Verifique o endereço digitado ou navegue pelo feed.</p>
      <RouterLink to="/feed" class="ps-btn ps-btn--primary mt-2"><i class="bi bi-grid-3x3-gap"></i> Ir para o Feed</RouterLink>
    </div>

    <!-- Sucesso: imagem em resolução real (Grupo B) -->
    <div v-else-if="photo" class="detail-grid">
      <figure class="photo-stage">
        <img :src="getPhotoUrl(photo.imageUrl)" :alt="photo.title" class="photo-stage__img" />
      </figure>

      <aside class="ps-surface info-panel">
        <!-- Autor + ações do dono -->
        <div class="info-panel__top">
          <RouterLink
            v-if="photo.author"
            :to="{ name: 'profile', params: { username: photo.author.username } }"
            class="author"
          >
            <img :src="getProfilePictureUrl(photo.author.profilePicture)" :alt="photo.author.username" />
            <div>
              <strong>{{ photo.author.fullName || photo.author.username }}</strong>
              <span>@{{ photo.author.username }}</span>
            </div>
          </RouterLink>

          <RouterLink
            v-if="isOwner"
            :to="{ name: 'photo-edit', params: { id: photo.id } }"
            class="ps-btn ps-btn--ghost ps-btn--sm"
          >
            <i class="bi bi-pencil"></i> Editar
          </RouterLink>
        </div>

        <h1 class="info-panel__title">{{ photo.title }}</h1>
        <p v-if="photo.description" class="info-panel__desc">{{ photo.description }}</p>
        <p v-else class="info-panel__desc fst-italic">Sem descrição informada.</p>

        <div class="info-panel__stats">
          <span class="ps-chip"><i class="bi bi-eye"></i> {{ photo.viewsCount || 0 }} visualizações</span>
          <span class="ps-chip"><i class="bi bi-heart"></i> {{ photo.likesCount || 0 }} curtidas</span>
          <span class="ps-chip"><i class="bi bi-calendar3"></i> {{ new Date(photo.createdAt).toLocaleDateString('pt-BR') }}</span>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.detail-page { max-width: 1240px; }

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 1.25rem;
  padding: 0;
  border: 0;
  background: none;
  color: var(--ps-muted);
  font-size: 0.9rem;
  font-weight: 600;
}
.back-link:hover { color: var(--brand-color-light); }

.detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(320px, 1fr);
  gap: 1.5rem;
  align-items: start;
}

.photo-stage {
  margin: 0;
  display: grid;
  place-items: center;
  min-height: 420px;
  max-height: calc(100vh - 160px);
  padding: 0.75rem;
  border-radius: var(--ps-radius);
  background: #070504;
  border: 1px solid var(--ps-border);
  position: sticky;
  top: 90px;
}
.photo-stage__img {
  max-width: 100%;
  max-height: calc(100vh - 190px);
  object-fit: contain;
  border-radius: 10px;
}

.info-panel { padding: 1.4rem; }

.info-panel__top { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }

.author { display: flex; align-items: center; gap: 0.7rem; text-decoration: none; color: var(--ps-text); min-width: 0; }
.author img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 0 2px var(--ps-surface), 0 0 0 4px rgba(255, 102, 34, 0.7);
}
.author strong { display: block; font-size: 0.95rem; }
.author span { color: var(--ps-muted); font-size: 0.82rem; }
.author:hover strong { color: var(--brand-color-light); }

.info-panel__title { font-size: 1.55rem; font-weight: 800; letter-spacing: -0.03em; margin: 1.25rem 0 0.5rem; }
.info-panel__desc { color: var(--ps-muted); line-height: 1.6; white-space: pre-line; }
.info-panel__stats { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem; }

@media (max-width: 900px) {
  .detail-grid { grid-template-columns: 1fr; }
  .photo-stage { position: static; }
}
</style>
