/**
 * src/composables/useToast.js — Avisos flutuantes (toasts) (Aula 12).
 *
 * A lista `toasts` fica FORA da função useToast(): ela é criada uma única vez,
 * quando o módulo é carregado, e toda chamada de useToast() devolve a MESMA lista
 * (um singleton). Assim o interceptor do Axios (que não é componente), qualquer
 * tela e o ToastContainer enxergam os mesmos avisos — sem precisar de uma store
 * do Pinia, sem provide/inject e sem depender de estar dentro de um setup().
 *
 * Quem avisa o quê:
 *  - ação que falha (curtir, seguir, excluir...)  → toast de erro, pelo interceptor;
 *  - leitura que falha (abrir uma tela)            → a própria tela mostra o erro;
 *  - formulário que falha                          → o erro aparece no formulário (silent).
 */

import { ref } from 'vue'
import { TOAST_DURATION } from '@/config/constants'

const toasts = ref([])
let nextId = 1

function remove(id) {
  toasts.value = toasts.value.filter((toast) => toast.id !== id)
}

function show(message, type = 'info', duration = TOAST_DURATION.INFO) {
  const id = nextId++
  toasts.value = [...toasts.value, { id, message, type }]
  if (duration > 0) setTimeout(() => remove(id), duration)
  return id
}

export function useToast() {
  return {
    toasts,
    remove,
    success: (message) => show(message, 'success', TOAST_DURATION.SUCCESS),
    error: (message) => show(message, 'error', TOAST_DURATION.ERROR),
    info: (message) => show(message, 'info', TOAST_DURATION.INFO),
  }
}
