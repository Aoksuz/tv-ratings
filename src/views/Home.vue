<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Search from '../components/Search'
import useNavigation from '@/utils/useNavigation'

const { goToShowDetails } = useNavigation()

interface TvShow {
  id: number
  name: string
  rating: { average: number | null }
  genres: string[]
  language: string
  image?: { medium: string; original: string }
}

const shows = ref<TvShow[]>([])
const loading = ref<boolean>(true)
const error = ref<string | null>(null)
const showShadows = ref<Record<number, string>>({})
const hoveredShow = ref<number | null>(null)
const topRatedShows = [
  169, 82, 179, 180, 204, 335, 396, 465, 555, 787, 3291, 30770, 2, 118, 206, 216, 251, 527, 158,
  166,
]

async function fetchTopRatedShows() {
  try {
    const responses = await Promise.all(
      topRatedShows.map((id) =>
        fetch(`https://api.tvmaze.com/shows/${id}`).then((res) => res.json()),
      ),
    )

    shows.value = responses

    extractColors()
  } catch (err) {
    error.value = 'Failed to fetch top-rated shows'
    console.error(err)
  } finally {
    loading.value = false
  }
}
onMounted(fetchTopRatedShows)

// Extract dominant color and apply as shadow
function extractColors() {
  shows.value.forEach((show) => {
    if (!show.image) return

    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.src = show.image.medium

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const { data } = ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1)
      const color = `rgb(${data[0]}, ${data[1]}, ${data[2]})`

      showShadows.value[show.id] = color
    }
  })
}
</script>

<template>
  <div class="flex flex-col items-center text-center">
    <h1 class="text-2xl font-bold pb-4">Explore shows and episodes through charts</h1>
    <span class="text-md pb-4 max-w-[600px]"
      >Navigate the ratings landscape, discover underrated gems, and plot your perfect
      binge-watching adventure through the world of series — all in one view!</span
    >
    <Search />
  </div>
  <div class="mx-auto">
    <h2 class="text-2xl font-bold pb-4">Best rated shows</h2>
    <p v-if="loading">Loading shows...</p>
    <p v-if="error">{{ error }}</p>

    <div
      v-if="!loading && !error"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-8"
    >
      <div
        v-for="show in shows"
        :key="show.id"
        @click="goToShowDetails(show.id)"
        class="show-item cursor-pointer flex flex-col items-center relative transition-transform duration-200 hover:scale-105"
      >
        <img
          v-if="show.image"
          :src="show.image.medium"
          :alt="show.name"
          class="rounded-lg transition-shadow duration-300"
          :style="{
            boxShadow:
              hoveredShow === show.id && showShadows[show.id]
                ? `0px 8px 20px ${showShadows[show.id]}`
                : 'none',
          }"
          @mouseover="hoveredShow = show.id"
          @mouseleave="hoveredShow = null"
        />
        <strong class="mt-2 text-lg">{{ show.name }}</strong>
      </div>
    </div>
  </div>
</template>
