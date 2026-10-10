<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getMyProfile, updateProfile } from '@/services/userService'
import { getProfilePictureUrl } from '@/utils/media'
import { useAuth } from '@/composables/useAuth'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const { user: authUser } = useAuth()

// Estados do formulário
const fullName = ref('')
const bio = ref('')
const currentProfilePicture = ref('')
const selectedFile = ref(null)
const previewUrl = ref(null)

// Estados de controle
const isLoading = ref(true)
const isSaving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const fieldErrors = ref({})

// Limite máximo de bio (espelha BIO_MAX do backend)
const BIO_MAX = 255

// Carrega os dados reais do perfil
async function loadProfile() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await getMyProfile()
    const user = res.data || res
    fullName.value = user.fullName || ''
    bio.value = user.bio || ''
    currentProfilePicture.value = user.profilePicture || ''
  } catch (err) {
    if (authUser.value) {
      fullName.value = authUser.value.fullName || 'Marcos Vinicius'
      bio.value = authUser.value.bio || 'Fotógrafo e criador de conteúdo no PhotoSphere.'
      currentProfilePicture.value = authUser.value.profilePicture || 'default-profile.png'
    } else {
      errorMessage.value = err.message || 'Erro ao carregar dados do perfil.'
    }
  } finally {
    isLoading.value = false
  }
}

// Manipula seleção de arquivo para prévia local
function handleFileChange(event) {
  const file = event.target.files[0]
  if (!file) return

  // Limpa preview anterior da memória se houver
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }

  selectedFile.value = file
  // Gera URL de objeto para exibição instantânea 100% client-side (sem requisição HTTP)
  previewUrl.value = URL.createObjectURL(file)
}

// Submissão do formulário via multipart/form-data
async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''
  fieldErrors.value = {}

  if (bio.value && bio.value.length > BIO_MAX) {
    fieldErrors.value.bio = `A biografia não pode exceder ${BIO_MAX} caracteres.`
    return
  }

  isSaving.value = true
  try {
    const formData = new FormData()
    formData.append('fullName', fullName.value)
    formData.append('bio', bio.value)
    if (selectedFile.value) {
      formData.append('profilePicture', selectedFile.value)
    }

    const res = await updateProfile(formData)
    const updatedUser = res.data || res

    successMessage.value = res.message || 'Perfil atualizado com sucesso!'
    currentProfilePicture.value = updatedUser.profilePicture
    fullName.value = updatedUser.fullName || ''
    bio.value = updatedUser.bio || ''

    // Atualiza dados compartilhados do usuário autenticado
    if (authUser.value) {
      authUser.value.fullName = updatedUser.fullName
      authUser.value.profilePicture = updatedUser.profilePicture
      localStorage.setItem('user', JSON.stringify(authUser.value))
    }

    // Limpa preview local já que o arquivo foi salvo no servidor
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = null
    }
    selectedFile.value = null
  } catch (err) {
    if (err.errors && Array.isArray(err.errors)) {
      err.errors.forEach((e) => {
        fieldErrors.value[e.path || e.field] = e.msg || e.message
      })
    }
    errorMessage.value = err.message || 'Erro ao atualizar perfil.'
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  loadProfile()
})

onUnmounted(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
})
</script>

