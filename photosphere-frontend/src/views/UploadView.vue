<script setup>
/**
 * UploadView.vue — Tela de Publicação de Foto (Entidade Principal).
 *
 * Implementada na Aula 07 com:
 * - Componentes-base: FormCard, BaseInput e BaseButton
 * - Prévia instantânea de imagem 100% client-side via URL.createObjectURL
 * - Barra de progresso reativa conectada ao callback onUploadProgress do Axios
 * - Validações de limites e campos obrigatórios espelhando o backend
 */

import { ref, onUnmounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { uploadPhoto } from '@/services/photoService'
import FormCard from '@/components/base/FormCard.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()

// Estados do formulário
const title = ref('')
const description = ref('')
const selectedFile = ref(null)
const previewUrl = ref(null)

// Estados de controle e feedback
const isUploading = ref(false)
const uploadProgress = ref(0)
const errorMessage = ref('')
const successMessage = ref('')
const errors = ref({
  title: '',
  image: '',
})

// Limites declarativos
const TITLE_MAX = 100
const DESCRIPTION_MAX = 500

const fileInputRef = ref(null)

/**
 * Permite disparar a seleção de arquivo clicando em qualquer ponto da dropzone
 */
function triggerFileInput() {
  if (!isUploading.value && fileInputRef.value) {
    fileInputRef.value.click()
  }
}

/**
 * Manipula a seleção da foto e gera a prévia instantânea client-side
 */
function handleFileChange(event) {
  errors.value.image = ''
  const file = event.target.files?.[0]
  if (!file) return

  // Validação de tipo no cliente (MIME type ou extensão)
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/pjpeg', '']
  const validExt = /\.(jpe?g|png|webp)$/i
  if (!validTypes.includes(file.type.toLowerCase()) && !validExt.test(file.name)) {
    errors.value.image = 'Selecione um arquivo de imagem válido (JPG, PNG ou WEBP).'
    return
  }

  // Limpa preview anterior se existir
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }

  selectedFile.value = file
  // Prévia instantânea sem requisições HTTP adicionais
  previewUrl.value = URL.createObjectURL(file)
}

/**
 * Remove a foto selecionada e limpa a URL de memória
 */
function removeSelectedFile() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
  selectedFile.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

/**
 * Validação pré-envio
 */
function validate() {
  errors.value.title = ''
  errors.value.image = ''
  errorMessage.value = ''

  let isValid = true

  if (!title.value.trim()) {
    errors.value.title = 'O título da foto é obrigatório.'
    isValid = false
  } else if (title.value.trim().length > TITLE_MAX) {
    errors.value.title = `O título não pode exceder ${TITLE_MAX} caracteres.`
    isValid = false
  }

  if (!selectedFile.value) {
    errors.value.image = 'Por favor, selecione uma imagem para publicar.'
    isValid = false
  }

  return isValid
}

/**
 * Submissão do formulário com FormData e monitoramento de progresso
 */
async function handleSubmit() {
  if (!validate()) return

  isUploading.value = true
  uploadProgress.value = 5
  errorMessage.value = ''
  successMessage.value = ''

  const formData = new FormData()
  formData.append('title', title.value.trim())
  if (description.value.trim()) {
    formData.append('description', description.value.trim())
  }
  formData.append('image', selectedFile.value)

  // Intervalo suave para permitir visualizar e capturar a barra de progresso
  const progressTimer = setInterval(() => {
    if (uploadProgress.value < 85) {
      uploadProgress.value += 10
    }
  }, 350)

  try {
    const response = await uploadPhoto(formData, (progressEvent) => {
      if (progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        uploadProgress.value = Math.max(uploadProgress.value, percent)
      }
    })

    clearInterval(progressTimer)
    uploadProgress.value = 100
    successMessage.value = response?.message || 'Foto publicada com sucesso!'

    // Limpa o formulário para uma próxima publicação
    title.value = ''
    description.value = ''
    removeSelectedFile()
  } catch (err) {
    // Aula 09: o erro da API passa a ser exibido de verdade (antes era mascarado como sucesso)
    clearInterval(progressTimer)
    uploadProgress.value = 0
    errorMessage.value = err.message || 'Não foi possível publicar a foto.'
  } finally {
    setTimeout(() => {
      isUploading.value = false
    }, 600)
  }
}

// Liberação de memória ao destruir o componente
onUnmounted(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
})
</script>

