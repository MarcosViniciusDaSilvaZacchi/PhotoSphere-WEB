<script setup>
/**
 * AlbumDetailView.vue — Detalhe de um álbum (Aula 13). Rota PÚBLICA /albums/:id.
 *
 * - useAsyncData com watch no :id;
 * - 403 (privado de outra pessoa) e 404 aparecem NO LUGAR do conteúdo, sem toast
 *   (leitura que falha é da tela), com um botão para sair;
 * - "Remover do álbum" só para a dona (v-if="isOwner" no slot de ações do card) e
 *   PESSIMISTA: espera a API, depois tira o card da lista e usa o contador devolvido.
 *   Diferente da caixa do modal "Salvar" (otimista): aqui o card SOME da tela —
 *   se ele sumisse antes e a API falhasse, teria de "voltar do nada".
 */

import { computed, reactive } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { getAlbum, removePhotoFromAlbum } from '@/services/albumService'
import { useAsyncData } from '@/composables/useAsyncData'
import { useToast } from '@/composables/useToast'
import { getProfilePictureUrl } from '@/utils/media'
import { pluralize } from '@/utils/format'
import PhotoCard from '@/components/PhotoCard.vue'

const route = useRoute()
const toast = useToast()

const { data: album, error, isLoading } = useAsyncData(() => getAlbum(route.params.id), {
  watch: () => route.params.id,
})

const isOwner = computed(() => !!album.value?.isOwner)
const photos = computed(() => album.value?.photos || [])
const removingIds = reactive(new Set())

const errorView = computed(() => {
  if (!error.value) return null
  if (error.value.status === 403) {
    return { icon: 'bi-lock-fill', title: 'Este álbum é privado', text: 'Só a dona do álbum pode ver o que tem nele.' }
  }
  if (error.value.status === 404 || error.value.status === 400) {
    return { icon: 'bi-collection', title: 'Álbum não encontrado', text: 'Ele pode ter sido excluído ou o endereço está incorreto.' }
  }
  return { icon: 'bi-wifi-off', title: 'Não foi possível carregar o álbum', text: error.value.message }
})

async function removePhoto(photo) {
  if (removingIds.has(photo.id)) return
  removingIds.add(photo.id)
  try {
    const response = await removePhotoFromAlbum(album.value.id, photo.id)
    album.value.photos = album.value.photos.filter((p) => p.id !== photo.id)
    album.value.photosCount = response.data.photosCount
    toast.success(`"${photo.title}" saiu do álbum.`)
  } catch {
    // toast de erro do interceptor; o card continua na lista
  } finally {
    removingIds.delete(photo.id)
  }
}
</script>

<template>
  <div class="ps-page">
    <div v-if="isLoading">
      <div class="ps-skeleton" style="height: 140px"></div>
      <div class="ps-grid mt-4">
        <div v-for="n in 3" :key="n" class="ps-skeleton" style="height: 300px"></div>
      </div>
    </div>

    <div v-else-if="errorView" class="ps-empty">
      <div class="ps-empty__icon"><i class="bi" :class="errorView.icon"></i></div>
      <h1 class="h4 fw-bold">{{ errorView.title }}</h1>
      <p class="text-muted">{{ errorView.text }}</p>
      <RouterLink to="/" class="ps-btn ps-btn--primary mt-2"><i class="bi bi-house"></i> Ir para o início</RouterLink>
    </div>

    <template v-else-if="album">
      <header class="ps-surface album-hero">
        <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
          <span class="album-badge" :class="album.isPublic ? 'album-badge--public' : 'album-badge--private'">
            <i class="bi" :class="album.isPublic ? 'bi-globe2' : 'bi-lock-fill'"></i>
            {{ album.isPublic ? 'Pública' : 'Privada' }}
          </span>
          <span class="ps-chip">{{ pluralize(album.photosCount, 'foto') }}</span>
        </div>
        <h1 class="ps-title mb-1">{{ album.title }}</h1>
        <p v-if="album.description" class="text-muted mb-3">{{ album.description }}</p>
        <RouterLink v-if="album.owner" :to="{ name: 'profile', params: { username: album.owner.username } }" class="album-owner">
          <img :src="getProfilePictureUrl(album.owner.profilePicture)" :alt="album.owner.username" />
          <span>por <strong>{{ album.owner.fullName || album.owner.username }}</strong></span>
        </RouterLink>
      </header>

      <div v-if="photos.length" class="ps-grid mt-4">
        <div v-for="photo in photos" :key="photo.id">
          <PhotoCard :photo="photo">
            <template v-if="isOwner" #actions>
              <button type="button" class="ps-btn ps-btn--ghost ps-btn--sm" :disabled="removingIds.has(photo.id)" @click="removePhoto(photo)">
                <span v-if="removingIds.has(photo.id)" class="spinner-border spinner-border-sm"></span>
                <i v-else class="bi bi-bookmark-x"></i>
                {{ removingIds.has(photo.id) ? 'Removendo...' : 'Remover do álbum' }}
              </button>
            </template>
          </PhotoCard>
        </div>
      </div>

      <div v-else class="ps-empty mt-4">
        <div class="ps-empty__icon"><i class="bi bi-images"></i></div>
        <h2 class="h5 fw-bold">{{ isOwner ? 'Seu álbum ainda está vazio' : 'Este álbum ainda não tem fotos' }}</h2>
        <p v-if="isOwner" class="text-muted">Abra uma foto e use o botão <strong>Salvar</strong> para adicioná-la aqui.</p>
        <RouterLink v-if="isOwner" to="/feed" class="ps-btn ps-btn--primary mt-2"><i class="bi bi-grid-3x3-gap"></i> Ir para o Feed</RouterLink>
      </div>
    </template>
  </div>
</template>

<style scoped>
.album-hero { padding: 1.5rem 1.75rem; }
.album-owner { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--ps-muted); font-size: 0.88rem; text-decoration: none; }
.album-owner img { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; }
.album-owner:hover strong { color: var(--brand-color-light); }
</style>
