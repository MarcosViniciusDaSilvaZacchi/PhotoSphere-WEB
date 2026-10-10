<script setup>
/**
 * BaseInput.vue — Componente-base de entrada de dados.
 *
 * Utiliza defineModel() (Vue 3.4+) para implementar o binding bidirecional (v-model)
 * de forma nativa e limpa, eliminando a repetição manual de props (modelValue)
 * e emits ('update:modelValue').
 */

defineProps({
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  autocomplete: {
    type: String,
    default: 'off',
  },
})

const model = defineModel()
</script>

<template>
  <div class="base-input-group mb-3 text-start">
    <label
      v-if="label"
      :for="id"
      class="form-label small text-uppercase tracking-wider fw-semibold text-light mb-1"
    >
      {{ label }}
      <span v-if="required" class="text-brand ms-1">*</span>
    </label>

    <div class="input-wrapper position-relative">
      <input
        :id="id"
        v-model="model"
        :type="type"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :autocomplete="autocomplete"
        class="form-control form-control-lg bg-dark text-white border-secondary"
        :class="{ 'is-invalid': !!error }"
      />
    </div>

    <div v-if="error" class="invalid-feedback d-block mt-1 small">
      {{ error }}
    </div>
  </div>
</template>

<style scoped>
.form-control {
  font-size: 0.95rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
}

.form-control:focus {
  background-color: #121220;
  border-color: var(--brand-color, #FF6622);
  box-shadow: 0 0 0 0.25rem rgba(255, 102, 34, 0.25);
  color: #fff;
}

.invalid-feedback {
  color: #ff6b6b;
  font-weight: 500;
}

.tracking-wider {
  letter-spacing: 0.05em;
}
</style>
