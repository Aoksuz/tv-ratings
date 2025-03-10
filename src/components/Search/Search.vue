<script setup>
import { ref, watch } from 'vue'
import useNavigation from '@/utils/useNavigation'

const { goToShowDetails } = useNavigation()

const searchQuery = ref('')
const searchResults = ref([])
const showDropdown = ref(false)

async function fetchSearchResults() {
  if (searchQuery.value.length < 3) {
    searchResults.value = []
    showDropdown.value = false
    return
  }

  try {
    const response = await fetch(`https://api.tvmaze.com/search/shows?q=${searchQuery.value}`)
    const data = await response.json()

    searchResults.value = data.filter((item) => !item.show.genres.includes('Adult'))

    showDropdown.value = searchResults.value.length > 0
  } catch (error) {
    console.error('Failed to fetch search results', error)
  }
}

watch(searchQuery, fetchSearchResults)
</script>

<template>
  <div class="relative mx-auto w-[100%] flex justify-center">
    <input
      v-model="searchQuery"
      type="text"
      placeholder="Search TV Shows..."
      class="w-[100%] max-w-[300px] px-2 py-1 border rounded-md text-gray-300 text-sm"
    />
    <ul
      v-if="showDropdown"
      class="absolute w-[100%] max-w-[300px] mt-1 bg-white border rounded-md max-h-60 overflow-auto z-10"
    >
      <li
        v-for="result in searchResults"
        :key="result.show.id"
        @click="goToShowDetails(result.show.id, () => (showDropdown = false))"
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
</template>
