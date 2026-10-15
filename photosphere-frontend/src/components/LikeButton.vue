<script setup>
/**
 * LikeButton.vue — Botão de curtir com ATUALIZAÇÃO OTIMISTA (Aula 10).
 *
 * Atualização otimista em três passos:
 *  1. Guardar o estado anterior (liked + contador);
 *  2. Aplicar a mudança NA HORA, antes da resposta da API (o coração muda já);
 *  3. Confirmar com a resposta (usa os números do servidor) ou, se der erro,
 *     DESFAZER (rollback) para o estado guardado e avisar o usuário.
 *
 * isBusy impede um segundo clique enquanto a requisição anterior não voltou —
 * sem isso, cliques rápidos poderiam deixar tela e banco dessincronizados.
 *
 * Visitante: em vez de chamar a API (que responderia 401), vai para o login
 * com ?redirect= apontando para esta tela; depois de entrar, volta para cá.
 */

import { ref, watch, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { toggleLike } from '@/services/likeService'
import { useAuth } from '@/composables/useAuth'
import { formatCount } from '@/utils/format'

const props = defineProps({
  photoId: { type: [Number, String], required: true },
  liked: { type: Boolean, default: false },
  count: { type: Number, default: 0 },
})

const emit = defineEmits(['change'])

const router = useRouter()
const route = useRoute()
const { isAuthenticated } = useAuth()

const isLiked = ref(props.liked)
const likesCount = ref(props.count)
const isBusy = ref(false)
const errorMessage = ref('')
let errorTimer = null

// Se o pai trocar a foto exibida (outro :id), sincroniza o estado local.
// Observa só o photoId: observar liked/count faria o eco do próprio 'change'
// sobrescrever o estado otimista com um valor antigo.
watch(
  () => props.photoId,
  () => {
    isLiked.value = props.liked
    likesCount.value = props.count
    errorMessage.value = ''
  }
)

function showError(message) {
  errorMessage.value = message
  clearTimeout(errorTimer)
  errorTimer = setTimeout(() => (errorMessage.value = ''), 4000)
}

async function handleClick() {
  if (!isAuthenticated.value) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }
  if (isBusy.value) return

  // 1. Guarda o estado anterior
  const previous = { liked: isLiked.value, count: likesCount.value }

  // 2. Aplica a mudança imediatamente (otimista)
  isLiked.value = !previous.liked
  likesCount.value = Math.max(0, previous.count + (isLiked.value ? 1 : -1))
  errorMessage.value = ''
  isBusy.value = true

  try {
    // 3a. Confirma com os números reais do servidor
    const response = await toggleLike(props.photoId)
    isLiked.value = response.data.liked
    likesCount.value = response.data.likesCount
    emit('change', { liked: isLiked.value, likesCount: likesCount.value })
  } catch (error) {
    // 3b. Rollback: volta exatamente ao estado anterior
    isLiked.value = previous.liked
    likesCount.value = previous.count
    showError(error.message || 'Não foi possível registrar sua curtida.')
  } finally {
    isBusy.value = false
  }
}

onBeforeUnmount(() => clearTimeout(errorTimer))
</script>

<template>
  <div class="like-wrapper">
    <button
      type="button"
      class="like-btn"
      :class="{ 'is-liked': isLiked }"
      :aria-pressed="isLiked"
      :aria-label="isLiked ? 'Descurtir foto' : 'Curtir foto'"
      :disabled="isBusy"
      @click="handleClick"
    >
      <i class="bi like-btn__icon" :class="isLiked ? 'bi-heart-fill' : 'bi-heart'"></i>
      <span>{{ formatCount(likesCount) }}</span>
      <span class="visually-hidden">curtidas</span>
    </button>

    <div v-if="errorMessage" class="like-error" role="alert">
      <i class="bi bi-arrow-counterclockwise"></i> {{ errorMessage }}
    </div>
  </div>
</template>
