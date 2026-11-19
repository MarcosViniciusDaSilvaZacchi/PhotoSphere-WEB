<script setup>
/**
 * AdminDashboardView.vue — Números do sistema (Aula 15). Rota filha /admin/dashboard.
 *
 * Checagem de Alcançabilidade do painel:
 *  - Painel → menu do avatar → "Painel de administração" (só para administrador;
 *    o PhotoSphere não tem TheSidebar.vue). O link aponta para /admin, que redireciona.
 *  - Denúncias → aba "Denúncias" e o cartão vermelho de pendentes, aqui.
 *  - Usuários / Fotos → as abas do painel.
 *  - Revisar / Bloquear / Excluir → botões na linha (os dois últimos com confirmação;
 *    desbloquear é direto).
 *  - Filtrar / buscar → botões de filtro (Denúncias); campo com debounce (Usuários e Fotos).
 *  - Ver a foto / o perfil → miniatura ou título (Denúncias e Fotos); @usuário (Usuários).
 *
 * Se a API responder 403 (o papel mudou, ou o isAdmin foi "falsificado" no
 * localStorage), a mensagem aparece no lugar dos números.
 */

import { RouterLink } from 'vue-router'
import { getAdminDashboard } from '@/services/adminService'
import { useAsyncData } from '@/composables/useAsyncData'
import { formatCount } from '@/utils/format'

const { data: stats, error, isLoading, execute } = useAsyncData(getAdminDashboard)

const cards = [
  { key: 'users', label: 'Usuários', icon: 'bi-people' },
  { key: 'blockedUsers', label: 'Bloqueados', icon: 'bi-person-slash' },
  { key: 'photos', label: 'Fotos', icon: 'bi-images' },
  { key: 'comments', label: 'Comentários', icon: 'bi-chat' },
  { key: 'likes', label: 'Curtidas', icon: 'bi-heart' },
  { key: 'reviewedReports', label: 'Denúncias revisadas', icon: 'bi-check2-circle' },
]
</script>

<template>
  <section>
    <div class="d-flex justify-content-end mb-3">
      <button type="button" class="ps-btn ps-btn--ghost ps-btn--sm" :disabled="isLoading" @click="execute">
        <i class="bi bi-arrow-clockwise"></i> Atualizar
      </button>
    </div>

    <div v-if="isLoading" class="stats-grid">
      <div v-for="n in 7" :key="n" class="ps-skeleton" style="height: 110px"></div>
    </div>

    <div v-else-if="error" class="alert alert-danger d-flex align-items-center gap-2 border-0" role="alert">
      <i class="bi bi-shield-exclamation"></i> {{ error.message || 'Não foi possível carregar os números.' }}
    </div>

    <div v-else-if="stats" class="stats-grid">
      <RouterLink :to="{ name: 'admin-moderation' }" class="stat-card stat-card--alert">
        <i class="bi bi-flag-fill stat-card__icon"></i>
        <strong class="stat-card__value">{{ formatCount(stats.pendingReports) }}</strong>
        <span class="stat-card__label">Denúncias pendentes <i class="bi bi-arrow-right"></i></span>
      </RouterLink>

      <div v-for="card in cards" :key="card.key" class="stat-card">
        <i class="bi stat-card__icon" :class="card.icon"></i>
        <strong class="stat-card__value">{{ formatCount(stats[card.key]) }}</strong>
        <span class="stat-card__label">{{ card.label }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 1rem; }
.stat-card {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1.1rem 1.2rem;
  border: 1px solid var(--ps-border);
  border-radius: var(--ps-radius);
  background: var(--ps-surface);
  color: var(--ps-text);
  text-decoration: none;
}
.stat-card__icon { font-size: 1.3rem; color: var(--brand-color); }
.stat-card__value { font-size: 1.9rem; font-weight: 800; line-height: 1.1; }
.stat-card__label { color: var(--ps-muted); font-size: 0.85rem; }
.stat-card--alert { border-color: rgba(255, 77, 79, 0.55); background: rgba(255, 77, 79, 0.1); transition: transform 0.2s; }
.stat-card--alert:hover { transform: translateY(-2px); }
.stat-card--alert .stat-card__icon, .stat-card--alert .stat-card__label { color: #ff8a8e; }
</style>
