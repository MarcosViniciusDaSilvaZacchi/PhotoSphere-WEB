<script setup>
import { RouterLink } from 'vue-router'
import { getPhotoUrl, getProfilePictureUrl } from '@/utils/media'

defineProps({
  photo: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="card photo-card h-100 bg-dark text-white border-secondary shadow-sm">
    <RouterLink :to="`/photo/${photo.id}`" class="photo-card__img-wrapper position-relative">
      <img
        :src="getPhotoUrl(photo.imageUrl)"
        :alt="photo.title"
        class="card-img-top photo-card__img"
      />
      <div class="photo-card__overlay d-flex align-items-center justify-content-center">
        <span class="btn btn-outline-light btn-sm rounded-pill">
          <i class="bi bi-eye-fill me-1"></i> Ver Foto
        </span>
      </div>
    </RouterLink>

    <div class="card-body d-flex flex-column justify-content-between">
      <div>
        <h5 class="card-title text-truncate mb-1">
          <RouterLink :to="`/photo/${photo.id}`" class="text-white text-decoration-none hover-orange">
            {{ photo.title }}
          </RouterLink>
        </h5>
        <p v-if="photo.description" class="card-text text-muted small text-truncate-2">
          {{ photo.description }}
        </p>
      </div>

      <div class="d-flex align-items-center justify-content-between mt-3 pt-2 border-top border-secondary-subtle">
        <div class="d-flex align-items-center gap-2">
          <img
            :src="getProfilePictureUrl(photo.author?.profilePicture)"
            :alt="photo.author?.username || 'Autor'"
            class="rounded-circle photo-card__avatar"
          />
          <span class="small text-light text-truncate" style="max-width: 110px;">
            {{ photo.author?.fullName || photo.author?.username || 'Anônimo' }}
          </span>
        </div>

        <div class="d-flex align-items-center gap-3 text-muted small">
          <span><i class="bi bi-eye me-1"></i>{{ photo.viewsCount || 0 }}</span>
          <span><i class="bi bi-heart me-1"></i>{{ photo.likesCount || 0 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.photo-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
  border-radius: 12px;
}

.photo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(255, 102, 34, 0.25) !important;
}

.photo-card__img-wrapper {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background-color: #111;
}

.photo-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.photo-card:hover .photo-card__img {
  transform: scale(1.05);
}

.photo-card__overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.photo-card:hover .photo-card__overlay {
  opacity: 1;
}

.photo-card__avatar {
  width: 26px;
  height: 26px;
  object-fit: cover;
  border: 1px solid #FF6622;
}

.hover-orange:hover {
  color: #FF6622 !important;
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
