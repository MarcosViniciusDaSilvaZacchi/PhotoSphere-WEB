<script setup>
/**
 * SearchView.vue — Busca de fotos e pessoas (Aula 13). Rota pública /search?q=...
 *
 * Três "versões" do termo:
 *  - typedText      → o que o campo mostra (muda a cada tecla);
 *  - term           → typedText atrasado pelo debounce (só muda depois da pausa);
 *  - normalizedTerm → term sem espaços nas pontas — é ele que dispara a busca.
 *
 * Duas defesas contra requisições demais / fora de ordem:
 *  - debounce (useDebouncedValue): digitar uma palavra sem pausa = UMA requisição;
 *  - lastCallId (dentro do useAsyncData): se duas buscas estiverem no ar, só a
 *    resposta da mais recente aparece.
 *
 * O termo vive na URL (?q=): F5 e links compartilhados funcionam, e a Navbar só
 * precisa navegar para cá com o query. router.replace (e não push) para o Voltar
 * do navegador não passar por cada pausa da digitação.
 */

import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { search } from '@/services/searchService'
import { useDebouncedValue } from '@/composables/useDebouncedValue'
import { useAsyncData } from '@/composables/useAsyncData'
import { getProfilePictureUrl } from '@/utils/media'
import { SEARCH } from '@/config/constants'
import PhotoCard from '@/components/PhotoCard.vue'

const route = useRoute()
const router = useRouter()
const inputRef = ref(null)

// ?q=ab&q=cd chega como array; só texto conta
const readQuery = () => (typeof route.query.q === 'string' ? route.query.q : '')

const typedText = ref(readQuery())
const term = useDebouncedValue(typedText, SEARCH.DEBOUNCE_MS)
const normalizedTerm = computed(() => term.value.trim())
const isTooShort = computed(() => normalizedTerm.value.length < SEARCH.MIN_LENGTH)

const EMPTY = { query: '', fotos: [], users: [] }

const { data: results, error, isLoading } = useAsyncData(
  () =>
    isTooShort.value
      ? Promise.resolve({ data: { ...EMPTY, query: normalizedTerm.value } }) // termo curto: nem chama a API
      : search(normalizedTerm.value),
  { initialData: EMPTY, watch: normalizedTerm }
)

// URL → campo (ex.: a Navbar mandou um termo novo com esta tela aberta, ou o Voltar)
watch(
  () => route.query.q,
  () => {
    const fromUrl = readQuery()
    if (fromUrl.trim() !== normalizedTerm.value) typedText.value = fromUrl
  }
)

// campo (já com debounce) → URL
watch(normalizedTerm, (value) => {
  if (value === readQuery().trim()) return
  router.replace({ name: 'search', query: value ? { q: value } : {} })
})

const hasResults = computed(() => results.value.fotos.length > 0 || results.value.users.length > 0)

onMounted(() => inputRef.value?.focus())
</script>

<template>
  <div class="ps-page">
    <header class="ps-page-header">
      <div>
        <span class="ps-eyebrow">Explorar</span>
        <h1 class="ps-title">Buscar</h1>
        <p class="text-muted mb-0">Encontre fotos pelo título e pessoas pelo nome ou usuário.</p>
      </div>
    </header>

    <div class="search-box ps-surface">
      <i class="bi bi-search"></i>
      <input
        ref="inputRef"
        v-model="typedText"
        type="search"
        class="search-box__input"
        placeholder="Buscar fotos ou pessoas..."
        aria-label="Termo de busca"
      />
      <span v-if="isLoading" class="spinner-border spinner-border-sm text-muted"></span>
    </div>

    <p v-if="isTooShort" class="text-muted small mt-3">
      <i class="bi bi-info-circle me-1"></i>Digite pelo menos {{ SEARCH.MIN_LENGTH }} letras para buscar.
    </p>

    <div v-else-if="error" class="alert alert-danger d-flex align-items-center gap-2 border-0 mt-3" role="alert">
      <i class="bi bi-exclamation-triangle-fill"></i> {{ error.message || 'Não foi possível fazer a busca.' }}
    </div>

    <template v-else-if="!isLoading">
      <p v-if="!hasResults" class="ps-empty mt-4">
        <span class="ps-empty__icon d-inline-grid"><i class="bi bi-search"></i></span><br />
        Nada encontrado para "<strong>{{ results.query }}</strong>".
      </p>

      <section v-if="results.users.length" class="mt-4">
        <h2 class="h6 fw-bold text-uppercase text-muted mb-3">Pessoas</h2>
        <div class="people-list">
          <RouterLink
            v-for="person in results.users"
            :key="person.id"
            :to="{ name: 'profile', params: { username: person.username } }"
            class="person-row"
          >
            <img :src="getProfilePictureUrl(person.profilePicture)" :alt="person.username" class="person-row__avatar" />
            <div class="person-row__info">
              <strong class="person-row__name">{{ person.fullName || person.username }}</strong>
              <span class="person-row__username">@{{ person.username }}</span>
            </div>
            <i class="bi bi-chevron-right person-row__chevron"></i>
          </RouterLink>
        </div>
      </section>

      <section v-if="results.fotos.length" class="mt-4">
        <h2 class="h6 fw-bold text-uppercase text-muted mb-3">Fotos</h2>
        <div class="ps-grid">
          <PhotoCard v-for="photo in results.fotos" :key="photo.id" :photo="photo" />
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.search-box { display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem 1.1rem; max-width: 720px; }
.search-box i { color: var(--ps-muted); }
.search-box__input { flex: 1; border: 0; outline: none; background: transparent; color: var(--ps-text); font-size: 1rem; }
</style>
