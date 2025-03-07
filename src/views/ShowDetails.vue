<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
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
  premiered?: string
  ended?: string
}

const show = ref<ShowDetails | null>(null)
const loading = ref<boolean>(true)
const error = ref<string | null>(null)
const runTime = ref<string>('')

const fetchShowDetails = async () => {
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
console.log(show)

// Watch for changes in `show` and update `runTime`
watch(show, (newShow) => {
  if (newShow?.premiered) {
    const premiered = newShow?.premiered.substring(0, 4)
    const ended = newShow?.ended ? newShow.ended.substring(0, 4) : 'now'
    runTime.value = `${premiered}-${ended}`
  }
})

onMounted(fetchShowDetails)
</script>

<template>
  <div class="flex flex-col gap-8 md:flex-row">
    <div class="w-[200px]">
      <p v-if="loading">Loading show details...</p>
      <p v-if="error">{{ error }}</p>

      <div v-if="show" class="flex flex-col gap-2">
        <img v-if="show.image" :src="show.image.original" :alt="show.name" width="300" />
        <h1 class="text-2xl">{{ show.name }}</h1>
        <p v-if="show?.premiered" class="text-sm">({{ runTime }})</p>
        <p>⭐ {{ show.rating.average || 'N/A' }}</p>
        <div class="flex flex-row gap-1 flex-wrap">
          <p v-for="genre in show.genres" class="bg-gray-700 px-[5px] rounded-sm">{{ genre }}</p>
        </div>
      </div>
    </div>
    <div><p class="text-4xl">This section is under development</p></div>
  </div>
</template>
