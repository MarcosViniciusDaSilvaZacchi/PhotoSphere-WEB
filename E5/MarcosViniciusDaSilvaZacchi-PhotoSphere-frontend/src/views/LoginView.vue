<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: '',
})

const isSubmitting = ref(false)
const errorMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''

  if (!form.email || !form.password) {
    errorMessage.value = 'Por favor, preencha o e-mail e a senha.'
    return
  }

  isSubmitting.value = true

  try {
    await authStore.login({
      email: form.email.trim(),
      password: form.password,
    })

    // Se o usuário foi redirecionado por uma rota protegida, volta para ela; senão vai para a home ('home' ou 'feed')
    const redirectPath = route.query.redirect ? decodeURIComponent(route.query.redirect) : '/'
    router.push(redirectPath)
  } catch (error) {
    errorMessage.value = error.message || 'Erro ao realizar login.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="login-page d-flex align-items-center justify-content-center py-5">
    <div class="card shadow-lg border-0 login-card text-white">
      <div class="card-body p-4 p-md-5">
        <div class="text-center mb-4">
          <div class="brand-icon mb-2">📸</div>
          <h2 class="fw-bold mb-1">Entrar no PhotoSphere</h2>
          <p class="text-secondary small">Acesse sua conta para gerenciar suas fotos e álbuns</p>
        </div>

        <!-- Alerta de erro da API ou validação -->
        <div v-if="errorMessage" class="alert alert-danger py-2 px-3 small border-0 mb-4" role="alert">
          {{ errorMessage }}
        </div>

        <!-- Alerta informativo se veio de redirecionamento protegido -->
        <div v-if="route.query.redirect" class="alert alert-warning py-2 px-3 small border-0 mb-4" role="alert">
          Faça login para acessar esta página restrita.
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="mb-3">
            <label for="email" class="form-label small text-uppercase tracking-wider fw-semibold text-light">E-mail ou Usuário</label>
            <input
              id="email"
              type="text"
              class="form-control form-control-lg bg-dark text-white border-secondary"
              placeholder="seu@email.com ou username"
              v-model="form.email"
              required
            />
          </div>

          <div class="mb-4">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <label for="password" class="form-label small text-uppercase tracking-wider fw-semibold text-light mb-0">Senha</label>
            </div>
            <input
              id="password"
              type="password"
              class="form-control form-control-lg bg-dark text-white border-secondary"
              placeholder="Sua senha"
              v-model="form.password"
              required
            />
          </div>

          <button type="submit" class="btn btn-brand btn-lg w-100 mb-3 shadow-sm" :disabled="isSubmitting">
            <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            {{ isSubmitting ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>

        <div class="text-center mt-4 pt-3 border-top border-secondary">
          <p class="small text-secondary mb-0">
            Ainda não tem uma conta?
            <RouterLink to="/register" class="text-brand fw-semibold text-decoration-none ms-1">Cadastre-se</RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: calc(100vh - 120px);
  background: radial-gradient(circle at center, #1c100a 0%, #0d0805 100%);
}

.login-card {
  width: 100%;
  max-width: 440px;
  background-color: #24140c;
  border: 1px solid rgba(255, 102, 34, 0.25) !important;
  border-radius: 1.25rem;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.6), 0 0 25px rgba(255, 102, 34, 0.08) !important;
}

.brand-icon {
  font-size: 2.5rem;
  filter: drop-shadow(0 0 8px rgba(255, 102, 34, 0.4));
}

.text-brand {
  color: #FF6622;
}

.login-card input {
  background-color: #160d08 !important;
  border: 1px solid rgba(255, 102, 34, 0.2) !important;
  color: #fff !important;
}

.login-card input:focus {
  border-color: #FF6622 !important;
  box-shadow: 0 0 0 0.25rem rgba(255, 102, 34, 0.25) !important;
}
</style>
