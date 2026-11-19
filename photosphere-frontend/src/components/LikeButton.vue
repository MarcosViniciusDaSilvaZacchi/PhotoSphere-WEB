<script setup>
/**
 * LikeButton.vue — Botão de curtir com ATUALIZAÇÃO OTIMISTA (Aula 10, revisto na Aula 12).
 *
 * Atualização otimista em três passos:
 *  1. Guardar o estado anterior (liked + contador);
 *  2. Aplicar a mudança NA HORA, antes da resposta da API (o coração muda já);
 *  3. Confirmar com a resposta (usa os números do servidor) ou, se der erro,
 *     DESFAZER (rollback) para o estado guardado.
 *
 * Aula 12: a "cerca" (visitante → login com ?redirect=; clique ignorado enquanto
 * a requisição anterior não voltou) passou para o composable useAuthenticatedAction,
 * que o FollowButton também usa. O aviso de erro deixou de ser uma mensagem local:
 * quem avisa é o interceptor do Axios (toast). O catch daqui só desfaz o visual.
 *
 * O miolo otimista (passos 1–3) ainda não foi extraído: são só dois casos
 * (curtir e seguir) e eles diferem nos detalhes — a extração espera o terceiro caso.
 */

import { ref, watch } from 'vue'
import { toggleLike } from '@/services/likeService'
import { useAuthenticatedAction } from '@/composables/useAuthenticatedAction'
import { formatCount } from '@/utils/format'

const props = defineProps({
  photoId: { type: [Number, String], required: true },
  liked: { type: Boolean, default: false },
  count: { type: Number, default: 0 },
})

const emit = defineEmits(['change'])

const { isBusy, run } = useAuthenticatedAction()

const isLiked = ref(props.liked)
const likesCount = ref(props.count)

// Se o pai trocar a foto exibida (outro :id), sincroniza o estado local.
// Observa só o photoId: observar liked/count faria o eco do próprio 'change'
// sobrescrever o estado otimista com um valor antigo.
watch(
  () => props.photoId,
  () => {
    isLiked.value = props.liked
    likesCount.value = props.count
  }
)

function handleClick() {
  run(async () => {
    // 1. Guarda o estado anterior
    const previous = { liked: isLiked.value, count: likesCount.value }

    // 2. Aplica a mudança imediatamente (otimista)
    isLiked.value = !previous.liked
    likesCount.value = Math.max(0, previous.count + (isLiked.value ? 1 : -1))

    try {
      // 3a. Confirma com os números reais do servidor
      const response = await toggleLike(props.photoId)
      isLiked.value = response.data.liked
      likesCount.value = response.data.likesCount
      emit('change', { liked: isLiked.value, likesCount: likesCount.value })
    } catch {
      // 3b. Rollback: volta exatamente ao estado anterior (o toast de erro é do interceptor)
      isLiked.value = previous.liked
      likesCount.value = previous.count
    }
  })
}
</script>

<template>
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
</template>