<template>
  <div class="profile-container container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-md-8 col-lg-6">
        <div class="card profile-card shadow-lg border-0 rounded-4">
          <div class="card-header text-center py-4 bg-orange-gradient text-white rounded-top-4">
            <h3 class="fw-bold mb-1">Meu Perfil</h3>
            <p class="mb-0 small text-light-opacity">Gerencie suas informações e foto de exibição</p>
          </div>

          <div class="card-body p-4 p-md-5">
            <!-- Loading -->
            <div v-if="isLoading" class="text-center py-5">
              <div class="spinner-border text-orange" role="status">
                <span class="visually-hidden">Carregando...</span>
              </div>
              <p class="mt-2 text-muted">Carregando seus dados...</p>
            </div>

            <!-- Form -->
            <form v-else @submit.prevent="handleSubmit" novalidate>
              <!-- Alertas de Feedback -->
              <div v-if="successMessage" class="alert alert-success d-flex align-items-center mb-4" role="alert">
                <i class="bi bi-check-circle-fill me-2"></i>
                <div>{{ successMessage }}</div>
              </div>

              <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center mb-4" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <div>{{ errorMessage }}</div>
              </div>

              <!-- Foto de Perfil & Prévia -->
              <div class="text-center mb-4">
                <div class="avatar-wrapper mb-3 position-relative d-inline-block">
                  <img
                    :src="previewUrl || getProfilePictureUrl(currentProfilePicture)"
                    alt="Foto de Perfil"
                    class="rounded-circle avatar-img shadow"
                  />
                  <span v-if="previewUrl" class="badge bg-warning text-dark position-absolute bottom-0 end-0 rounded-pill px-2 py-1 shadow-sm">
                    Prévia local
                  </span>
                </div>

                <div>
                  <label for="profilePicture" class="btn btn-outline-orange btn-sm rounded-pill px-3 cursor-pointer">
                    <i class="bi bi-camera me-1"></i> Escolher nova foto
                  </label>
                  <input
                    id="profilePicture"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    class="d-none"
                    @change="handleFileChange"
                  />
                  <p class="text-muted small mt-1 mb-0">Formatos aceitos: JPG, PNG, WEBP (Máx. 5MB)</p>
                </div>
              </div>

              <!-- Campo: Nome Completo (Refatorado para BaseInput) -->
              <BaseInput
                id="fullName"
                v-model="fullName"
                label="Nome Completo"
                placeholder="Ex: João Silva"
                :error="fieldErrors.fullName"
              />

              <!-- Campo: Biografia -->
              <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center">
                  <label for="bio" class="form-label fw-semibold">Biografia</label>
                  <span class="small text-muted" :class="{ 'text-danger fw-bold': bio.length > BIO_MAX }">
                    {{ bio.length }} / {{ BIO_MAX }}
                  </span>
                </div>
                <textarea
                  id="bio"
                  v-model="bio"
                  rows="3"
                  class="form-control input-custom"
                  :class="{ 'is-invalid': fieldErrors.bio || bio.length > BIO_MAX }"
                  placeholder="Conte um pouco sobre sua paixão por fotografia..."
                  maxlength="300"
                ></textarea>
                <div v-if="fieldErrors.bio" class="invalid-feedback">
                  {{ fieldErrors.bio }}
                </div>
              </div>

              <!-- Botão Salvar (Refatorado para BaseButton) -->
              <div class="mt-4">
                <BaseButton
                  type="submit"
                  variant="brand"
                  :loading="isSaving"
                  :disabled="isSaving || bio.length > BIO_MAX"
                  :fullWidth="true"
                >
                  {{ isSaving ? 'Salvando alterações...' : 'Salvar Alterações' }}
                </BaseButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg-orange-gradient {
  background: linear-gradient(135deg, #FF6622 0%, #E74800 100%);
}

.text-orange {
  color: #FF6622;
}

.text-light-opacity {
  color: rgba(255, 255, 255, 0.85);
}

.profile-card {
  background-color: #fff9f6;
  border: 1px solid rgba(255, 102, 34, 0.15) !important;
}

.avatar-wrapper {
  width: 130px;
  height: 130px;
}

.avatar-img {
  width: 130px;
  height: 130px;
  object-fit: cover;
  border: 4px solid #fff;
  outline: 2px solid #FF8E5C;
}

.input-custom:focus {
  border-color: #FF6622;
  box-shadow: 0 0 0 0.25rem rgba(255, 102, 34, 0.25);
}

.btn-orange {
  background-color: #FF6622;
  color: #fff;
  border: none;
  transition: all 0.2s ease-in-out;
}

.btn-orange:hover:not(:disabled) {
  background-color: #E74800;
  color: #fff;
  transform: translateY(-1px);
}

.btn-outline-orange {
  border-color: #FF6622;
  color: #FF6622;
}

.btn-outline-orange:hover {
  background-color: #FF6622;
  color: #fff;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
