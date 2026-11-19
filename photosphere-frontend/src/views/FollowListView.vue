<script setup>
/**
 * FollowListView.vue — Seguidores e Seguindo (Aula 11).
 *
 * UMA tela para DUAS rotas: /profile/:username/followers e /profile/:username/following.
 * A diferença vem da definição da rota, como prop: { kind: 'followers' } ou { kind: 'following' }.
 *
 * Duas chamadas em sequência: a URL usa o USERNAME (legível, compartilhável),
 * mas a API de listas usa o ID — então primeiro o perfil (username → id), depois a lista.
 *
 * O watch observa [kind, username] com immediate: trocar de aba (mesma tela, kind
 * diferente) ou ir para a lista de outra pessoa reaproveita o componente — o
 * onMounted não rodaria de novo, e a tela ficaria com a lista antiga.
 */

import { ref, computed, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { getPublicProfile } from '@/services/userService'
import { getFollowers, getFollowing } from '@/services/followService'
import { getProfilePictureUrl } from '@/utils/media'

const props = defineProps({
  kind: {
    type: String,
    required: true,
    validator: (value) => ['followers', 'following'].includes(value),
  },
})

const route = useRoute()

const person = ref(null)
const people = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

// Se o usuário trocar de aba rápido, só a resposta da ÚLTIMA chamada vale
let lastCallId = 0

const username = computed(() => route.params.username)
const displayName = computed(() => person.value?.fullName || person.value?.username || username.value)
const title = computed(() => (props.kind === 'followers' ? 'Seguidores' : 'Seguindo'))
const emptyMessage = computed(() =>
  props.kind === 'followers'
    ? `Ninguém segue ${displayName.value} ainda.`
    : `${displayName.value} ainda não segue ninguém.`
)

async function loadList() {
  const callId = ++lastCallId
  const name = username.value
  if (!name) return

  isLoading.value = true
  errorMessage.value = ''
  people.value = []

  try {
    // 1. username → perfil (e o id)
    const profileResponse = await getPublicProfile(name)
    if (callId !== lastCallId) return
    person.value = profileResponse.data

    // 2. id → lista
    const listResponse =
      props.kind === 'followers'
        ? await getFollowers(person.value.id)
        : await getFollowing(person.value.id)
    if (callId !== lastCallId) return
    people.value = listResponse.data || []
  } catch (error) {
    if (callId !== lastCallId) return
    person.value = null
    errorMessage.value =
      error.status === 404
        ? `O usuário @${name} não foi encontrado.`
        : error.message || 'Não foi possível carregar a lista.'
  } finally {
    if (callId === lastCallId) isLoading.value = false
  }
}

watch(() => [props.kind, route.params.username], loadList, { immediate: true })
</script>

<template>
  <div class="ps-page">
    <!-- Erro (ex.: username inexistente) -->
    <div v-if="errorMessage && !isLoading" class="ps-empty">
      <div class="ps-empty__icon"><i class="bi bi-person-x"></i></div>
      <h2 class="h4 fw-bold">{{ errorMessage }}</h2>
      <p class="text-muted">Confira o nome de usuário ou volte para o início.</p>
      <RouterLink to="/" class="ps-btn ps-btn--primary mt-2"><i class="bi bi-house"></i> Ir para o início</RouterLink>
    </div>

    <template v-else>
      <header class="ps-page-header">
        <div>
          <RouterLink :to="{ name: 'profile', params: { username } }" class="back-link">
            <i class="bi bi-arrow-left"></i> Voltar ao perfil de @{{ username }}
          </RouterLink>
          <h1 class="ps-title">{{ title }}</h1>
          <p class="text-muted mb-0">{{ displayName }}</p>
        </div>
      </header>

      <!-- Abas: a ativa vem da prop kind (da rota) -->
      <nav class="ps-tabs" aria-label="Seguidores e seguindo">
        <RouterLink
          :to="{ name: 'profile-followers', params: { username } }"
          class="ps-tab"
          :class="{ 'is-active': kind === 'followers' }"
          :aria-current="kind === 'followers' ? 'page' : undefined"
        >
          <i class="bi bi-people"></i> Seguidores
          <span v-if="person">({{ person.followersCount || 0 }})</span>
        </RouterLink>
        <RouterLink
          :to="{ name: 'profile-following', params: { username } }"
          class="ps-tab"
          :class="{ 'is-active': kind === 'following' }"
          :aria-current="kind === 'following' ? 'page' : undefined"
        >
          <i class="bi bi-person-check"></i> Seguindo
          <span v-if="person">({{ person.followingCount || 0 }})</span>
        </RouterLink>
      </nav>

      <!-- Carregando -->
      <div v-if="isLoading" class="people-list">
        <div v-for="n in 3" :key="n" class="ps-skeleton" style="height: 74px"></div>
      </div>

      <!-- Lista -->
      <div v-else-if="people.length" class="people-list">
        <RouterLink
          v-for="item in people"
          :key="item.id"
          :to="{ name: 'profile', params: { username: item.username } }"
          class="person-row"
        >
          <img :src="getProfilePictureUrl(item.profilePicture)" :alt="item.username" class="person-row__avatar" />
          <div class="person-row__info">
            <strong class="person-row__name">{{ item.fullName || item.username }}</strong>
            <span class="person-row__username">@{{ item.username }}</span>
            <p v-if="item.bio" class="person-row__bio">{{ item.bio }}</p>
          </div>
          <i class="bi bi-chevron-right person-row__chevron"></i>
        </RouterLink>
      </div>

      <!-- Vazio -->
      <div v-else class="ps-empty">
        <div class="ps-empty__icon"><i class="bi bi-people"></i></div>
        <h2 class="h5 fw-bold">{{ emptyMessage }}</h2>
      </div>
    </template>
  </div>
</template>

<style scoped>
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.6rem;
  color: var(--ps-muted);
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
}
.back-link:hover { color: var(--brand-color-light); }
</style>
