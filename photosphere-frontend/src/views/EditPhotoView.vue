<script setup>
/**
 * EditPhotoView.vue — Editar Foto (Aula 09).
 *
 * 1. Carrega GET /photos/:id/edit e pré-preenche o formulário.
 *    - 403 (foto de outra pessoa) e 404 (id inexistente) viram mensagens na tela,
 *      sem quebrar a aplicação.
 * 2. A imagem é OPCIONAL: se nenhuma nova for escolhida, só o texto é enviado e
 *    o arquivo atual é mantido. Ao escolher uma nova, a prévia aparece na hora
 *    (URL.createObjectURL, sem requisição).
 * 3. Validação no cliente espelha a API (título obrigatório e limites): com o
 *    título vazio nenhuma requisição sai — dá para conferir na aba Network.
 * 4. Envio em multipart/form-data via PUT /photos/:id.
 */

import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { getPhotoForEdit, updatePhoto } from '@/services/photoService'
import { getPhotoUrl } from '@/utils/media'

const route = useRoute()
const photoId = route.params.id

// Limites espelhados de config/constants.js da API
const TITLE_MAX = 100
const DESCRIPTION_MAX = 500

const form = reactive({ title: '', description: '' })
const currentImage = ref('')
const selectedFile = ref(null)
const previewUrl = ref(null)
const fileInputRef = ref(null)

const isLoading = ref(true)
const isSaving = ref(false)
const loadError = ref(null) // { icon, title, text }
const errorMessage = ref('')
const successMessage = ref('')
const errors = reactive({ title: '', description: '', image: '' })

const displayedImage = computed(() => previewUrl.value || getPhotoUrl(currentImage.value))

async function loadPhoto() {
  isLoading.value = true
  loadError.value = null
  try {
    const response = await getPhotoForEdit(photoId)
    const photo = response.data
    form.title = photo.title || ''
    form.description = photo.description || ''
    currentImage.value = photo.imageUrl
  } catch (error) {
    if (error.status === 403) {
      loadError.value = {
        icon: 'bi-shield-lock',
        title: 'Você não tem permissão para editar esta foto',
        text: 'Só quem publicou a foto pode alterá-la.',
      }
    } else if (error.status === 404) {
      loadError.value = {
        icon: 'bi-image-alt',
        title: 'Foto não encontrada',
        text: 'Ela pode ter sido excluída ou o endereço está incorreto.',
      }
    } else {
      loadError.value = {
        icon: 'bi-wifi-off',
        title: 'Não foi possível carregar a foto',
        text: error.message,
      }
    }
  } finally {
    isLoading.value = false
  }
}

function openFilePicker() {
  if (!isSaving.value) fileInputRef.value?.click()
}

function handleFileChange(event) {
  errors.image = ''
  const file = event.target.files?.[0]
  if (!file) return

  if (!/^image\/(jpe?g|png|webp)$/i.test(file.type) && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
    errors.image = 'Selecione uma imagem JPG, PNG ou WEBP.'
    return
  }

  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

function discardNewImage() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = null
  selectedFile.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

function validate() {
  errors.title = ''
  errors.description = ''
  const title = form.title.trim()

  if (!title) errors.title = 'O título da foto é obrigatório.'
  else if (title.length > TITLE_MAX) errors.title = `O título não pode exceder ${TITLE_MAX} caracteres.`

  if (form.description.trim().length > DESCRIPTION_MAX) {
    errors.description = `A descrição não pode exceder ${DESCRIPTION_MAX} caracteres.`
  }

  return !errors.title && !errors.description && !errors.image
}

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''
  if (!validate()) return // nenhuma requisição sai com o formulário inválido

  isSaving.value = true
  try {
    const formData = new FormData()
    formData.append('title', form.title.trim())
    formData.append('description', form.description.trim())
    if (selectedFile.value) {
      formData.append('image', selectedFile.value) // mesmo nome de campo do upload: 'image'
    }

    const response = await updatePhoto(photoId, formData)
    const updated = response.data
    form.title = updated.title
    form.description = updated.description || ''
    currentImage.value = updated.imageUrl
    discardNewImage()
    successMessage.value = response.message || 'Foto atualizada com sucesso!'
  } catch (error) {
    errorMessage.value = error.message || 'Não foi possível salvar as alterações.'
  } finally {
    isSaving.value = false
  }
}

onMounted(loadPhoto)
onUnmounted(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})
</script>

