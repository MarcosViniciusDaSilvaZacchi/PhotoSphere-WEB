<script setup>
/**
 * LoginView.vue — Tela de Login no PhotoSphere.
 *
 * Refatorada na Aula 06 para utilizar os componentes-base:
 * FormCard, BaseInput, BaseButton e o composable useAuth().
 */

import { reactive, ref } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import FormCard from '@/components/base/FormCard.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()
const route = useRoute()
const { login } = useAuth()

const form = reactive({
  email: '',
  password: '',
})

const isSubmitting = ref(false)
const errorMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''

  if (!form.email || !form.password) {
    errorMessage.value = 'Por favor, preencha o e-mail/usuário e a senha.'
    return
  }

  isSubmitting.value = true

  try {
    await login({
      email: form.email.trim(),
      password: form.password,
    })

    // Redireciona para rota original se interceptado, ou para a home
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
  <FormCard
    title="Entrar no PhotoSphere"
    subtitle="Acesse sua conta para gerenciar suas fotos e álbuns"
    icon="📸"
    maxWidth="460px"
  >
    <!-- Alertas -->
    <template #alerts>
      <div
        v-if="errorMessage"
        class="alert alert-danger py-2 px-3 small border-0 mb-4 d-flex align-items-center"
        role="alert"
      >
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        <span>{{ errorMessage }}</span>
      </div>

      <div
        v-if="route.query.redirect"
        class="alert alert-warning py-2 px-3 small border-0 mb-4 d-flex align-items-center"
        role="alert"
      >
        <i class="bi bi-info-circle-fill me-2"></i>
        <span>Faça login para acessar esta página restrita.</span>
      </div>
    </template>

    <!-- Formulário com componentes-base -->
    <form @submit.prevent="handleSubmit" novalidate>
      <BaseInput
        id="email"
        v-model="form.email"
        label="E-mail ou Usuário"
        placeholder="seu@email.com ou username"
        required
      />

      <BaseInput
        id="password"
        v-model="form.password"
        type="password"
        label="Senha"
        placeholder="Sua senha"
        required
      />

      <div class="mt-4">
        <BaseButton
          type="submit"
          variant="brand"
          :loading="isSubmitting"
          :fullWidth="true"
        >
          {{ isSubmitting ? 'Entrando...' : 'Entrar' }}
        </BaseButton>
      </div>
    </form>

    <!-- Rodapé -->
    <template #footer>
      <p class="small text-secondary mb-0">
        Ainda não tem uma conta?
        <RouterLink to="/register" class="text-brand fw-semibold text-decoration-none ms-1">
          Cadastre-se
        </RouterLink>
      </p>
    </template>
  </FormCard>
</template>
