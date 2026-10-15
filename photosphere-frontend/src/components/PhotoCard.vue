<script setup>
/**
 * PhotoCard.vue — Card reutilizável da foto (Aula 08, refatorado na Aula 09).
 *
 * Refatoração da Aula 09:
 *  - O card NÃO é mais um <a> gigante. Um link envolvendo o card inteiro impediria
 *    colocar botões (Editar/Excluir) dentro dele: <button> dentro de <a> é HTML
 *    inválido e o clique no botão também dispararia a navegação para o detalhe.
 *    Agora só a imagem e o título são links para o detalhe.
 *  - O autor é clicável (leva ao perfil público) e OPCIONAL (prop showAuthor):
 *    no perfil de uma pessoa, repetir o nome dela em todo card seria ruído.
 *  - Slot "actions": quem usa o card decide quais botões aparecem (Meus Itens
 *    injeta Editar/Excluir; o Feed não injeta nada e continua igual).
 */

import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { getPhotoUrl, getProfilePictureUrl } from '@/utils/media'

const props = defineProps({
  photo: {
    type: Object,
    required: true,
  },
  showAuthor: {
    type: Boolean,
    default: true,
  },
})

const detailRoute = computed(() => ({ name: 'photo-detail', params: { id: props.photo.id } }))
const authorRoute = computed(() =>
  props.photo.author?.username ? { name: 'profile', params: { username: props.photo.author.username } } : null
)
</script>

<template>
  <article class="photo-card">
    <RouterLink :to="detailRoute" class="photo-card__media" :aria-label="`Ver foto ${photo.title}`">
      <img :src="getPhotoUrl(photo.imageUrl)" :alt="photo.title" class="photo-card__img" loading="lazy" />
      <span class="photo-card__overlay"><i class="bi bi-arrows-angle-expand"></i></span>
    </RouterLink>

    <div class="photo-card__body">
      <h3 class="photo-card__title">
        <RouterLink :to="detailRoute">{{ photo.title }}</RouterLink>
      </h3>
      <p v-if="photo.description" class="photo-card__desc">{{ photo.description }}</p>

      <div class="photo-card__meta">
        <RouterLink v-if="showAuthor && authorRoute" :to="authorRoute" class="photo-card__author">
          <img :src="getProfilePictureUrl(photo.author?.profilePicture)" :alt="photo.author?.username" />
          <span>{{ photo.author?.fullName || photo.author?.username }}</span>
        </RouterLink>
        <span v-else class="photo-card__date">
          <i class="bi bi-calendar3"></i>
          {{ new Date(photo.createdAt).toLocaleDateString('pt-BR') }}
        </span>

        <div class="photo-card__stats">
          <span title="Visualizações"><i class="bi bi-eye"></i>{{ photo.viewsCount || 0 }}</span>
          <span title="Curtidas"><i class="bi bi-heart"></i>{{ photo.likesCount || 0 }}</span>
        </div>
      </div>

      <!-- Ações injetadas pelo pai (ex.: Editar / Excluir em Minhas Fotos) -->
      <div v-if="$slots.actions" class="photo-card__actions">
        <slot name="actions" :photo="photo" />
      </div>
    </div>
  </article>
</template>

<style scoped>
.photo-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: var(--ps-surface);
  border: 1px solid var(--ps-border);
  border-radius: var(--ps-radius);
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}
.photo-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 102, 34, 0.35);
  box-shadow: 0 22px 40px -22px rgba(255, 102, 34, 0.45);
}

.photo-card__media {
  position: relative;
  display: block;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: #0a0807;
}
.photo-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.photo-card:hover .photo-card__img { transform: scale(1.06); }

.photo-card__overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 1.3rem;
  background: linear-gradient(180deg, transparent 40%, rgba(0, 0, 0, 0.55));
  opacity: 0;
  transition: opacity 0.25s ease;
}
.photo-card:hover .photo-card__overlay { opacity: 1; }

.photo-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem 1.1rem 1.1rem;
}

.photo-card__title {
  margin: 0 0 0.25rem;
  font-size: 1.02rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.photo-card__title a { color: var(--ps-text); text-decoration: none; }
.photo-card__title a:hover { color: var(--brand-color-light); }

.photo-card__desc {
  margin: 0;
  color: var(--ps-muted);
  font-size: 0.85rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.photo-card__meta {
  margin-top: auto;
  padding-top: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.photo-card__author {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
  color: var(--ps-text);
  font-size: 0.82rem;
  font-weight: 600;
  text-decoration: none;
}
.photo-card__author img {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 0 2px var(--ps-surface), 0 0 0 3px rgba(255, 102, 34, 0.6);
}
.photo-card__author span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 120px; }
.photo-card__author:hover span { color: var(--brand-color-light); }

.photo-card__date { color: var(--ps-muted); font-size: 0.8rem; display: inline-flex; gap: 0.35rem; }

.photo-card__stats { display: flex; gap: 0.8rem; color: var(--ps-muted); font-size: 0.8rem; }
.photo-card__stats span { display: inline-flex; align-items: center; gap: 0.3rem; }

.photo-card__actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.9rem;
  padding-top: 0.9rem;
  border-top: 1px solid var(--ps-border);
}
.photo-card__actions :deep(.ps-btn) { flex: 1; }
</style>