<template>
  <div class="ps-page edit-page">
    <RouterLink to="/my-photos" class="back-link"><i class="bi bi-arrow-left"></i> Minhas Fotos</RouterLink>

    <!-- Carregando -->
    <div v-if="isLoading" class="edit-grid">
      <div class="ps-skeleton" style="height: 380px"></div>
      <div class="ps-skeleton" style="height: 380px"></div>
    </div>

    <!-- 403 / 404 / rede -->
    <div v-else-if="loadError" class="ps-empty">
      <div class="ps-empty__icon"><i class="bi" :class="loadError.icon"></i></div>
      <h1 class="h4 fw-bold">{{ loadError.title }}</h1>
      <p class="text-muted">{{ loadError.text }}</p>
      <RouterLink to="/my-photos" class="ps-btn ps-btn--primary mt-2"><i class="bi bi-images"></i> Ir para Minhas Fotos</RouterLink>
    </div>

    <template v-else>
      <header class="ps-page-header">
        <div>
          <span class="ps-eyebrow">Edição</span>
          <h1 class="ps-title">Editar foto</h1>
          <p class="text-muted mb-0">Altere o título, a descrição ou troque a imagem.</p>
        </div>
      </header>

      <form class="edit-grid" novalidate @submit.prevent="handleSubmit">
        <!-- Coluna da imagem -->
        <section class="ps-surface image-panel">
          <div class="image-frame">
            <img :src="displayedImage" :alt="form.title" />
            <span v-if="previewUrl" class="image-badge"><i class="bi bi-stars"></i> Nova imagem (prévia)</span>
          </div>

          <div class="d-flex gap-2 mt-3 flex-wrap">
            <button type="button" class="ps-btn ps-btn--ghost ps-btn--sm" :disabled="isSaving" @click="openFilePicker">
              <i class="bi bi-arrow-repeat"></i> {{ previewUrl ? 'Escolher outra' : 'Trocar imagem' }}
            </button>
            <button v-if="previewUrl" type="button" class="ps-btn ps-btn--danger ps-btn--sm" :disabled="isSaving" @click="discardNewImage">
              <i class="bi bi-x-lg"></i> Manter a atual
            </button>
          </div>
          <input
            ref="fileInputRef"
            type="file"
            class="d-none"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            @change="handleFileChange"
          />
          <p class="small text-muted mt-2 mb-0">Opcional · JPG, PNG ou WEBP até 10MB. Sem nova imagem, a atual é mantida.</p>
          <p v-if="errors.image" class="small text-danger mt-1 mb-0">{{ errors.image }}</p>
        </section>

        <!-- Coluna do formulário -->
        <section class="ps-surface form-panel">
          <div v-if="successMessage" class="alert alert-success border-0 d-flex align-items-center gap-2 py-2" role="status">
            <i class="bi bi-check-circle-fill"></i>
            <span>{{ successMessage }}</span>
            <RouterLink :to="{ name: 'photo-detail', params: { id: photoId } }" class="ms-auto small fw-semibold">Ver foto →</RouterLink>
          </div>
          <div v-if="errorMessage" class="alert alert-danger border-0 d-flex align-items-center gap-2 py-2" role="alert">
            <i class="bi bi-exclamation-triangle-fill"></i> {{ errorMessage }}
          </div>

          <div class="mb-3">
            <div class="d-flex justify-content-between">
              <label for="editTitle" class="field-label">Título <span class="text-brand">*</span></label>
              <span class="small text-muted">{{ form.title.length }} / {{ TITLE_MAX }}</span>
            </div>
            <input
              id="editTitle"
              v-model="form.title"
              type="text"
              class="form-control form-control-lg"
              :class="{ 'is-invalid': errors.title }"
              :disabled="isSaving"
              placeholder="Dê um título para a foto"
            />
            <div v-if="errors.title" class="invalid-feedback d-block">{{ errors.title }}</div>
          </div>

          <div class="mb-4">
            <div class="d-flex justify-content-between">
              <label for="editDescription" class="field-label">Descrição</label>
              <span class="small" :class="form.description.length > DESCRIPTION_MAX ? 'text-danger fw-bold' : 'text-muted'">
                {{ form.description.length }} / {{ DESCRIPTION_MAX }}
              </span>
            </div>
            <textarea
              id="editDescription"
              v-model="form.description"
              rows="6"
              class="form-control"
              :class="{ 'is-invalid': errors.description }"
              :disabled="isSaving"
              placeholder="Conte a história por trás da imagem..."
            ></textarea>
            <div v-if="errors.description" class="invalid-feedback d-block">{{ errors.description }}</div>
          </div>

          <div class="d-flex gap-2 justify-content-end flex-wrap">
            <RouterLink to="/my-photos" class="ps-btn ps-btn--ghost">Cancelar</RouterLink>
            <button type="submit" class="ps-btn ps-btn--primary" :disabled="isSaving">
              <span v-if="isSaving" class="spinner-border spinner-border-sm"></span>
              <i v-else class="bi bi-check2"></i>
              {{ isSaving ? 'Salvando...' : 'Salvar alterações' }}
            </button>
          </div>
        </section>
      </form>
    </template>
  </div>
</template>

<style scoped>
.edit-page { max-width: 1040px; }

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 1.25rem;
  color: var(--ps-muted);
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
}
.back-link:hover { color: var(--brand-color-light); }

.edit-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  gap: 1.5rem;
  align-items: start;
}

.image-panel, .form-panel { padding: 1.25rem; }

.image-frame {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: 12px;
  background: #0a0807;
}
.image-frame img { width: 100%; height: 100%; object-fit: cover; }
.image-badge {
  position: absolute;
  left: 0.75rem;
  bottom: 0.75rem;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #fff;
  background: rgba(255, 102, 34, 0.9);
}

.field-label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ps-muted);
  margin-bottom: 0.4rem;
}

@media (max-width: 820px) {
  .edit-grid { grid-template-columns: 1fr; }
}
</style>
