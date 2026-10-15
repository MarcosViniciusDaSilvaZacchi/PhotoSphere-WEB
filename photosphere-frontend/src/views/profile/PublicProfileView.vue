<script setup>
/**
 * PublicProfileView.vue — Perfil Público (Aula 09).
 *
 * Rota pública /profile/:username. A API (optionalAuth) devolve o perfil,
 * a lista de fotos da pessoa (mais novas primeiro) e isOwner.
 *
 * Três situações para o botão do cabeçalho:
 *  - dono (isOwner)          → "Editar Perfil"
 *  - logado, mas outra pessoa → "Seguir" (ainda sem ação — chega numa aula futura)
 *  - visitante               → nenhum botão
 *
 * O watch em route.params.username é essencial: ao ir de um perfil para outro,
 * o Vue Router REAPROVEITA este componente (mesma rota, parâmetro diferente),
 * então o onMounted não roda de novo. Sem o watch, a tela ficaria com a pessoa antiga.
 */

import { ref, computed, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { getPublicProfile } from '@/services/userService'
import { getProfilePictureUrl } from '@/utils/media'
import { useAuth } from '@/composables/useAuth'
import PhotoCard from '@/components/PhotoCard.vue'

const route = useRoute()
const { isAuthenticated } = useAuth()

const profile = ref(null)
const isOwner = ref(false)
const isLoading = ref(true)
const errorMessage = ref('')
const followHint = ref(false)

const photos = computed(() => profile.value?.photos || [])

async function loadProfile(username) {
  isLoading.value = true
  errorMessage.value = ''
  profile.value = null

  try {
    const response = await getPublicProfile(username)
    profile.value = response.data
    isOwner.value = !!response.data?.isOwner
  } catch (error) {
    errorMessage.value =
      error.status === 404
        ? `O usuário @${username} não foi encontrado.`
        : error.message || 'Não foi possível carregar este perfil.'
  } finally {
    isLoading.value = false
  }
}

function handleFollow() {
  // Botão visível desde já para o layout ficar completo; a ação chega com o módulo de seguidores
  followHint.value = true
  setTimeout(() => (followHint.value = false), 2500)
}

watch(
  () => route.params.username,
  (username) => {
    if (username) loadProfile(username)
  },
  { immediate: true }
)
</script>

<template>
  <div class="ps-page">
    <!-- Carregando -->
    <div v-if="isLoading">
      <div class="ps-skeleton" style="height: 220px"></div>
      <div class="ps-grid mt-4">
        <div v-for="n in 3" :key="n" class="ps-skeleton" style="height: 300px"></div>
      </div>
    </div>

    <!-- Erro (ex.: username inexistente) — a tela continua de pé -->
    <div v-else-if="errorMessage" class="ps-empty">
      <div class="ps-empty__icon"><i class="bi bi-person-x"></i></div>
      <h2 class="h4 fw-bold">{{ errorMessage }}</h2>
      <p class="text-muted">Confira o nome de usuário ou volte para o início.</p>
      <RouterLink to="/" class="ps-btn ps-btn--primary mt-2"><i class="bi bi-house"></i> Ir para o início</RouterLink>
    </div>

    <template v-else-if="profile">
      <!-- Cabeçalho do perfil -->
      <section class="profile-hero ps-surface">
        <div class="profile-hero__cover"></div>

        <div class="profile-hero__content">
          <img :src="getProfilePictureUrl(profile.profilePicture)" :alt="profile.username" class="profile-hero__avatar" />

          <div class="profile-hero__info">
            <h1 class="profile-hero__name">{{ profile.fullName || profile.username }}</h1>
            <p class="profile-hero__username">@{{ profile.username }}</p>
            <p v-if="profile.bio" class="profile-hero__bio">{{ profile.bio }}</p>
          </div>

          <div class="profile-hero__action">
            <RouterLink v-if="isOwner" to="/profile/me" class="ps-btn ps-btn--ghost">
              <i class="bi bi-pencil-square"></i> Editar Perfil
            </RouterLink>
            <button v-else-if="isAuthenticated" type="button" class="ps-btn ps-btn--primary" @click="handleFollow">
              <i class="bi bi-person-plus"></i> Seguir
            </button>
            <small v-if="followHint" class="follow-hint">Seguir chega em breve ✨</small>
          </div>
        </div>

        <div class="profile-hero__stats">
          <div><strong>{{ profile.photosCount ?? photos.length }}</strong><span>Fotos</span></div>
          <div><strong>{{ profile.followersCount || 0 }}</strong><span>Seguidores</span></div>
          <div><strong>{{ profile.followingCount || 0 }}</strong><span>Seguindo</span></div>
        </div>
      </section>

      <!-- Fotos da pessoa -->
      <div class="d-flex align-items-center justify-content-between mt-5 mb-3">
        <h2 class="h5 fw-bold mb-0"><i class="bi bi-images text-brand me-2"></i>Fotos</h2>
        <span class="ps-chip">{{ photos.length }} {{ photos.length === 1 ? 'publicação' : 'publicações' }}</span>
      </div>

      <div v-if="photos.length" class="ps-grid">
        <div v-for="(photo, i) in photos" :key="photo.id" class="ps-fade-up" :style="{ animationDelay: `${i * 40}ms` }">
          <PhotoCard :photo="photo" :show-author="false" />
        </div>
      </div>

      <div v-else class="ps-empty">
        <div class="ps-empty__icon"><i class="bi bi-camera"></i></div>
        <h3 class="h5 fw-bold">{{ isOwner ? 'Você ainda não publicou fotos' : 'Nenhuma foto publicada ainda' }}</h3>
        <RouterLink v-if="isOwner" to="/upload" class="ps-btn ps-btn--primary mt-2">
          <i class="bi bi-cloud-arrow-up"></i> Publicar a primeira
        </RouterLink>
      </div>
    </template>
  </div>
</template>

<style scoped>
.profile-hero { overflow: hidden; }

.profile-hero__cover {
  height: 140px;
  background:
    radial-gradient(circle at 20% 120%, rgba(255, 142, 92, 0.55), transparent 55%),
    radial-gradient(circle at 85% -20%, rgba(255, 102, 34, 0.6), transparent 50%),
    linear-gradient(135deg, #2a140a, #120c0a);
}

.profile-hero__content {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1.25rem;
  padding: 0 1.75rem;
  margin-top: -52px;
}

.profile-hero__avatar {
  width: 112px;
  height: 112px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--ps-surface);
  box-shadow: 0 0 0 2px var(--brand-color), 0 16px 30px -12px rgba(0, 0, 0, 0.8);
  background: var(--ps-surface-2);
}

.profile-hero__info { flex: 1; min-width: 200px; padding-bottom: 0.25rem; }
.profile-hero__name { font-size: 1.6rem; font-weight: 800; letter-spacing: -0.03em; margin: 0; }
.profile-hero__username { color: var(--brand-color-light); font-weight: 600; margin: 0.1rem 0 0; }
.profile-hero__bio { color: var(--ps-muted); margin: 0.6rem 0 0; max-width: 560px; }

.profile-hero__action { display: flex; flex-direction: column; align-items: flex-end; gap: 0.35rem; padding-bottom: 0.4rem; }
.follow-hint { color: var(--ps-muted); font-size: 0.78rem; }

.profile-hero__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-top: 1.5rem;
  border-top: 1px solid var(--ps-border);
}
.profile-hero__stats > div {
  padding: 1rem;
  text-align: center;
  border-right: 1px solid var(--ps-border);
}
.profile-hero__stats > div:last-child { border-right: 0; }
.profile-hero__stats strong { display: block; font-size: 1.35rem; font-weight: 800; }
.profile-hero__stats span { color: var(--ps-muted); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.08em; }
</style>
