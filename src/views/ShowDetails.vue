<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import getRatingColor from '@/utils/getRatingColor'

const route = useRoute()
const showId = route.params.id // Get show ID from URL

interface ShowDetails {
  name: string
  genres: string[]
  rating: { average: number | null }
  image?: { medium: string; original: string }
  premiered?: string
  ended?: string
}
interface Episode {
  name: string
  season: number
  number: number
  airdate: string
  rating: { average: number }
}

const show = ref<ShowDetails | null>(null)
const seasons = ref<Episode[][] | null>(null)
const seasonLength = ref<number | null>(null)
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
onMounted(fetchShowDetails)

const fetchEpisodes = async () => {
  try {
    const response = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
    if (!response.ok) throw new Error('Episodes not found')
    const data: Episode[] = await response.json()

    seasons.value = Object.values(
      data.reduce<Record<number, Episode[]>>((acc, episode) => {
        if (!acc[episode.season]) {
          acc[episode.season] = []
        }
        acc[episode.season].push(episode)
        return acc
      }, {}),
    )
    seasonLength.value = seasons.value.length
      ? Math.max(...seasons.value.map((season) => season.length))
      : 0
  } catch (err) {
    error.value = 'Failed to load episodes'
    console.error(err)
  }
}

// Watch for changes in `show` and update `runTime`
watch(show, (newShow) => {
  if (newShow?.premiered) {
    const premiered = newShow?.premiered.substring(0, 4)
    const ended = newShow?.ended ? newShow.ended.substring(0, 4) : 'now'
    runTime.value = `${premiered}-${ended}`
  }
})

onMounted(fetchEpisodes)
</script>

<template>
  <div class="flex flex-col gap-8 md:flex-row">
    <div class="w-[200px] min-w-[200px]">
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
    <div>
      <div class="flex gap-2">
        <div class="grid grid-rows-[32px] pt-[32px] gap-2">
          <div v-for="n in seasonLength" :key="n" class="flex items-center justify-end pr-1">
            e{{ n }}
          </div>
        </div>
        <div
          v-for="(season, i) in seasons"
          :key="`season-${i}`"
          class="flex flex-col gap-2 items-center"
        >
          {{ i + 1 }}
          <div
            v-for="episode in season"
            :key="episode.number"
            class="relative group flex items-center justify-center px-2 py-1 min-w-[50px] rounded-sm text-white hover:cursor-pointer"
            :class="getRatingColor(episode.rating?.average)"
          >
            <div
              class="z-1 min-w-max absolute hidden group-hover:block bg-gray-800 text-white text-xs py-[5px] px-3 rounded-md -top-6 left-1/2 transform -translate-x-1/2"
            >
              <span class="text-sm">
                {{ episode.name }}
              </span>
            </div>
            {{ episode.rating?.average ?? '?' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
