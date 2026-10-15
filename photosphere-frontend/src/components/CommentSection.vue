<script setup>
/**
 * CommentSection.vue — Lista + formulário de comentários (Aula 10).
 *
 * - Lista com os três estados: carregando, erro (com "tentar de novo") e vazio.
 * - Formulário só para quem está logado; visitante vê um convite para entrar
 *   (com ?redirect= de volta para esta foto).
 * - Validação no cliente igual à da API (vazio, só espaços, > 500): nenhum
 *   desses casos chega a fazer requisição.
 * - Comentário novo entra no TOPO da lista (unshift) com o objeto que a API
 *   devolveu (já com o autor) — sem recarregar a lista inteira.
 * - SEGURANÇA: o texto é exibido com {{ }} (interpolação), que ESCAPA o HTML.
 *   Nunca v-html: um comentário como <img src=x onerror="..."> seria executado
 *   no navegador de todo mundo que abrisse a foto (XSS armazenado).
 *   As quebras de linha são preservadas via CSS (white-space: pre-wrap).
 */

import { ref, computed, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { getComments, createComment } from '@/services/commentService'
import { useAuth } from '@/composables/useAuth'
import { getProfilePictureUrl } from '@/utils/media'
import { formatRelativeTime, formatDateTime, pluralize } from '@/utils/format'

const COMMENT_MAX = 500 // espelha VALIDATION.COMMENT_MAX da API

const props = defineProps({
  photoId: { type: [Number, String], required: true },
})

const emit = defineEmits(['count-change'])

const route = useRoute()
const { isAuthenticated, user } = useAuth()

const comments = ref([])
const isLoading = ref(true)
const loadError = ref('')

const content = ref('')
const formError = ref('')
const isSending = ref(false)
const newCommentId = ref(null)

const remaining = computed(() => COMMENT_MAX - content.value.length)

async function loadComments() {
  isLoading.value = true
  loadError.value = ''
  try {
    const response = await getComments(props.photoId)
    comments.value = response.data || []
  } catch (error) {
    loadError.value = error.message || 'Não foi possível carregar os comentários.'
  } finally {
    isLoading.value = false
  }
}

function validate() {
  const text = content.value.trim()
  if (!text) return 'Escreva algo antes de enviar.'
  if (text.length > COMMENT_MAX) return `O comentário não pode exceder ${COMMENT_MAX} caracteres.`
  return ''
}

async function handleSubmit() {
  formError.value = validate()
  if (formError.value) return // erro no cliente: a API nem é chamada

  isSending.value = true
  try {
    const response = await createComment(props.photoId, content.value.trim())
    comments.value.unshift(response.data) // novo no topo
    newCommentId.value = response.data.id
    content.value = ''
    emit('count-change', comments.value.length)
  } catch (error) {
    formError.value = error.message || 'Não foi possível publicar o comentário.'
  } finally {
    isSending.value = false
  }
}

// Ctrl/Cmd + Enter envia
function onKeydown(event) {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) handleSubmit()
}

watch(() => props.photoId, loadComments, { immediate: true })
</script>

<template>
  <section class="comments" aria-labelledby="comments-title">
    <header class="comments__header">
      <h2 id="comments-title" class="comments__title">
        <i class="bi bi-chat-left-text text-brand me-2"></i>Comentários
      </h2>
      <span v-if="!isLoading && !loadError" class="ps-chip">{{ pluralize(comments.length, 'comentário') }}</span>
    </header>

    <!-- Formulário (somente logado) -->
    <form v-if="isAuthenticated" class="comment-form" novalidate @submit.prevent="handleSubmit">
      <div class="d-flex gap-2">
        <img :src="getProfilePictureUrl(user?.profilePicture)" alt="" class="comment__avatar" />
        <div class="flex-grow-1">
          <textarea
            v-model="content"
            class="form-control"
            :class="{ 'is-invalid': formError }"
            rows="3"
            placeholder="Escreva um comentário..."
            :disabled="isSending"
            aria-label="Novo comentário"
            @keydown="onKeydown"
            @input="formError = ''"
          ></textarea>
          <div v-if="formError" class="invalid-feedback d-block">{{ formError }}</div>

          <div class="comment-form__footer">
            <span class="comment-form__counter" :class="{ 'is-over': remaining < 0 }">{{ remaining }} restantes</span>
            <button type="submit" class="ps-btn ps-btn--primary ps-btn--sm" :disabled="isSending">
              <span v-if="isSending" class="spinner-border spinner-border-sm"></span>
              <i v-else class="bi bi-send"></i>
              Comentar
            </button>
          </div>
        </div>
      </div>
    </form>

    <!-- Visitante -->
    <p v-else class="comment-login">
      <RouterLink :to="{ name: 'login', query: { redirect: route.fullPath } }" class="fw-semibold">Entre</RouterLink>
      para deixar um comentário.
    </p>

    <!-- Estados da lista -->
    <div v-if="isLoading" class="d-flex flex-column gap-3">
      <div v-for="n in 2" :key="n" class="ps-skeleton" style="height: 64px; border-radius: 14px"></div>
    </div>

    <div v-else-if="loadError" class="text-center py-3">
      <p class="text-danger small mb-2"><i class="bi bi-exclamation-circle me-1"></i>{{ loadError }}</p>
      <button type="button" class="ps-btn ps-btn--ghost ps-btn--sm" @click="loadComments">
        <i class="bi bi-arrow-clockwise"></i> Tentar de novo
      </button>
    </div>

    <p v-else-if="comments.length === 0" class="text-muted small text-center py-3 mb-0">
      Nenhum comentário ainda. {{ isAuthenticated ? 'Seja o primeiro!' : '' }}
    </p>

    <ul v-else class="comment-list">
      <li
        v-for="comment in comments"
        :key="comment.id"
        class="comment"
        :class="{ 'comment--new': comment.id === newCommentId }"
      >
        <RouterLink :to="{ name: 'profile', params: { username: comment.author?.username } }">
          <img :src="getProfilePictureUrl(comment.author?.profilePicture)" :alt="comment.author?.username" class="comment__avatar" />
        </RouterLink>
        <div class="comment__bubble">
          <div class="comment__meta">
            <RouterLink :to="{ name: 'profile', params: { username: comment.author?.username } }" class="comment__author">
              {{ comment.author?.fullName || comment.author?.username }}
            </RouterLink>
            <time class="comment__time" :datetime="comment.createdAt" :title="formatDateTime(comment.createdAt)">
              {{ formatRelativeTime(comment.createdAt) }}
            </time>
          </div>
          <!-- {{ }} escapa o HTML — NUNCA usar v-html aqui -->
          <p class="comment__text">{{ comment.content }}</p>
        </div>
      </li>
    </ul>
  </section>
</template>
