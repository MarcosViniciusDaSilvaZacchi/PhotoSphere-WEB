<script setup>
/**
 * FormCard.vue — Componente-base de cartão de formulário.
 *
 * Envolve os formulários do sistema em um layout responsivo, consistente,
 * com identidade visual padronizada, suporte a slots para cabeçalho, alertas,
 * corpo e rodapé.
 */

defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '📸',
  },
  maxWidth: {
    type: String,
    default: '480px',
  },
})
</script>

<template>
  <div class="form-card-wrapper d-flex align-items-center justify-content-center py-5">
    <div
      class="card form-card shadow-lg border-0 text-white"
      :style="{ maxWidth: maxWidth, width: '100%' }"
    >
      <div class="card-body p-4 p-md-5">
        <!-- Cabeçalho do Card -->
        <slot name="header">
          <div class="text-center mb-4">
            <div v-if="icon" class="brand-icon mb-2">{{ icon }}</div>
            <h2 v-if="title" class="fw-bold mb-1 title-text">{{ title }}</h2>
            <p v-if="subtitle" class="text-secondary small mb-0">{{ subtitle }}</p>
          </div>
        </slot>

        <!-- Alertas e Feedback -->
        <slot name="alerts" />

        <!-- Conteúdo Principal (Formulário) -->
        <slot />

        <!-- Rodapé do Card -->
        <div v-if="$slots.footer" class="text-center mt-4 pt-3 border-top border-secondary card-footer-custom">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-card-wrapper {
  min-height: calc(100vh - 180px);
  width: 100%;
}

.form-card {
  background: #18141d;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.brand-icon {
  font-size: 2.25rem;
}

.title-text {
  font-size: 1.6rem;
  letter-spacing: -0.02em;
}

.card-footer-custom {
  border-color: rgba(255, 255, 255, 0.1) !important;
}
</style>
