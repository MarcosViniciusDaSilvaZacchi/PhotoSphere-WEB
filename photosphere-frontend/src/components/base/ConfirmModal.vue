<script setup>
/**
 * ConfirmModal.vue — Confirmação genérica sobre o BaseModal (Aula 15).
 *
 * Quem usa decide QUANDO ele existe (v-if) — o mesmo dado que liga o modal
 * (ex.: userToBlock) é o que a mensagem mostra. Durante a chamada (busy), nada
 * fecha e o botão mostra "Aguarde...". Se a API recusar, quem usa simplesmente
 * não fecha: o modal continua aberto para tentar de novo ou cancelar.
 */

import BaseModal from '@/components/base/BaseModal.vue'

defineProps({
  title: { type: String, required: true },
  message: { type: String, default: '' },
  confirmLabel: { type: String, default: 'Confirmar' },
  confirmVariant: { type: String, default: 'danger' }, // classe ps-btn--<variant>
  busy: { type: Boolean, default: false },
})

const emit = defineEmits(['confirm', 'close'])

function onOpenChange(value) {
  if (!value) emit('close')
}
</script>

<template>
  <BaseModal
    :model-value="true"
    :title="title"
    :icon="confirmVariant === 'danger' ? 'bi-exclamation-triangle' : 'bi-question-circle'"
    :variant="confirmVariant === 'danger' ? 'danger' : 'default'"
    :persistent="busy"
    @update:model-value="onOpenChange"
  >
    <p class="mb-0">{{ message }}</p>
    <slot />

    <template #footer>
      <button type="button" class="ps-btn ps-btn--ghost" :disabled="busy" @click="emit('close')">Cancelar</button>
      <button type="button" class="ps-btn" :class="`ps-btn--${confirmVariant}`" :disabled="busy" @click="emit('confirm')">
        <span v-if="busy" class="spinner-border spinner-border-sm"></span>
        {{ busy ? 'Aguarde...' : confirmLabel }}
      </button>
    </template>
  </BaseModal>
</template>
