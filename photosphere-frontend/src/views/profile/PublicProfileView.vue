<script setup>
/**
 * PublicProfileView.vue — Perfil Público (Aula 09).
 *
 * Rota pública /profile/:username. A API (optionalAuth) devolve o perfil,
 * a lista de fotos da pessoa (mais novas primeiro) e isOwner.
 *
 * Botão do cabeçalho (Aula 11):
 *  - dono (isOwner)  → "Editar Perfil"
 *  - qualquer outro  → FollowButton (o visitante é levado ao login e volta para cá)
 *
 * O FollowButton é ligado por v-model ao próprio objeto do perfil
 * (profile.isFollowing e profile.followersCount): quando o botão muda,
 * o número "Seguidores" do cartão muda junto, sem recarregar.
 * Os números "Seguidores"/"Seguindo" são links para as listas.
 *
 * Aula 12: carregamento pelo useAsyncData (watch no :username).
 *
 * O watch em route.params.username é essencial: ao ir de um perfil para outro,
 * o Vue Router REAPROVEITA este componente (mesma rota, parâmetro diferente),
 * então o onMounted não roda de novo. Sem o watch, a tela ficaria com a pessoa antiga.
 */

import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { getPublicProfile } from '@/services/userService'
import { getProfilePictureUrl } from '@/utils/media'
import { useAsyncData } from '@/composables/useAsyncData'
import PhotoCard from '@/components/PhotoCard.vue'
import FollowButton from '@/components/FollowButton.vue'

const route = useRoute()

// Aula 12: useAsyncData com watch no :username — ir de um perfil para outro
// reaproveita o componente (o onMounted não rodaria de novo), e a corrida entre
// respostas fica resolvida pelo lastCallId do composable.
const { data: profile, error, isLoading } = useAsyncData(() => getPublicProfile(route.params.username), {
  watch: () => route.params.username,
})

const isOwner = computed(() => !!profile.value?.isOwner)
const photos = computed(() => profile.value?.photos || [])
const followersRoute = computed(() => ({ name: 'profile-followers', params: { username: profile.value?.username } }))
const followingRoute = computed(() => ({ name: 'profile-following', params: { username: profile.value?.username } }))
const errorText = computed(() => {
  if (!error.value) return ''
  return error.value.status === 404
    ? `O usuário @${route.params.username} não foi encontrado.`
    : error.value.message || 'Não foi possível carregar este perfil.'
})
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
    <div v-else-if="errorText" class="ps-empty">
      <div class="ps-empty__icon"><i class="bi bi-person-x"></i></div>
      <h2 class="h4 fw-bold">{{ errorText }}</h2>
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
            <FollowButton
              v-else
              :user-id="profile.id"
              v-model:following="profile.isFollowing"
              v-model:followers-count="profile.followersCount"
            />
          </div>
        </div>

        <div class="profile-hero__stats">
          <div><strong>{{ profile.photosCount ?? photos.length }}</strong><span>Fotos</span></div>
          <RouterLink :to="followersRoute" class="stat-link">
            <strong>{{ profile.followersCount || 0 }}</strong><span>Seguidores</span>
          </RouterLink>
          <RouterLink :to="followingRoute" class="stat-link">
            <strong>{{ profile.followingCount || 0 }}</strong><span>Seguindo</span>
          </RouterLink>
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

.profile-hero__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-top: 1.5rem;
  border-top: 1px solid var(--ps-border);
}
.profile-hero__stats > * {
  padding: 1rem;
  text-align: center;
  border-right: 1px solid var(--ps-border);
}
.profile-hero__stats > *:last-child { border-right: 0; }
.profile-hero__stats strong { display: block; font-size: 1.35rem; font-weight: 800; }
.profile-hero__stats span { color: var(--ps-muted); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.08em; }
</style>
