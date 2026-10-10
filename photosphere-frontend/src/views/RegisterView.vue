<script setup>
/**
 * RegisterView.vue — Tela de Registro de Usuários.
 *
 * Refatorada na Aula 06 para utilizar os componentes-base:
 * FormCard, BaseInput e BaseButton, alinhando a interface com a identidade
 * visual do PhotoSphere (#FF6622) e eliminando pendências visuais da Aula 04.
 */

import { reactive, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { register } from '@/services/authService'
import FormCard from '@/components/base/FormCard.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'

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

    console.log('Conta criada com sucesso:', response.data)
    router.push({ name: 'login' })
  } catch (error) {
    apiErrorMessage.value = error.message || 'Erro ao criar conta.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <FormCard
    title="Criar Conta no PhotoSphere"
    subtitle="Junte-se à nossa comunidade de fotografia"
    icon="📸"
    maxWidth="500px"
  >
    <!-- Alertas -->
    <template #alerts>
      <div
        v-if="apiErrorMessage"
        class="alert alert-danger py-2 px-3 small border-0 mb-4 d-flex align-items-center"
        role="alert"
      >
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        <span>{{ apiErrorMessage }}</span>
      </div>
    </template>

    <!-- Formulário Refatorado com Componentes-Base -->
    <form @submit.prevent="handleSubmit" novalidate>
      <BaseInput
        id="fullName"
        v-model="form.fullName"
        label="Nome Completo"
        placeholder="Seu nome completo"
        :error="errors.fullName"
        required
      />

      <BaseInput
        id="username"
        v-model="form.username"
        label="Nome de Usuário"
        placeholder="ex: fotografo123"
        :error="errors.username"
        required
      />

      <BaseInput
        id="email"
        v-model="form.email"
        type="email"
        label="E-mail"
        placeholder="seu@email.com"
        :error="errors.email"
        required
      />

      <BaseInput
        id="password"
        v-model="form.password"
        type="password"
        label="Senha"
        placeholder="Mínimo 6 caracteres"
        :error="errors.password"
        required
      />

      <BaseInput
        id="confirmPassword"
        v-model="form.confirmPassword"
        type="password"
        label="Confirmar Senha"
        placeholder="Repita sua senha"
        :error="errors.confirmPassword"
        required
      />

      <div class="mt-4">
        <BaseButton
          type="submit"
          variant="brand"
          :loading="isSubmitting"
          :fullWidth="true"
        >
          {{ isSubmitting ? 'Criando conta...' : 'Cadastrar' }}
        </BaseButton>
      </div>
    </form>

    <!-- Rodapé -->
    <template #footer>
      <p class="small text-secondary mb-0">
        Já tem uma conta?
        <RouterLink to="/login" class="text-brand fw-semibold text-decoration-none">
          Faça login
        </RouterLink>
      </p>
    </template>
  </FormCard>
</template>
