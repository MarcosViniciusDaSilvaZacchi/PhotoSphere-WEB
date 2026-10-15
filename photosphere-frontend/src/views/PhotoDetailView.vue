<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPhotoById } from '@/services/photoService'
import { getPhotoUrl, getProfilePictureUrl } from '@/utils/media'

const route = useRoute()
const router = useRouter()

const photo = ref(null)
const isOwner = ref(false)
const loading = ref(true)
const errorMessage = ref('')

async function fetchPhotoDetails(id) {
  loading.value = true
  errorMessage.value = ''
  photo.value = null

  try {
    const response = await getPhotoById(id)
    const data = response.data || {}
    photo.value = data
    isOwner.value = !!data.isOwner
  } catch (error) {
    if (error.response?.status === 404) {
      errorMessage.value = 'Foto não encontrada. O item pode ter sido removido.'
    } else {
      errorMessage.value = error.message || 'Erro ao carregar detalhes da foto.'
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPhotoDetails(route.params.id)
})

watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchPhotoDetails(newId)
  }
})

function goBack() {
  router.back()
}
</script>

<template>
  <div class="photo-detail-view container py-4">
    <!-- Botão de Voltar -->
    <button @click="goBack" class="btn btn-outline-secondary btn-sm mb-4">
      <i class="bi bi-arrow-left me-1"></i> Voltar
    </button>

    <!-- State: Carregando -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-orange" role="status" style="width: 3rem; height: 3rem;"></div>
      <p class="text-muted mt-3">Carregando imagem em alta resolução...</p>
    </div>

    <!-- State: Erro (ex: 404 ID Inexistente) -->
    <div v-else-if="errorMessage" class="card bg-dark border-danger text-center p-5 my-4 shadow">
      <i class="bi bi-exclamation-octagon text-danger display-1 mb-3"></i>
      <h3 class="text-white">{{ errorMessage }}</h3>
      <p class="text-muted">Verifique o endereço digitado ou navegue pelo feed.</p>
      <div class="mt-3">
        <RouterLink to="/feed" class="btn btn-brand">
          <i class="bi bi-grid-3x3-gap-fill me-1"></i> Ir para o Feed
        </RouterLink>
      </div>
    </div>

    <!-- State: Sucesso (Exibição da Imagem em Resolução Real — Grupo B) -->
    <div v-else-if="photo" class="card bg-dark border-secondary overflow-hidden shadow-lg">
      <!-- Imagem em Resolução Real -->
      <div class="photo-container text-center bg-black position-relative p-2">
        <img
          :src="getPhotoUrl(photo.imageUrl)"
          :alt="photo.title"
          class="img-fluid photo-full-res"
        />

        <!-- Badge indicando Grupo B (Imagem estática sem player) -->
        <div v-if="isOwner" class="position-absolute top-0 end-0 m-3">
          <span class="badge bg-warning text-dark px-3 py-2 fw-bold shadow">
            <i class="bi bi-star-fill me-1"></i> Você é o autor
          </span>
        </div>
      </div>

      <!-- Detalhes e Metadados da Fotografia -->
      <div class="card-body p-4 text-white">
        <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 border-bottom border-secondary pb-3 mb-3">
          <div>
            <h2 class="fw-bold mb-1">{{ photo.title }}</h2>
            <p v-if="photo.description" class="text-light mb-0 fs-5">
              {{ photo.description }}
            </p>
            <p v-else class="text-muted fst-italic mb-0">Sem descrição informada.</p>
          </div>

          <!-- Métricas da Foto -->
          <div class="d-flex gap-4 bg-black px-4 py-2 rounded-pill border border-secondary">
            <div class="text-center">
              <span class="d-block text-orange fw-bold fs-5">{{ photo.viewsCount || 0 }}</span>
              <span class="small text-muted"><i class="bi bi-eye me-1"></i>Visualizações</span>
            </div>
            <div class="border-end border-secondary"></div>
            <div class="text-center">
              <span class="d-block text-orange fw-bold fs-5">{{ photo.likesCount || 0 }}</span>
              <span class="small text-muted"><i class="bi bi-heart me-1"></i>Curtidas</span>
            </div>
          </div>
        </div>

        <!-- Informações do Autor -->
        <div class="d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center gap-3">
            <img
              :src="getProfilePictureUrl(photo.author?.profilePicture)"
              :alt="photo.author?.username || 'Autor'"
              class="rounded-circle photo-author-avatar"
            />
            <div>
              <h6 class="mb-0 text-white fw-bold">
                {{ photo.author?.fullName || photo.author?.username }}
              </h6>
              <span class="small text-muted">@{{ photo.author?.username }}</span>
            </div>
          </div>

          <span class="small text-muted">
            <i class="bi bi-calendar3 me-1"></i>
            {{ new Date(photo.createdAt).toLocaleDateString('pt-BR') }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.photo-detail-view {
  max-width: 960px;
}

.text-orange {
  color: #FF6622;
}

.photo-container {
  min-height: 300px;
  max-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-full-res {
  max-height: 68vh;
  width: auto;
  object-fit: contain;
  border-radius: 4px;
}

.photo-author-avatar {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border: 2px solid #FF6622;
}

.btn-brand {
  background-color: #FF6622;
  color: #fff;
  border: none;
  font-weight: 600;

  transition: background-color 0.2s ease;
}

.btn-brand:hover {
  background-color: #E74800;
  color: #fff;
}
</style>
