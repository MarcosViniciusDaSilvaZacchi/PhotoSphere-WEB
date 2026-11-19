<script setup>
/**
 * AdminModerationView.vue — Denúncias (Aula 15). Rota filha /admin/moderation.
 *
 * - statusFilter começa em 'pending'; o usePaginatedList lê statusFilter.value na
 *   receita e recomeça sozinho quando ele muda ({ watch: statusFilter }).
 *   undefined no tamanho de página = o padrão (PAGE_SIZE).
 * - O motivo chega como CHAVE (spam) e vira RÓTULO (Spam ou golpes) pelo REPORT_REASONS.
 * - "Marcar como revisada" ESPERA a API (sem runOptimistic): a ação do administrador
 *   é registro de moderação — a tela só mostra "revisada" quando o servidor confirmou.
 *   Cerca por linha (busyIds). O toast de erro é do interceptor.
 *
 * Limitação conhecida (não resolvida — fica para a Aula 18, com paginação por cursor):
 * paginação por offset "pula" itens se a lista muda entre uma página e a próxima.
 */

import { ref, reactive } from 'vue'
import { RouterLink } from 'vue-router'
import { getAdminReports, reviewAdminReport } from '@/services/adminService'
import { usePaginatedList } from '@/composables/usePaginatedList'
import { useToast } from '@/composables/useToast'
import { REPORT_FILTERS, REPORT_REASONS } from '@/config/constants'
import { getPhotoUrl } from '@/utils/media'
import { formatDateTime, formatRelativeTime } from '@/utils/format'

const toast = useToast()
const statusFilter = ref('pending')

const { items: reports, hasMore, isLoading, isLoadingMore, error, loadMore, reload } = usePaginatedList(
  (page, limit) => getAdminReports(statusFilter.value, page, limit),
  undefined,
  { watch: statusFilter }
)

const reasonLabels = Object.fromEntries(REPORT_REASONS.map((reason) => [reason.value, reason.label]))
const busyIds = reactive(new Set())

async function markAsReviewed(report) {
  if (busyIds.has(report.id)) return
  busyIds.add(report.id)
  try {
    const response = await reviewAdminReport(report.id)
    report.status = response.data.status
    report.reviewedAt = response.data.reviewedAt
    toast.success(response.message)
  } catch {
    // o toast de erro é do interceptor; a linha continua pendente
  } finally {
    busyIds.delete(report.id)
  }
}
</script>

<template>
  <section>
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
      <div class="btn-group" role="group" aria-label="Filtrar denúncias por situação">
        <button
          v-for="filter in REPORT_FILTERS"
          :key="filter.value"
          type="button"
          class="ps-btn ps-btn--sm filter-btn"
          :class="statusFilter === filter.value ? 'ps-btn--primary' : 'ps-btn--ghost'"
          :aria-pressed="statusFilter === filter.value"
          @click="statusFilter = filter.value"
        >
          {{ filter.label }}
        </button>
      </div>
      <button type="button" class="ps-btn ps-btn--ghost ps-btn--sm" :disabled="isLoading" @click="reload">
        <i class="bi bi-arrow-clockwise"></i> Atualizar
      </button>
    </div>

    <div v-if="isLoading" class="admin-list">
      <div v-for="n in 3" :key="n" class="ps-skeleton" style="height: 96px"></div>
    </div>

    <div v-else-if="error" class="alert alert-danger d-flex align-items-center gap-2 border-0" role="alert">
      <i class="bi bi-shield-exclamation"></i> {{ error.message || 'Não foi possível carregar as denúncias.' }}
    </div>

    <ul v-else-if="reports.length" class="admin-list">
      <li v-for="report in reports" :key="report.id" class="admin-row">
        <RouterLink :to="{ name: 'photo-detail', params: { id: report.photo?.id } }" class="admin-row__thumb">
          <img :src="getPhotoUrl(report.photo?.imageUrl)" :alt="report.photo?.title" />
        </RouterLink>

        <div class="admin-row__body">
          <RouterLink :to="{ name: 'photo-detail', params: { id: report.photo?.id } }" class="admin-row__title">
            {{ report.photo?.title }}
          </RouterLink>
          <span class="admin-row__meta">de @{{ report.photo?.author?.username }}</span>
          <div class="admin-row__tags">
            <span class="admin-tag"><i class="bi bi-flag"></i> {{ reasonLabels[report.reason] || report.reason }}</span>
            <span class="admin-tag" :class="report.status === 'pending' ? 'admin-tag--warn' : 'admin-tag--ok'">
              {{ report.status === 'pending' ? 'Pendente' : 'Revisada' }}
            </span>
          </div>
          <span class="admin-row__meta">
            Denunciado por @{{ report.Reporter?.username }},
            <time :datetime="report.createdAt" :title="formatDateTime(report.createdAt)">{{ formatRelativeTime(report.createdAt) }}</time>
            <template v-if="report.reviewedAt"> · revisada em {{ formatDateTime(report.reviewedAt) }}</template>
          </span>
        </div>

        <button
          v-if="report.status === 'pending'"
          type="button"
          class="ps-btn ps-btn--ghost ps-btn--sm admin-row__action"
          :disabled="busyIds.has(report.id)"
          @click="markAsReviewed(report)"
        >
          <span v-if="busyIds.has(report.id)" class="spinner-border spinner-border-sm"></span>
          <i v-else class="bi bi-check2-circle"></i>
          {{ busyIds.has(report.id) ? 'Salvando...' : 'Marcar como revisada' }}
        </button>
      </li>
    </ul>

    <div v-else class="ps-empty">
      <div class="ps-empty__icon"><i class="bi bi-flag"></i></div>
      <h2 class="h5 fw-bold">Nenhuma denúncia neste filtro</h2>
    </div>

    <div v-if="hasMore && reports.length" class="text-center pt-4">
      <button type="button" class="ps-btn ps-btn--ghost px-4" :disabled="isLoadingMore" @click="loadMore">
        <span v-if="isLoadingMore" class="spinner-border spinner-border-sm"></span>
        {{ isLoadingMore ? 'Carregando...' : 'Carregar mais' }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.filter-btn { border-radius: 0; }
.btn-group .filter-btn:first-child { border-radius: 999px 0 0 999px; }
.btn-group .filter-btn:last-child { border-radius: 0 999px 999px 0; }
</style>
