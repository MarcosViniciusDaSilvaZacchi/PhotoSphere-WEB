<script setup>
/**
 * CreateAlbumModal.vue — Formulário de novo álbum dentro do BaseModal (Aula 13).
 *
 * - O botão do rodapé fica FORA do <form> (no slot footer), então ele se liga ao
 *   formulário pelo atributo form="create-album-form" — e type="submit" faz o Enter
 *   e o clique passarem pelo mesmo @submit.
 * - novalidate: a validação é a nossa (com os LIMITS), não a bolha do navegador.
 * - isPublic começa false (privado), igual ao padrão da API.
 * - Erro da API aparece DENTRO do modal (createAlbum é { silent: true }), nunca em toast.
 * - Emite 'created' com o álbum que a API devolveu (já com id e contador).
 */

import { reactive, ref } from 'vue'
import BaseModal from '@/components/base/BaseModal.vue'
import { createAlbum } from '@/services/albumService'
import { LIMITS } from '@/config/constants'

const open = defineModel('open', { type: Boolean, default: false })
const emit = defineEmits(['created'])

const form = reactive({ title: '', description: '', isPublic: false })
const errors = reactive({ title: '', description: '' })
const apiError = ref('')
const isSubmitting = ref(false)

function validate() {
  errors.title = ''
  errors.description = ''
  const title = form.title.trim()
  if (title.length < LIMITS.ALBUM_TITLE_MIN || title.length > LIMITS.ALBUM_TITLE_MAX) {
    errors.title = `O título deve ter entre ${LIMITS.ALBUM_TITLE_MIN} e ${LIMITS.ALBUM_TITLE_MAX} caracteres.`
  }
  if (form.description.trim().length > LIMITS.ALBUM_DESCRIPTION_MAX) {
    errors.description = `A descrição não pode exceder ${LIMITS.ALBUM_DESCRIPTION_MAX} caracteres.`
  }
  return !errors.title && !errors.description
}

async function handleSubmit() {
  apiError.value = ''
  if (!validate()) return // erro no cliente: nenhuma requisição sai

  isSubmitting.value = true
  try {
    const response = await createAlbum({
      title: form.title.trim(),
      description: form.description.trim(),
      isPublic: form.isPublic,
    })
    emit('created', response.data)
    open.value = false
  } catch (error) {
    apiError.value = error.message || 'Não foi possível criar o álbum.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <BaseModal v-model="open" title="Novo álbum" icon="bi-collection" :persistent="isSubmitting" max-width="480px">
    <form id="create-album-form" class="text-start" novalidate @submit.prevent="handleSubmit">
      <div class="mb-3">
        <label for="album-title" class="form-label small fw-semibold">Título</label>
        <input
          id="album-title"
          v-model="form.title"
          type="text"
          class="form-control"
          :class="{ 'is-invalid': errors.title }"
          :maxlength="LIMITS.ALBUM_TITLE_MAX"
          placeholder="Ex.: Viagem para a serra"
          :disabled="isSubmitting"
          autofocus
        />
        <div v-if="errors.title" class="invalid-feedback d-block">{{ errors.title }}</div>
      </div>

      <div class="mb-3">
        <label for="album-description" class="form-label small fw-semibold">Descrição (opcional)</label>
        <textarea
          id="album-description"
          v-model="form.description"
          class="form-control"
          :class="{ 'is-invalid': errors.description }"
          rows="3"
          :disabled="isSubmitting"
        ></textarea>
        <div v-if="errors.description" class="invalid-feedback d-block">{{ errors.description }}</div>
      </div>

      <div class="form-check form-switch">
        <input id="album-public" v-model="form.isPublic" class="form-check-input" type="checkbox" :disabled="isSubmitting" />
        <label for="album-public" class="form-check-label small">
          Pública <span class="text-muted">— qualquer pessoa com o link pode ver</span>
        </label>
      </div>

      <p v-if="apiError" class="text-danger small mt-3 mb-0" role="alert">
        <i class="bi bi-exclamation-circle me-1"></i>{{ apiError }}
      </p>
    </form>

    <template #footer="{ close }">
      <button type="button" class="ps-btn ps-btn--ghost" :disabled="isSubmitting" @click="close">Cancelar</button>
      <button type="submit" form="create-album-form" class="ps-btn ps-btn--primary" :disabled="isSubmitting">
        <span v-if="isSubmitting" class="spinner-border spinner-border-sm"></span>
        <i v-else class="bi bi-plus-lg"></i>
        {{ isSubmitting ? 'Criando...' : 'Criar álbum' }}
      </button>
    </template>
  </BaseModal>
</template>
