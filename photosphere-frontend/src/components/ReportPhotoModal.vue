<script setup>
/**
 * ReportPhotoModal.vue — Denunciar uma foto (Aula 14).
 *
 * - Cinco rádios (v-for em REPORT_REASONS, mesmo name, :value = a CHAVE, v-model):
 *   o banco guarda "harassment", a tela mostra "Assédio ou discurso de ódio";
 * - motivo obrigatório: sem escolha, mensagem no modal e nenhuma requisição;
 * - <fieldset :disabled="isSubmitting"> trava os rádios durante o envio;
 * - erro da API ("Você já denunciou...", Offline) DENTRO do modal — reportPhoto é silent;
 * - emite 'reported'; quem abriu o modal fecha e mostra o toast de sucesso.
 */

import { ref } from 'vue'
import BaseModal from '@/components/base/BaseModal.vue'
import { reportPhoto } from '@/services/reportService'
import { REPORT_REASONS } from '@/config/constants'

const props = defineProps({
  photoId: { type: [Number, String], required: true },
})
const open = defineModel('open', { type: Boolean, default: false })
const emit = defineEmits(['reported'])

const reason = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

async function handleSubmit() {
  errorMessage.value = ''
  if (!reason.value) {
    errorMessage.value = 'Escolha um motivo para continuar.'
    return
  }

  isSubmitting.value = true
  try {
    const response = await reportPhoto(props.photoId, reason.value)
    emit('reported', response)
  } catch (error) {
    errorMessage.value = error.message || 'Não foi possível enviar a denúncia.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <BaseModal v-model="open" title="Denunciar esta foto" icon="bi-flag" variant="danger" :persistent="isSubmitting" max-width="480px">
    <form id="report-photo-form" class="text-start" novalidate @submit.prevent="handleSubmit">
      <fieldset :disabled="isSubmitting">
        <legend class="small text-muted mb-2">Por que esta foto precisa da atenção da moderação?</legend>
        <div v-for="option in REPORT_REASONS" :key="option.value" class="form-check report-option">
          <input
            :id="`reason-${option.value}`"
            v-model="reason"
            class="form-check-input"
            type="radio"
            name="report-reason"
            :value="option.value"
            @change="errorMessage = ''"
          />
          <label class="form-check-label" :for="`reason-${option.value}`">{{ option.label }}</label>
        </div>
      </fieldset>

      <p v-if="errorMessage" class="text-danger small mt-3 mb-0" role="alert">
        <i class="bi bi-exclamation-circle me-1"></i>{{ errorMessage }}
      </p>
    </form>

    <template #footer="{ close }">
      <button type="button" class="ps-btn ps-btn--ghost" :disabled="isSubmitting" @click="close">Cancelar</button>
      <button type="submit" form="report-photo-form" class="ps-btn ps-btn--danger" :disabled="isSubmitting">
        <span v-if="isSubmitting" class="spinner-border spinner-border-sm"></span>
        <i v-else class="bi bi-flag"></i>
        {{ isSubmitting ? 'Enviando...' : 'Enviar denúncia' }}
      </button>
    </template>
  </BaseModal>
</template>

<style scoped>
.report-option { padding: 0.5rem 0.75rem 0.5rem 2.2rem; border-radius: 10px; color: var(--ps-text); }
.report-option:hover { background: var(--ps-surface-2); }
fieldset { border: 0; padding: 0; margin: 0; }
</style>
