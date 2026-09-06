<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '@/services/authService'

const router = useRouter()

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  fullName: '',
})

const errors = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  fullName: '',
})

const isSubmitting = ref(false)
const apiErrorMessage = ref('')

function validate() {
  // Limpa os erros anteriores
  Object.keys(errors).forEach((key) => (errors[key] = ''))

  if (!form.fullName.trim()) {
    errors.fullName = 'O nome completo é obrigatório.'
  }

  if (form.username.trim().length < 3 || form.username.trim().length > 20) {
    errors.username = 'O nome de usuário deve ter entre 3 e 20 caracteres.'
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(form.email)) {
    errors.email = 'Informe um e-mail válido.'
  }

  if (form.password.length < 6) {
    errors.password = 'A senha deve ter pelo menos 6 caracteres.'
  }

  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'As senhas não coincidem.'
  }

  return Object.values(errors).every((message) => message === '')
}

async function handleSubmit() {
  apiErrorMessage.value = ''

  if (!validate()) {
    return
  }

  isSubmitting.value = true

  try {
    const response = await register({
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
      confirmPassword: form.confirmPassword,
      fullName: form.fullName.trim(),
    })

    console.log('Conta criada:', response.data)
    router.push({ name: 'login' })
  } catch (error) {
    apiErrorMessage.value = error.message
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>Criar Conta</h1>
      <p class="auth-subtitle">Junte-se ao PhotoSphere para compartilhar suas fotos.</p>

      <form @submit.prevent="handleSubmit" novalidate>
        <div class="field">
          <label for="fullName">Nome completo</label>
          <input
            id="fullName"
            type="text"
            v-model="form.fullName"
            placeholder="Seu nome completo"
            :class="{ 'input-error': errors.fullName }"
          />
          <span v-if="errors.fullName" class="error-message">{{ errors.fullName }}</span>
        </div>

        <div class="field">
          <label for="username">Usuário</label>
          <input
            id="username"
            type="text"
            v-model="form.username"
            placeholder="ex: fotografo123"
            :class="{ 'input-error': errors.username }"
          />
          <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
        </div>

        <div class="field">
          <label for="email">E-mail</label>
          <input
            id="email"
            type="email"
            v-model="form.email"
            placeholder="seu@email.com"
            :class="{ 'input-error': errors.email }"
          />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <div class="field">
          <label for="password">Senha</label>
          <input
            id="password"
            type="password"
            v-model="form.password"
            placeholder="Pelo menos 6 caracteres"
            :class="{ 'input-error': errors.password }"
          />
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <div class="field">
          <label for="confirmPassword">Confirmar senha</label>
          <input
            id="confirmPassword"
            type="password"
            v-model="form.confirmPassword"
            placeholder="Repita sua senha"
            :class="{ 'input-error': errors.confirmPassword }"
          />
          <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
        </div>

        <p v-if="apiErrorMessage" class="api-error">{{ apiErrorMessage }}</p>

        <button type="submit" :disabled="isSubmitting" class="btn-submit">
          {{ isSubmitting ? 'Criando conta...' : 'Criar Minha Conta' }}
        </button>
      </form>

      <p class="auth-footer">
        Já tem uma conta? <RouterLink to="/login">Entrar</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: calc(100vh - 120px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background-color: #0f0f1b;
}

.auth-card {
  width: 100%;
  max-width: 460px;
  background-color: #1a1a2e;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  color: #fff;
}

h1 {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #fff;
  text-align: center;
}

.auth-subtitle {
  color: #a0a0b0;
  font-size: 0.95rem;
  margin-bottom: 2rem;
  text-align: center;
}

.field {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.25rem;
}

label {
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.4rem;
  color: #ddd;
}

input {
  background-color: #252538;
  border: 1px solid #3a3a50;
  border-radius: 6px;
  padding: 0.75rem 1rem;
  color: #fff;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

input:focus {
  border-color: #4361ee;
}

input.input-error {
  border-color: #e63946;
}

.error-message {
  color: #ff6b6b;
  font-size: 0.82rem;
  margin-top: 0.35rem;
}

.api-error {
  background-color: rgba(230, 57, 70, 0.15);
  border: 1px solid #e63946;
  color: #ff6b6b;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-bottom: 1.25rem;
  text-align: center;
}

.btn-submit {
  width: 100%;
  padding: 0.85rem;
  background-color: #4361ee;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 0.5rem;
}

.btn-submit:hover:not(:disabled) {
  background-color: #364fc7;
}

.btn-submit:disabled {
  background-color: #555570;
  cursor: not-allowed;
}

.auth-footer {
  margin-top: 1.75rem;
  text-align: center;
  font-size: 0.9rem;
  color: #a0a0b0;
}

.auth-footer a {
  color: #4cc9f0;
  text-decoration: none;
  font-weight: 500;
}

.auth-footer a:hover {
  text-decoration: underline;
}
</style>
