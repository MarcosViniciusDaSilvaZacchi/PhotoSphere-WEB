<script setup>
/**
 * AdminLayout.vue — Moldura do painel de administração (Aula 15).
 *
 * As quatro telas do painel são rotas FILHAS de /admin e aparecem no <router-view />
 * daqui de baixo, sempre com o mesmo título e as mesmas abas por cima.
 * active-class="active": a aba da tela atual fica destacada (classe do Bootstrap).
 */

import { RouterLink, RouterView } from 'vue-router'

const tabs = [
  { name: 'admin-dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
  { name: 'admin-moderation', label: 'Denúncias', icon: 'bi-flag' },
  { name: 'admin-users', label: 'Usuários', icon: 'bi-people' },
  { name: 'admin-photos', label: 'Fotos', icon: 'bi-images' },
]
</script>

<template>
  <div class="ps-page">
    <header class="ps-page-header mb-3">
      <div>
        <span class="ps-eyebrow">Administração</span>
        <h1 class="ps-title"><i class="bi bi-shield-lock text-brand"></i> Painel de administração</h1>
      </div>
    </header>

    <nav class="admin-tabs nav nav-pills mb-4" aria-label="Seções do painel de administração">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.name"
        :to="{ name: tab.name }"
        class="nav-link"
        active-class="active"
      >
        <i class="bi" :class="tab.icon"></i> {{ tab.label }}
      </RouterLink>
    </nav>

    <RouterView />
  </div>
</template>

<style scoped>
.admin-tabs { gap: 0.35rem; flex-wrap: wrap; }
.admin-tabs .nav-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border-radius: 999px;
  color: var(--ps-muted);
  font-weight: 600;
  font-size: 0.9rem;
  border: 1px solid var(--ps-border);
  background: var(--ps-surface);
}
.admin-tabs .nav-link:hover { color: var(--ps-text); }
.admin-tabs .nav-link.active { color: #fff; background: var(--brand-color); border-color: var(--brand-color); }
</style>
