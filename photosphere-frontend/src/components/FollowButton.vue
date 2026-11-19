<script setup>
/**
 * FollowButton.vue — Botão de seguir com ATUALIZAÇÃO OTIMISTA e v-model (Aula 11).
 *
 * Diferença para o LikeButton (Aula 10): lá o botão recebia um VALOR INICIAL e
 * passava a ter estado próprio — o contador de curtidas só existia dentro dele.
 * Aqui o contador de seguidores aparece TAMBÉM no cartão do perfil (fora do botão).
 * Com dois defineModel (following e followersCount), botão e perfil compartilham
 * o MESMO estado: o pai liga com v-model:following / v-model:followers-count e,
 * quando o botão muda o valor, o número do cartão muda junto.
 *
 * ⚠️ Pegadinha do defineModel: atribuir following.value NÃO muda o valor na hora.
 * A atribuição emite 'update:following' para o pai; o valor novo só volta para o
 * filho pela prop, no próximo ciclo de renderização. Ler following.value logo
 * depois de atribuir devolve o valor ANTIGO. Por isso o novo estado é calculado
 * numa variável local (nowFollowing) e é ELA que se usa no resto da função.
 *
 * Atualização otimista em três passos:
 *  1. guardar o estado anterior;
 *  2. aplicar a mudança na hora;
 *  3. confirmar com a resposta da API — ou, se der erro, desfazer (rollback).
 */

import { ref, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { toggleFollow } from '@/services/followService'
import { useAuth } from '@/composables/useAuth'

const props = defineProps({
  userId: { type: [Number, String], required: true },
})

const following = defineModel('following', { type: Boolean, default: false })
const followersCount = defineModel('followersCount', { type: Number, default: 0 })

const router = useRouter()
const route = useRoute()
const { isAuthenticated } = useAuth()

const isBusy = ref(false)
const errorMessage = ref('')
let errorTimer = null

function showError(message) {
  errorMessage.value = message
  clearTimeout(errorTimer)
  errorTimer = setTimeout(() => (errorMessage.value = ''), 4000)
}

async function handleClick() {
  // Visitante: vai ao login e volta para este perfil depois de entrar
  if (!isAuthenticated.value) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }
  if (isBusy.value) return

  // 1. Guarda o estado anterior
  const previous = { following: following.value, count: followersCount.value }

  // 2. Aplica na hora — o novo estado fica numa variável LOCAL (nunca reler following.value aqui)
  const nowFollowing = !previous.following
  following.value = nowFollowing
  followersCount.value = Math.max(0, previous.count + (nowFollowing ? 1 : -1))
  errorMessage.value = ''
  isBusy.value = true

  try {
    // 3a. Confirma com os números reais do servidor
    const response = await toggleFollow(props.userId)
    following.value = response.data.isFollowing
    followersCount.value = response.data.followersCount
  } catch (error) {
    // 3b. Rollback: volta exatamente ao estado guardado
    following.value = previous.following
    followersCount.value = previous.count
    showError(error.message || 'Não foi possível atualizar. Tente de novo.')
  } finally {
    isBusy.value = false
  }
}

onBeforeUnmount(() => clearTimeout(errorTimer))
</script>

<template>
  <div class="follow-wrapper">
    <button
      type="button"
      class="ps-btn follow-btn"
      :class="following ? 'ps-btn--ghost is-following' : 'ps-btn--primary'"
      :aria-pressed="following"
      :disabled="isBusy"
      @click="handleClick"
    >
      <template v-if="following">
        <span class="follow-btn__label"><i class="bi bi-person-check-fill follow-btn__icon"></i> Seguindo</span>
        <span class="follow-btn__hover"><i class="bi bi-person-dash"></i> Deixar de seguir</span>
      </template>
      <template v-else>
        <i class="bi bi-person-plus"></i>
        <span>Seguir</span>
      </template>
    </button>

    <div v-if="errorMessage" class="follow-error" role="alert">
      <i class="bi bi-arrow-counterclockwise"></i> {{ errorMessage }}
    </div>
  </div>
</template>
