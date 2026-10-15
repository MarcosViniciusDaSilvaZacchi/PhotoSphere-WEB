/**
 * src/composables/useClickOutside.js — Detecta cliques fora de um elemento (Aula 09).
 *
 * Usado pelo menu suspenso do avatar na Navbar: o menu fecha quando a pessoa
 * clica em qualquer lugar da página que NÃO seja o próprio menu/botão.
 *
 * Registra o ouvinte no document ao montar e o remove ao desmontar — sem isso,
 * cada vez que o componente fosse recriado sobraria um ouvinte "fantasma".
 *
 * @param {import('vue').Ref<HTMLElement|null>} targetRef - elemento "de dentro"
 * @param {(event: Event) => void} handler - chamado quando o clique é fora
 */

import { onMounted, onBeforeUnmount } from 'vue'

export function useClickOutside(targetRef, handler) {
  function listener(event) {
    const el = targetRef.value
    if (!el) return
    // contains() cobre o próprio elemento e todos os filhos
    if (el === event.target || el.contains(event.target)) return
    handler(event)
  }

  onMounted(() => {
    // pointerdown cobre mouse, toque e caneta, e dispara antes do click
    document.addEventListener('pointerdown', listener)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', listener)
  })
}
