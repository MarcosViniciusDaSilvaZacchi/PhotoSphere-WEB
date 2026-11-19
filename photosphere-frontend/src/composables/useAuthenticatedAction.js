/**
 * src/composables/useAuthenticatedAction.js — A "cerca" dos botões de ação (Aula 12).
 *
 * Curtir e Seguir repetiam as mesmas duas guardas antes de agir:
 *  1. visitante? → vai ao login com ?redirect= e volta para esta tela depois;
 *  2. já tem uma requisição em andamento? → ignora o clique (isBusy).
 *
 * run(action) aplica as duas e libera a cerca quando a ação termina (deu certo
 * ou não). O aviso de erro NÃO fica aqui: quem avisa é o interceptor (toast).
 * O catch de quem usa só desfaz a mudança visual.
 */

import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

export function useAuthenticatedAction() {
  const router = useRouter()
  const route = useRoute()
  const { isAuthenticated } = useAuth()
  const isBusy = ref(false)

  async function run(action) {
    if (!isAuthenticated.value) {
      router.push({ name: 'login', query: { redirect: route.fullPath } })
      return
    }
    if (isBusy.value) return

    isBusy.value = true
    try {
      await action()
    } finally {
      isBusy.value = false
    }
  }

  return { isBusy, run }
}
