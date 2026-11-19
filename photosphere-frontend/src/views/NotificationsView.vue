<script setup>
/**
 * NotificationsView.vue — Notificações (Aula 14). Rota /notifications, requiresAuth.
 *
 * Checagem de Alcançabilidade:
 *  - Notificações → sino na Navbar (em todas as telas, para quem está logado);
 *  - Marcar como lida → botão na linha, ou clique no texto da notificação;
 *  - Ir ao que gerou o aviso → clique no texto: foto (curtir/comentar) ou perfil (seguir);
 *  - Ver as mais antigas / as novas → "Carregar mais" no fim / "Atualizar" no topo;
 *  - Denunciar → botão "Denunciar" no Detalhe da foto (visitante → login → volta;
 *    o dono não o vê).
 *
 * Lacuna conhecida (decisão de escopo): a LISTA não se atualiza sozinha; só o número
 * do sino (polling). Para ver as novas, "Atualizar".
 *
 * Marcar como lida = quarto caso do runOptimistic (sem alterar utils/optimistic.js):
 *  - apply: marca a linha e desconta 1 do sino; devolve o undo, que desmarca a linha
 *    e SOMA 1 — a operação inversa, relativa. Se o undo voltasse "ao número que a
 *    linha viu", duas linhas falhando juntas fariam a segunda desfazer a primeira
 *    pela metade (o sino terminaria com um a menos).
 *  - confirm: acerta a linha e entrega à store o unreadCount devolvido pela API.
 *  - uma cerca por linha (busyIds): clique duplo = uma requisição.
 */

import { reactive } from 'vue'
import { RouterLink } from 'vue-router'
import { getNotifications, markNotificationAsRead } from '@/services/notificationService'
import { usePaginatedList } from '@/composables/usePaginatedList'
import { useNotificationsStore } from '@/stores/notifications'
import { runOptimistic } from '@/utils/optimistic'
import { getProfilePictureUrl } from '@/utils/media'
import { formatRelativeTime, formatDateTime } from '@/utils/format'
import { NOTIFICATION_TEXT } from '@/config/constants'

const store = useNotificationsStore()
const { items: notifications, hasMore, isLoading, isLoadingMore, error, loadMore, reload } =
  usePaginatedList(getNotifications)

const busyIds = reactive(new Set())

function targetRoute(notification) {
  if (notification.type === 'follow') {
    return { name: 'profile', params: { username: notification.Actor?.username } }
  }
  return notification.photoId ? { name: 'photo-detail', params: { id: notification.photoId } } : null
}

function markAsRead(notification) {
  if (notification.isRead || busyIds.has(notification.id)) return
  busyIds.add(notification.id)

  runOptimistic({
    apply: () => {
      notification.isRead = true
      store.setUnreadCount(Math.max(0, store.unreadCount - 1))
      return () => {
        notification.isRead = false
        store.setUnreadCount(store.unreadCount + 1) // relativo: a operação inversa
      }
    },
    request: () => markNotificationAsRead(notification.id),
    confirm: (data) => {
      notification.isRead = data.isRead
      store.setUnreadCount(data.unreadCount)
    },
  }).finally(() => busyIds.delete(notification.id))
}

function reloadAll() {
  reload()
  store.refresh()
}
</script>

<template>
  <div class="ps-page">
    <header class="ps-page-header">
      <div>
        <span class="ps-eyebrow">Atividade</span>
        <h1 class="ps-title"><i class="bi bi-bell text-brand"></i> Notificações</h1>
        <p class="text-muted mb-0">Curtidas, comentários e novos seguidores, do mais recente para o mais antigo.</p>
      </div>
      <button type="button" class="ps-btn ps-btn--ghost" :disabled="isLoading" @click="reloadAll">
        <i class="bi bi-arrow-clockwise"></i> Atualizar
      </button>
    </header>

    <div v-if="isLoading" class="notif-list">
      <div v-for="n in 4" :key="n" class="ps-skeleton" style="height: 68px"></div>
    </div>

    <div v-else-if="error" class="alert alert-danger d-flex align-items-center gap-2 border-0" role="alert">
      <i class="bi bi-exclamation-triangle-fill"></i> {{ error.message || 'Não foi possível carregar as notificações.' }}
    </div>

    <ul v-else-if="notifications.length" class="notif-list">
      <li v-for="item in notifications" :key="item.id" class="notif" :class="{ 'is-unread': !item.isRead }">
        <img :src="getProfilePictureUrl(item.Actor?.profilePicture)" :alt="item.Actor?.username" class="notif__avatar" />

        <div class="notif__body">
          <RouterLink v-if="targetRoute(item)" :to="targetRoute(item)" class="notif__text" @click="markAsRead(item)">
            <strong>@{{ item.Actor?.username }}</strong> {{ NOTIFICATION_TEXT[item.type] }}
            <span v-if="item.photo" class="notif__photo">"{{ item.photo.title }}"</span>
          </RouterLink>
          <span v-else class="notif__text">
            <strong>@{{ item.Actor?.username }}</strong> {{ NOTIFICATION_TEXT[item.type] }}
          </span>
          <time class="notif__time" :datetime="item.createdAt" :title="formatDateTime(item.createdAt)">
            {{ formatRelativeTime(item.createdAt) }}
          </time>
        </div>

        <button
          v-if="!item.isRead"
          type="button"
          class="ps-btn ps-btn--ghost ps-btn--sm notif__mark"
          :disabled="busyIds.has(item.id)"
          @click="markAsRead(item)"
        >
          <i class="bi bi-check2"></i> Marcar como lida
        </button>
        <span v-else class="notif__read"><i class="bi bi-check2-all"></i> Lida</span>
      </li>
    </ul>

    <div v-else class="ps-empty">
      <div class="ps-empty__icon"><i class="bi bi-bell-slash"></i></div>
      <h2 class="h5 fw-bold">Nenhuma notificação por enquanto</h2>
      <p class="text-muted">Quando alguém curtir ou comentar suas fotos, ou começar a seguir você, o aviso aparece aqui.</p>
    </div>

    <div v-if="hasMore && notifications.length" class="text-center pt-4">
      <button type="button" class="ps-btn ps-btn--ghost px-4" :disabled="isLoadingMore" @click="loadMore">
        <span v-if="isLoadingMore" class="spinner-border spinner-border-sm"></span>
        <i v-else class="bi bi-arrow-down-circle"></i>
        {{ isLoadingMore ? 'Carregando...' : 'Carregar mais notificações' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.notif-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.55rem; max-width: 820px; }
.notif {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.8rem 1rem;
  border: 1px solid var(--ps-border);
  border-radius: var(--ps-radius);
  background: var(--ps-surface);
}
.notif.is-unread { background: rgba(255, 102, 34, 0.08); border-color: rgba(255, 102, 34, 0.35); }
.notif.is-unread .notif__text { font-weight: 700; }
.notif__avatar { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.notif__body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.15rem; }
.notif__text { color: var(--ps-text); text-decoration: none; font-weight: 500; }
a.notif__text:hover { color: var(--brand-color-light); }
.notif__photo { color: var(--ps-muted); font-weight: 500; }
.notif__time { color: var(--ps-muted); font-size: 0.78rem; }
.notif__mark { flex-shrink: 0; }
.notif__read { color: var(--ps-muted); font-size: 0.8rem; flex-shrink: 0; }
</style>
