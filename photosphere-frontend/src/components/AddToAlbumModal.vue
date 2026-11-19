<script setup>
/**
 * AddToAlbumModal.vue — "Salvar em álbuns" (Aula 13).
 *
 * - Abre já marcado conforme o servidor (GET /photos/:id/albums-status → hasPhoto).
 * - Cada linha é uma caixa com :checked (ligação SÓ DE IDA) e @change — nunca v-model:
 *   quem muda o estado é o toggle (otimista), e o rollback precisa conseguir desmarcar.
 * - Terceiro caso de atualização otimista → runOptimistic:
 *     apply   inverte hasPhoto e soma/subtrai 1 do contador, devolvendo o undo;
 *     request escolhe adicionar ou remover conforme o estado de ANTES (variável local);
 *     confirm acerta só o contador com o número do servidor.
 * - Uma "cerca" POR LINHA (um Set reativo de ids em andamento): dois cliques rápidos
 *   na mesma caixa geram uma requisição; caixas diferentes funcionam ao mesmo tempo.
 */

import { reactive } from 'vue'
import { RouterLink } from 'vue-router'
import BaseModal from '@/components/base/BaseModal.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { runOptimistic } from '@/utils/optimistic'
import { getAlbumsStatus, addPhotoToAlbum, removePhotoFromAlbum } from '@/services/albumService'
import { pluralize } from '@/utils/format'

const props = defineProps({
  photoId: { type: [Number, String], required: true },
})
const open = defineModel('open', { type: Boolean, default: false })

const { data: albums, error, isLoading } = useAsyncData(() => getAlbumsStatus(props.photoId), { initialData: [] })

const busyIds = reactive(new Set())

function toggle(album) {
  if (busyIds.has(album.id)) return
  busyIds.add(album.id)

  const wasIn = album.hasPhoto // estado de ANTES, guardado antes do apply mudar a tela

  runOptimistic({
    apply: () => {
      album.hasPhoto = !wasIn
      album.photosCount = Math.max(0, album.photosCount + (wasIn ? -1 : 1))
      return () => {
        album.hasPhoto = wasIn
        album.photosCount = Math.max(0, album.photosCount + (wasIn ? 1 : -1))
      }
    },
    request: () => (wasIn ? removePhotoFromAlbum(album.id, props.photoId) : addPhotoToAlbum(album.id, props.photoId)),
    confirm: (data) => {
      album.photosCount = data.photosCount
    },
  }).finally(() => busyIds.delete(album.id))
}
</script>

<template>
  <BaseModal v-model="open" title="Salvar em álbuns" icon="bi-bookmark-plus" max-width="460px">
    <div class="text-start">
      <div v-if="isLoading" class="d-flex flex-column gap-2">
        <div v-for="n in 3" :key="n" class="ps-skeleton" style="height: 48px; border-radius: 12px"></div>
      </div>

      <p v-else-if="error" class="text-danger small mb-0">
        <i class="bi bi-exclamation-circle me-1"></i>{{ error.message || 'Não foi possível carregar seus álbuns.' }}
      </p>

      <div v-else-if="albums.length === 0" class="text-center py-2">
        <p class="mb-2">Você ainda não tem álbuns.</p>
        <RouterLink :to="{ name: 'albums' }" class="ps-btn ps-btn--primary ps-btn--sm" @click="open = false">
          <i class="bi bi-plus-lg"></i> Criar meu primeiro álbum
        </RouterLink>
      </div>

      <ul v-else class="album-check-list">
        <li v-for="album in albums" :key="album.id">
          <label class="album-check" :class="{ 'is-busy': busyIds.has(album.id) }">
            <input
              type="checkbox"
              class="form-check-input"
              :checked="album.hasPhoto"
              :disabled="busyIds.has(album.id)"
              @change="toggle(album)"
            />
            <span class="album-check__title">{{ album.title }}</span>
            <i v-if="!album.isPublic" class="bi bi-lock-fill album-check__lock" title="Privado" aria-label="Privado"></i>
            <span class="album-check__count">{{ pluralize(album.photosCount, 'foto') }}</span>
          </label>
        </li>
      </ul>
    </div>

    <template #footer="{ close }">
      <button type="button" class="ps-btn ps-btn--ghost" @click="close">Concluir</button>
    </template>
  </BaseModal>
</template>

<style scoped>
.album-check-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.45rem; max-height: 320px; overflow-y: auto; }
.album-check {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.7rem 0.85rem;
  border: 1px solid var(--ps-border);
  border-radius: 12px;
  background: var(--ps-surface-2);
  color: var(--ps-text);
  cursor: pointer;
  transition: border-color 0.2s;
}
.album-check:hover { border-color: rgba(255, 102, 34, 0.45); }
.album-check.is-busy { opacity: 0.7; cursor: progress; }
.album-check .form-check-input { margin: 0; flex-shrink: 0; }
.album-check__title { flex: 1; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.album-check__lock { color: var(--ps-muted); font-size: 0.85rem; }
.album-check__count { color: var(--ps-muted); font-size: 0.8rem; white-space: nowrap; }
</style>
