<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const showId = route.params.id // Get show ID from URL

interface ShowDetails {
  id: number
  name: string
  summary: string
  genres: string[]
  language: string
  rating: { average: number | null }
  image?: { medium: string; original: string }
  officialSite?: string
}

const show = ref<ShowDetails | null>(null)
const loading = ref<boolean>(true)
const error = ref<string | null>(null)

async function fetchShowDetails() {
  try {
    const response = await fetch(`https://api.tvmaze.com/shows/${showId}`)
    if (!response.ok) throw new Error('Show not found')
    show.value = await response.json()
  } catch (err) {
    error.value = 'Failed to load show details'
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchShowDetails)
</script>

<template>
  <div>
    <p v-if="loading">Loading show details...</p>
    <p v-if="error">{{ error }}</p>

    <div v-if="show">
      <h1>{{ show.name }}</h1>
      <img v-if="show.image" :src="show.image.original" :alt="show.name" width="300" />
      <p><strong>Genres:</strong> {{ show.genres.join(', ') }}</p>
      <p><strong>Language:</strong> {{ show.language }}</p>
      <p><strong>Rating:</strong> ⭐ {{ show.rating.average || 'N/A' }}</p>
      <p v-html="show.summary"></p>
      <a v-if="show.officialSite" :href="show.officialSite" target="_blank">Visit Official Site</a>
    </div>
  </div>
</template>
