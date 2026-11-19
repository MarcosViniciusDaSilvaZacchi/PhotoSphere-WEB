/**
 * src/composables/useDebouncedValue.js — Valor "atrasado" até a pessoa parar de digitar (Aula 13).
 *
 * Devolve uma ref que só copia o valor da origem depois de `delay` ms SEM mudanças.
 * Digitar "montanha" sem pausa gera uma requisição de busca, não oito.
 * Cada nova tecla cancela o timer anterior (clearTimeout) e começa outro.
 *
 * @param {import('vue').Ref<any>} source
 * @param {number} delay
 */

import { ref, watch, onUnmounted } from 'vue'

export function useDebouncedValue(source, delay) {
  const debounced = ref(source.value) // começa igual: sem esperar na primeira vez
  let timer = null

  watch(source, (value) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      debounced.value = value
    }, delay)
  })

  // sem isto, um timer pendente dispararia depois de a tela já ter saído
  onUnmounted(() => clearTimeout(timer))

  return debounced
}
