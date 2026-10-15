<script setup>
/**
 * BaseModal.vue — Componente-base de janela modal genérica (Aula 09).
 *
 * - Controlado por v-model (defineModel): o pai decide quando abrir/fechar.
 * - <Teleport to="body">: o modal é renderizado no fim do <body>, FORA do card
 *   e de qualquer container com transform/overflow. Por isso fica centralizado
 *   na tela mesmo que o pai tenha efeitos de hover (transform cria um novo
 *   contexto de posicionamento e "prenderia" um position: fixed lá dentro).
 * - Fecha com: botão X, Esc, clique no fundo escuro. Clicar DENTRO da caixa não fecha
 *   (@click.self só dispara quando o alvo é o próprio fundo).
 * - persistent: enquanto uma ação está em andamento (ex.: excluindo), nada fecha.
 */

import { watch, onBeforeUnmount } from 'vue'

const open = defineModel({ type: Boolean, default: false })

const props = defineProps({
  title: { type: String, default: '' },
  icon: { type: String, default: '' },          // classe do Bootstrap Icons, ex.: 'bi-trash3'
  variant: { type: String, default: 'default' }, // 'default' | 'danger'
  persistent: { type: Boolean, default: false },
  maxWidth: { type: String, default: '440px' },
})

const emit = defineEmits(['close'])

function close() {
  if (props.persistent) return
  open.value = false
  emit('close')
}

function onKeydown(event) {
  if (event.key === 'Escape') close()
}

// Liga/desliga o Esc e trava o scroll da página só enquanto o modal está aberto
watch(open, (isOpen) => {
  if (isOpen) {
    document.addEventListener('keydown', onKeydown)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', onKeydown)
    document.body.style.overflow = ''
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal-backdrop-ps" @click.self="close">
        <div
          class="modal-box"
          :class="`modal-box--${variant}`"
          :style="{ maxWidth }"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
        >
          <button type="button" class="modal-close" aria-label="Fechar" :disabled="persistent" @click="close">
            <i class="bi bi-x-lg"></i>
          </button>

          <div v-if="icon" class="modal-icon"><i class="bi" :class="icon"></i></div>
          <h3 v-if="title" class="modal-title-ps">{{ title }}</h3>

          <div class="modal-body-ps">
            <slot />
          </div>

          <div v-if="$slots.footer" class="modal-footer-ps">
            <slot name="footer" :close="close" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop-ps {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(5, 3, 2, 0.72);
  backdrop-filter: blur(6px);
}

.modal-box {
  position: relative;
  width: 100%;
  padding: 2rem 1.75rem 1.5rem;
  text-align: center;
  color: var(--ps-text);
  background: var(--ps-surface);
  border: 1px solid var(--ps-border-strong);
  border-radius: 20px;
  box-shadow: 0 30px 80px -20px rgba(0, 0, 0, 0.8);
}

.modal-close {
  position: absolute;
  top: 0.85rem;
  right: 0.85rem;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 50%;
  color: var(--ps-muted);
  background: transparent;
  transition: background-color 0.2s, color 0.2s;
}
.modal-close:hover:not(:disabled) { background: var(--ps-surface-2); color: var(--ps-text); }

.modal-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 1rem;
  display: grid;
  place-items: center;
  border-radius: 18px;
  font-size: 1.5rem;
  color: var(--brand-color);
  background: rgba(255, 102, 34, 0.12);
}
.modal-box--danger .modal-icon { color: #ff7a7f; background: rgba(255, 90, 95, 0.12); }

.modal-title-ps { font-size: 1.2rem; font-weight: 700; margin-bottom: 0.5rem; }
.modal-body-ps { color: var(--ps-muted); font-size: 0.93rem; line-height: 1.55; }
.modal-footer-ps { display: flex; gap: 0.6rem; justify-content: center; margin-top: 1.5rem; flex-wrap: wrap; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-active .modal-box, .modal-leave-active .modal-box { transition: transform 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-box, .modal-leave-to .modal-box { transform: translateY(12px) scale(0.97); }
</style>
