<script setup lang="ts">
import Search from '@/components/Search'
</script>

<template>
  <div class="flex flex-col gap-8 sm:gap-24">
    <nav class="grid grid-cols-2 md:grid-cols-3 items-center">
      <router-link to="/" class="flex items-center gap-4 whitespace-nowrap">
        <img src="@/assets/logo-grey.svg" alt="logo" class="w-12 h-auto" />
        <span class="text-2xl hidden sm:block">TV Ratings</span>
      </router-link>
      <Search v-if="$route.path !== '/'" class="col-start-3 md:col-start-2" />
    </nav>
    <router-view :key="$route.fullPath" />
  </div>
</template>
