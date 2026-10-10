<script setup>
/**
 * BaseButton.vue — Componente-base de botão.
 *
 * Padroniza o visual dos botões de ação e submissão com a cor de marca (#FF6622),
 * suporte a indicador de carregamento (spinner) e estados interativos.
 */

defineProps({
  type: {
    type: String,
    default: 'button',
  },
  variant: {
    type: String,
    default: 'brand', // 'brand' | 'outline-brand' | 'secondary'
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  fullWidth: {
    type: Boolean,
    default: true,
  },
  size: {
    type: String,
    default: 'lg', // 'sm' | 'md' | 'lg'
  },
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="btn d-inline-flex align-items-center justify-content-center fw-semibold shadow-sm"
    :class="[
      `btn-${variant}`,
      `btn-${size}`,
      { 'w-100': fullWidth }
    ]"
  >
    <span
      v-if="loading"
      class="spinner-border spinner-border-sm me-2"
      role="status"
      aria-hidden="true"
    ></span>
    <slot />
  </button>
</template>

<style scoped>
.btn {
  border-radius: 8px;
  letter-spacing: 0.02em;
  transition: all 0.2s ease-in-out;
}

.btn-brand {
  background-color: var(--brand-color, #FF6622);
  border-color: var(--brand-color, #FF6622);
  color: #fff;
}

.btn-brand:hover:not(:disabled),
.btn-brand:focus:not(:disabled) {
  background-color: var(--brand-color-hover, #E74800);
  border-color: var(--brand-color-hover, #E74800);
  color: #fff;
  box-shadow: 0 4px 12px rgba(255, 102, 34, 0.35);
}

.btn-outline-brand {
  background-color: transparent;
  border-color: var(--brand-color, #FF6622);
  color: var(--brand-color, #FF6622);
}

.btn-outline-brand:hover:not(:disabled),
.btn-outline-brand:focus:not(:disabled) {
  background-color: var(--brand-color, #FF6622);
  border-color: var(--brand-color, #FF6622);
  color: #fff;
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
</style>
