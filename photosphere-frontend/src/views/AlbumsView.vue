<script setup>
/**
 * AlbumsView.vue — Meus Álbuns (Aula 13). A "Minhas Coleções" do roteiro.
 *
 * Checagem de Alcançabilidade:
 *  - Meus Álbuns → item "Meus Álbuns" no menu do avatar (o PhotoSphere não tem
 *    TheSidebar.vue; a navegação fica na AppNavbar). Rota /albums, requiresAuth.
 *  - Criar / excluir → botões nesta tela (modal / confirmação).
 *  - Detalhe do álbum → clique no cartão.
 *  - Salvar uma foto → botão "Salvar" no Detalhe da foto (visitante → login → volta).
 *  - Remover uma foto do álbum → botão em cada card do detalhe (só para a dona).
 *  - Busca → barra da Navbar (Enter) e item "Explorar" da Navbar.
 *
 * Lacuna conhecida (decisão de escopo): o álbum público de OUTRA pessoa só é
 * alcançável por link — nenhuma tela lista os álbuns públicos de alguém.
 *
 * - useAsyncData com initialData: [];
 * - dois controles de modal: isCreating e albumToDelete (o álbum escolhido é ao
 *   mesmo tempo o interruptor do modal e o dado que ele mostra);
 * - o álbum novo entra no TOPO, num array novo;
 * - excluir ESPERA a API (pessimista): se falhar, o modal continua aberto e o
 *   toast de erro é do interceptor; no sucesso, toast verde.
 */

import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { getMyAlbums, deleteAlbum } from '@/services/albumService'
import { useAsyncData } from '@/composables/useAsyncData'
import { useToast } from '@/composables/useToast'
import { pluralize } from '@/utils/format'
import CreateAlbumModal from '@/components/CreateAlbumModal.vue'
import BaseModal from '@/components/base/BaseModal.vue'

const toast = useToast()
const { data: albums, error, isLoading } = useAsyncData(getMyAlbums, { initialData: [] })

const isCreating = ref(false)
const albumToDelete = ref(null)
const isDeleting = ref(false)
const isDeleteOpen = computed({
  get: () => albumToDelete.value !== null,
  set: (value) => {
    if (!value) albumToDelete.value = null
  },
})

function handleCreated(album) {
  albums.value = [album, ...albums.value]
  toast.success(`Álbum "${album.title}" criado.`)
}

async function confirmDelete() {
  if (!albumToDelete.value || isDeleting.value) return
  isDeleting.value = true
  try {
    const removed = albumToDelete.value
    await deleteAlbum(removed.id)
    albums.value = albums.value.filter((album) => album.id !== removed.id)
    toast.success(`Álbum "${removed.title}" excluído.`)
    albumToDelete.value = null
  } catch {
    // toast de erro do interceptor; o modal continua aberto
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div class="ps-page">
    <header class="ps-page-header">
      <div>
        <span class="ps-eyebrow">Coleções</span>
        <h1 class="ps-title">Meus Álbuns</h1>
        <p class="text-muted mb-0">Organize suas fotos favoritas em álbuns públicos ou privados.</p>
      </div>
      <button type="button" class="ps-btn ps-btn--primary" @click="isCreating = true">
        <i class="bi bi-plus-lg"></i> Novo álbum
      </button>
    </header>

    <div v-if="isLoading" class="album-grid">
      <div v-for="n in 3" :key="n" class="ps-skeleton" style="height: 150px"></div>
    </div>

    <div v-else-if="error" class="alert alert-danger d-flex align-items-center gap-2 border-0" role="alert">
      <i class="bi bi-exclamation-triangle-fill"></i> {{ error.message || 'Não foi possível carregar seus álbuns.' }}
    </div>

    <div v-else-if="albums.length" class="album-grid">
      <article v-for="album in albums" :key="album.id" class="album-card ps-surface position-relative">
        <div class="album-card__icon"><i class="bi bi-collection"></i></div>
        <div class="album-card__body">
          <h2 class="album-card__title">
            <!-- stretched-link: o cartão inteiro vira o link para o detalhe -->
            <RouterLink :to="{ name: 'album-detail', params: { id: album.id } }" class="stretched-link">
              {{ album.title }}
            </RouterLink>
          </h2>
          <p class="album-card__meta">
            <span class="album-badge" :class="album.isPublic ? 'album-badge--public' : 'album-badge--private'">
              <i class="bi" :class="album.isPublic ? 'bi-globe2' : 'bi-lock-fill'"></i>
              {{ album.isPublic ? 'Pública' : 'Privada' }}
            </span>
            <span>{{ pluralize(album.photosCount, 'foto') }}</span>
          </p>
          <p v-if="album.description" class="album-card__desc">{{ album.description }}</p>
        </div>
        <!-- position-relative + z-index: o botão fica POR CIMA do link esticado -->
        <button type="button" class="ps-btn ps-btn--danger ps-btn--sm album-card__delete" @click="albumToDelete = album">
          <i class="bi bi-trash3"></i> Excluir
        </button>
      </article>
    </div>

    <div v-else class="ps-empty">
      <div class="ps-empty__icon"><i class="bi bi-collection"></i></div>
      <h2 class="h5 fw-bold">Você ainda não tem álbuns</h2>
      <p class="text-muted">Clique em <strong>Novo álbum</strong> para criar o primeiro. Depois, use o botão <strong>Salvar</strong> na página de uma foto para guardá-la aqui.</p>
    </div>

    <CreateAlbumModal v-if="isCreating" v-model:open="isCreating" @created="handleCreated" />

    <BaseModal v-model="isDeleteOpen" title="Excluir este álbum?" icon="bi-trash3" variant="danger" :persistent="isDeleting">
      <p class="mb-0">
        O álbum <strong class="text-white">"{{ albumToDelete?.title }}"</strong> será excluído.
        As fotos continuam publicadas — só deixam de estar neste álbum.
      </p>
      <template #footer="{ close }">
        <button type="button" class="ps-btn ps-btn--ghost" :disabled="isDeleting" @click="close">Cancelar</button>
        <button type="button" class="ps-btn ps-btn--danger" :disabled="isDeleting" @click="confirmDelete">
          <span v-if="isDeleting" class="spinner-border spinner-border-sm"></span>
          <i v-else class="bi bi-trash3"></i>
          {{ isDeleting ? 'Excluindo...' : 'Excluir álbum' }}
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.album-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
.album-card { display: flex; gap: 1rem; padding: 1.1rem; align-items: flex-start; transition: border-color 0.2s, transform 0.2s; }
.album-card:hover { border-color: rgba(255, 102, 34, 0.45); transform: translateY(-2px); }
.album-card__icon {
  width: 48px; height: 48px; flex-shrink: 0; display: grid; place-items: center;
  border-radius: 14px; font-size: 1.3rem; color: var(--brand-color); background: rgba(255, 102, 34, 0.12);
}
.album-card__body { flex: 1; min-width: 0; }
.album-card__title { font-size: 1.02rem; font-weight: 700; margin: 0 0 0.35rem; }
.album-card__title a { color: var(--ps-text); text-decoration: none; }
.album-card__meta { display: flex; flex-wrap: wrap; align-items: center; gap: 0.6rem; margin: 0; color: var(--ps-muted); font-size: 0.82rem; }
.album-card__desc { margin: 0.5rem 0 0; color: var(--ps-muted); font-size: 0.85rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.album-card__delete { position: relative; z-index: 2; }
</style>