<template>
  <FormCard
    title="Publicar Nova Foto"
    subtitle="Compartilhe suas melhores capturas com a comunidade PhotoSphere"
    icon="📸"
    maxWidth="560px"
  >
    <!-- Alertas -->
    <template #alerts>
      <div
        v-if="successMessage"
        class="alert alert-success py-2 px-3 small border-0 mb-4 d-flex align-items-center shadow-sm"
        role="alert"
      >
        <i class="bi bi-check-circle-fill me-2 fs-5"></i>
        <div>
          {{ successMessage }}
          <!-- Aula 09: atalho para gerenciar a foto recém-publicada -->
          <RouterLink to="/my-photos" class="alert-link ms-1">Ver em Minhas Fotos →</RouterLink>
        </div>
      </div>

      <div
        v-if="errorMessage"
        class="alert alert-danger py-2 px-3 small border-0 mb-4 d-flex align-items-center shadow-sm"
        role="alert"
      >
        <i class="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
        <div>{{ errorMessage }}</div>
      </div>
    </template>

    <!-- Formulário Multipart -->
    <form @submit.prevent="handleSubmit" novalidate>
      <!-- Campo Título -->
      <BaseInput
        id="photoTitle"
        v-model="title"
        label="Título da Foto"
        placeholder="Ex: Pôr do sol na praia de Copacabana"
        :error="errors.title"
        :disabled="isUploading"
        required
      />

      <!-- Campo Descrição com Contador -->
      <div class="mb-3 text-start">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <label for="photoDescription" class="form-label small text-uppercase tracking-wider fw-semibold text-light mb-0">
            Descrição (Opcional)
          </label>
          <span
            class="small text-secondary"
            :class="{ 'text-danger fw-bold': description.length > DESCRIPTION_MAX }"
          >
            {{ description.length }} / {{ DESCRIPTION_MAX }}
          </span>
        </div>
        <textarea
          id="photoDescription"
          v-model="description"
          rows="3"
          placeholder="Conte a história por trás desta imagem, lente usada, local..."
          class="form-control bg-dark text-white border-secondary"
          :maxlength="DESCRIPTION_MAX"
          :disabled="isUploading"
        ></textarea>
      </div>

      <!-- Seleção de Imagem & Prévia Instantânea -->
      <div class="mb-4 text-start">
        <label class="form-label small text-uppercase tracking-wider fw-semibold text-light mb-2">
          Arquivo da Foto <span class="text-brand">*</span>
        </label>

        <!-- Área de Prévia quando há imagem selecionada -->
        <div v-if="previewUrl" class="text-center mb-3 p-3 rounded-3 preview-box">
          <img
            :src="previewUrl"
            alt="Prévia da foto"
            class="thumbnail-preview mb-2"
          />
          <div class="d-flex justify-content-center gap-2 mt-2">
            <span class="badge bg-warning text-dark px-2 py-1 align-self-center">
              <i class="bi bi-eye me-1"></i> Prévia local instantânea
            </span>
            <button
              type="button"
              class="btn btn-outline-danger btn-sm rounded-pill px-3"
              @click="removeSelectedFile"
              :disabled="isUploading"
            >
              <i class="bi bi-trash me-1"></i> Remover foto
            </button>
          </div>
        </div>

        <!-- Seletor de Arquivo Estilizado quando nenhuma imagem foi selecionada -->
        <div
          v-else
          class="upload-dropzone text-center p-4 rounded-3 border-dashed cursor-pointer"
          @click="triggerFileInput"
        >
          <i class="bi bi-cloud-arrow-up display-5 text-brand mb-2 d-block"></i>
          <p class="small text-secondary mb-2">
            Clique aqui ou no botão para escolher uma foto do seu computador
          </p>
          <span class="btn btn-outline-brand btn-sm rounded-pill px-4">
            <i class="bi bi-folder2-open me-1"></i> Selecionar Imagem
          </span>
          <input
            id="photoFile"
            ref="fileInputRef"
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            class="d-none"
            :disabled="isUploading"
            @change="handleFileChange"
          />
          <p class="text-muted extra-small mt-2 mb-0">Formatos aceitos: JPG, PNG, WEBP (Máx. 10MB)</p>
        </div>

        <div v-if="errors.image" class="invalid-feedback d-block mt-1 small">
          {{ errors.image }}
        </div>
      </div>

      <!-- Barra de Progresso durante Upload -->
      <div v-if="isUploading" class="mb-4">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <span class="small fw-semibold text-light">Enviando foto...</span>
          <span class="small fw-bold text-brand">{{ uploadProgress }}%</span>
        </div>
        <div class="progress bg-dark border border-secondary" style="height: 12px; border-radius: 6px;">
          <div
            class="progress-bar progress-bar-striped progress-bar-animated progress-bar-brand"
            role="progressbar"
            :style="{ width: `${uploadProgress}%` }"
            :aria-valuenow="uploadProgress"
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      </div>

      <!-- Botão de Publicação -->
      <div class="mt-4">
        <BaseButton
          type="submit"
          variant="brand"
          :loading="isUploading"
          :disabled="isUploading"
          :fullWidth="true"
        >
          <i class="bi bi-send-fill me-2" v-if="!isUploading"></i>
          {{ isUploading ? `Publicando (${uploadProgress}%)...` : 'Publicar Foto' }}
        </BaseButton>
      </div>
    </form>
  </FormCard>
</template>

<style scoped>
.preview-box {
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 102, 34, 0.25);
}

.border-dashed {
  border: 2px dashed rgba(255, 102, 34, 0.35);
  background: rgba(255, 102, 34, 0.03);
  transition: all 0.2s ease-in-out;
}

.border-dashed:hover {
  border-color: var(--brand-color, #FF6622);
  background: rgba(255, 102, 34, 0.08);
}

.cursor-pointer {
  cursor: pointer;
}

.extra-small {
  font-size: 0.75rem;
}

textarea.form-control:focus {
  background-color: #121220;
  border-color: var(--brand-color, #FF6622);
  box-shadow: 0 0 0 0.25rem rgba(255, 102, 34, 0.25);
  color: #fff;
}
</style>
