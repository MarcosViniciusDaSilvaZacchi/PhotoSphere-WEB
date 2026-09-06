<script setup>
import { ref, onMounted } from 'vue'
import { getApiStatus } from '@/services/systemService'
import { search } from '@/services/searchService'

import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

// ref() cria uma variável reativa — quando muda, o Vue atualiza a tela automaticamente
const apiStatus = ref(null)   // null = ainda não buscou
const loading   = ref(true)   // true = carregando
const error     = ref(null)   // null = sem erro

const authStore = useAuthStore()

// onMounted() executa assim que o componente aparece na tela
onMounted(async () => {
  // Verifica status da API via systemService
  try {
    const response = await getApiStatus()
    apiStatus.value = response.data.status // 'online'
  } catch (err) {
    error.value = 'Não foi possível conectar à API.'
    console.error('Erro ao consultar a API:', err.message)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="home">

    <!-- Hero Section -->
    <section class="hero position-relative overflow-hidden">
      <div class="hero-bg-overlay"></div>
      <div class="hero-content position-relative z-1 text-center">
        <img src="@/assets/logo.jpg" alt="PhotoSphere Logo" class="hero__logo mb-3 rounded shadow" />
        <h1 class="hero__title">PhotoSphere</h1>
        <p class="hero__subtitle">
          Compartilhe seus momentos. Explore o mundo através das fotos.
        </p>

      <!-- Badge de status da API -->
      <div class="api-status">
        <span class="api-status__label">Status da API:</span>

        <span v-if="loading" class="api-status__badge api-status__badge--loading">
          ⏳ verificando...
        </span>

        <span v-else-if="error" class="api-status__badge api-status__badge--error">
          ❌ offline
        </span>

        <span v-else class="api-status__badge api-status__badge--online">
          ✅ {{ apiStatus }}
        </span>
      </div>

      <div class="hero__actions">
        <RouterLink to="/register" class="btn btn--primary">Criar conta</RouterLink>
        <RouterLink to="/explore"  class="btn btn--secondary">Explorar fotos</RouterLink>
      </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
.home {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.hero {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 3.5rem 2rem;
  border-radius: 1.5rem;
  background-image: url('@/assets/fundo.jpg');
  background-size: cover;
  background-position: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.hero-bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(4px);
}

.hero__logo {
  width: 90px;
  height: 90px;
  object-fit: cover;
  border: 3px solid #FF6622;
}

.hero__title {
  font-size: 3rem;
  font-weight: 800;
  color: #1f120c;
}

.hero__subtitle {
  font-size: 1.15rem;
  color: #555;
  max-width: 480px;
}

/* Badge de status da API */
.api-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 2rem;
  padding: 0.4rem 1rem;
  font-size: 0.9rem;
}

.api-status__label {
  color: #666;
}

.api-status__badge {
  font-weight: 600;
  border-radius: 1rem;
  padding: 0.1rem 0.6rem;
}

.api-status__badge--online  { background: #d4edda; color: #155724; }
.api-status__badge--error   { background: #f8d7da; color: #721c24; }
.api-status__badge--loading { background: #fff3cd; color: #856404; }

/* Botões */
.hero__actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.75rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: opacity 0.2s;
}

.btn:hover { opacity: 0.85; }

.btn--primary   { background: #1a1a2e; color: #fff; }
.btn--secondary { background: #fff; color: #1a1a2e; border: 2px solid #1a1a2e; }
</style>
