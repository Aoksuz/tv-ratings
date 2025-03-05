<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

interface TvShow {
  id: number
  name: string
  rating: { average: number | null }
  genres: string[]
  language: string
  image?: { medium: string; original: string }
}

interface SearchResult {
  show: {
    id: number
    name: string
    image?: { medium: string }
  }
}

const shows = ref<TvShow[]>([])
const loading = ref<boolean>(true)
const error = ref<string | null>(null)
const router = useRouter()
const showShadows = ref<Record<number, string>>({})
const hoveredShow = ref<number | null>(null)
const searchQuery = ref('')
const searchResults = ref<SearchResult[]>([])
const showDropdown = ref(false)
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

// Navigate to Show Details Page
function goToShowDetails(showId: number) {
  router.push(`/show/${showId}`)
}

// Fetch search results when query has 3+ characters
async function fetchSearchResults() {
  if (searchQuery.value.length < 3) {
    searchResults.value = []
    showDropdown.value = false
    return
  }

  try {
    const response = await fetch(`https://api.tvmaze.com/search/shows?q=${searchQuery.value}`)
    const data = await response.json()
    console.log(data)

    searchResults.value = data.filter(
      (item: { show: { genres: string[] } }) => !item.show.genres.includes('Adult'),
    )
    console.log(searchResults.value)

    showDropdown.value = searchResults.value.length > 0
  } catch (error) {
    console.error('Failed to fetch search results', error)
  }
}

watch(searchQuery, fetchSearchResults)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold pb-4">Look up any show</h1>
    <div class="relative mx-auto">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search TV Shows..."
        class="w-[100%] max-w-[300px] p-2 border rounded-md"
      />
      <ul
        v-if="showDropdown"
        class="absolute w-[100%] max-w-[300px] mt-1 bg-white border rounded-md max-h-60 overflow-auto z-1"
      >
        <li
          v-for="result in searchResults"
          :key="result.show.id"
          @click="goToShowDetails(result.show.id)"
          class="flex items-center gap-2 p-1 cursor-pointer hover:bg-blue-100 text-black h-[56px]"
        >
          <div class="grid grid-cols-[auto_auto] items-center gap-4">
            <div class="w-10">
              <img
                v-if="result.show.image"
                :src="result.show.image.medium"
                :alt="result.show.name"
                class="w-10 h-12"
              />
            </div>
            <span>{{ result.show.name }}</span>
          </div>
        </li>
      </ul>
    </div>
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
