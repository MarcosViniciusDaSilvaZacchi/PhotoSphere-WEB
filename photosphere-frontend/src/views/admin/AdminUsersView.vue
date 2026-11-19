<script setup>
/**
 * AdminUsersView.vue — Usuários (Aula 15). Rota filha /admin/users.
 *
 * - Busca com debounce: typedText (o campo) → term (depois da pausa). A lista observa
 *   o TERM, não o typedText: digitar "contab" faz uma requisição, não seis.
 *   O campo fica FORA do bloco isLoading — senão ele sumiria a cada busca e
 *   perderia o foco no meio da digitação.
 * - Ação certa por linha: "Você" (a própria linha), "Administrador" (outro admin),
 *   "Desbloquear" (direto) ou "Bloquear" (abre a confirmação).
 * - changeBlocked ESPERA a API; só depois muda o selo. O modal só fecha no sucesso:
 *   se a API recusar (ou estiver Offline), ele continua aberto e o toast avisa.
 */

import { ref, reactive, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { getAdminUsers, setUserBlocked } from '@/services/adminService'
import { usePaginatedList } from '@/composables/usePaginatedList'
import { useDebouncedValue } from '@/composables/useDebouncedValue'
import { useToast } from '@/composables/useToast'
import { useAuth } from '@/composables/useAuth'
import { getProfilePictureUrl } from '@/utils/media'
import { pluralize } from '@/utils/format'
import { SEARCH } from '@/config/constants'
import ConfirmModal from '@/components/base/ConfirmModal.vue'

const toast = useToast()
const { user: currentUser } = useAuth()

const typedText = ref('')
const term = useDebouncedValue(typedText, SEARCH.DEBOUNCE_MS)

const { items: users, hasMore, isLoading, isLoadingMore, error, loadMore } = usePaginatedList(
  (page, limit) => getAdminUsers(term.value.trim(), page, limit),
  undefined,
  { watch: term }
)

const busyIds = reactive(new Set())
const userToBlock = ref(null)
const blockMessage = computed(() =>
  userToBlock.value
    ? `@${userToBlock.value.username} não vai conseguir entrar nem usar a conta até ser desbloqueado(a). As fotos e o perfil continuam visíveis.`
    : ''
)

async function changeBlocked(user, isBlocked) {
  if (busyIds.has(user.id)) return
  busyIds.add(user.id)
  try {
    const response = await setUserBlocked(user.id, isBlocked)
    user.isBlocked = response.data.isBlocked
    toast.success(response.message)
    userToBlock.value = null // só no sucesso
  } catch {
    // toast de erro do interceptor; o modal (se aberto) continua
  } finally {
    busyIds.delete(user.id)
  }
}
</script>

<template>
  <section>
    <div class="admin-search ps-surface mb-3">
      <i class="bi bi-search"></i>
      <input v-model="typedText" type="search" placeholder="Buscar por usuário, nome ou e-mail" aria-label="Buscar usuários" />
    </div>

    <div v-if="isLoading" class="admin-list">
      <div v-for="n in 4" :key="n" class="ps-skeleton" style="height: 72px"></div>
    </div>

    <div v-else-if="error" class="alert alert-danger d-flex align-items-center gap-2 border-0" role="alert">
      <i class="bi bi-shield-exclamation"></i> {{ error.message || 'Não foi possível carregar os usuários.' }}
    </div>

    <ul v-else-if="users.length" class="admin-list">
      <li v-for="item in users" :key="item.id" class="admin-row">
        <img :src="getProfilePictureUrl(item.profilePicture)" :alt="item.username" class="admin-row__avatar" />
        <div class="admin-row__body">
          <RouterLink :to="{ name: 'profile', params: { username: item.username } }" class="admin-row__title">
            {{ item.fullName || item.username }} <span class="admin-row__meta">@{{ item.username }}</span>
          </RouterLink>
          <span class="admin-row__meta">{{ item.email }} · {{ pluralize(item.photosCount, 'foto') }}</span>
          <div class="admin-row__tags">
            <span v-if="item.isAdmin" class="admin-tag admin-tag--brand"><i class="bi bi-shield-lock"></i> Admin</span>
            <span v-if="item.isBlocked" class="admin-tag admin-tag--danger"><i class="bi bi-slash-circle"></i> Bloqueado</span>
          </div>
        </div>

        <span v-if="item.id === currentUser?.id" class="admin-row__note">Você</span>
        <span v-else-if="item.isAdmin" class="admin-row__note">Administrador</span>
        <button
          v-else-if="item.isBlocked"
          type="button"
          class="ps-btn ps-btn--ghost ps-btn--sm admin-row__action"
          :disabled="busyIds.has(item.id)"
          @click="changeBlocked(item, false)"
        >
          <i class="bi bi-unlock"></i> {{ busyIds.has(item.id) ? 'Salvando...' : 'Desbloquear' }}
        </button>
        <button v-else type="button" class="ps-btn ps-btn--danger ps-btn--sm admin-row__action" @click="userToBlock = item">
          <i class="bi bi-slash-circle"></i> Bloquear
        </button>
      </li>
    </ul>

    <div v-else class="ps-empty">
      <div class="ps-empty__icon"><i class="bi bi-people"></i></div>
      <h2 class="h5 fw-bold">Nenhum usuário encontrado</h2>
    </div>

    <div v-if="hasMore && users.length" class="text-center pt-4">
      <button type="button" class="ps-btn ps-btn--ghost px-4" :disabled="isLoadingMore" @click="loadMore">
        {{ isLoadingMore ? 'Carregando...' : 'Carregar mais' }}
      </button>
    </div>

    <ConfirmModal
      v-if="userToBlock"
      :title="`Bloquear @${userToBlock.username}?`"
      :message="blockMessage"
      confirm-label="Bloquear"
      :busy="busyIds.has(userToBlock.id)"
      @confirm="changeBlocked(userToBlock, true)"
      @close="userToBlock = null"
    />
  </section>
</template>
