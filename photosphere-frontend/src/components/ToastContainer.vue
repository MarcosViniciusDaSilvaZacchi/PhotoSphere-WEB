<script setup>
/**
 * ToastContainer.vue — Mostra os toasts do useToast() (Aula 12).
 *
 * Montado UMA vez, em App.vue. Usa <Teleport to="body"> e z-index acima do
 * BaseModal (2000), para o aviso aparecer na frente de um modal aberto
 * (ex.: falha ao excluir com o modal de confirmação na tela).
 */

import { useToast } from '@/composables/useToast'

const { toasts, remove } = useToast()

const ICONS = {
  success: 'bi-check-circle-fill',
  error: 'bi-exclamation-octagon-fill',
  info: 'bi-info-circle-fill',
}
</script>

<template>
  <Teleport to="body">
    <div class="toast-stack" aria-live="polite" aria-atomic="false">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast-ps"
          :class="`toast-ps--${toast.type}`"
          :role="toast.type === 'error' ? 'alert' : 'status'"
        >
          <i class="bi toast-ps__icon" :class="ICONS[toast.type]"></i>
          <span class="toast-ps__text">{{ toast.message }}</span>
          <button type="button" class="toast-ps__close" aria-label="Fechar aviso" @click="remove(toast.id)">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-stack {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 3000; /* acima do BaseModal (2000) */
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  width: min(380px, calc(100vw - 2.5rem));
  pointer-events: none;
}

.toast-ps {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.85rem 0.9rem;
  border-radius: 14px;
  border: 1px solid var(--ps-border-strong);
  background: var(--ps-surface);
  color: var(--ps-text);
  font-size: 0.9rem;
  box-shadow: 0 18px 40px -18px rgba(0, 0, 0, 0.9);
}
.toast-ps--success { border-color: rgba(46, 204, 113, 0.55); }
.toast-ps--success .toast-ps__icon { color: #2ecc71; }
.toast-ps--error { border-color: rgba(255, 90, 95, 0.6); background: #2a1414; }
.toast-ps--error .toast-ps__icon { color: #ff6b70; }
.toast-ps--info .toast-ps__icon { color: var(--brand-color); }

.toast-ps__icon { font-size: 1.1rem; line-height: 1.3; }
.toast-ps__text { flex: 1; line-height: 1.4; }
.toast-ps__close {
  border: 0;
  background: transparent;
  color: var(--ps-muted);
  padding: 0 0.15rem;
  line-height: 1;
}
.toast-ps__close:hover { color: var(--ps-text); }

.toast-enter-active, .toast-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }
</style>
