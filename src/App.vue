<script setup lang="ts"></script>

<template>
  <div class="flex flex-col gap-8">
    <nav>
      <router-link to="/" class="flex items-center gap-4 max-w-min whitespace-nowrap">
        <img src="./assets/logo-grey.svg" alt="logo" class="w-12 h-auto" />
        <span class="text-2xl">TV Ratings</span>
      </router-link>
    </nav>
    <router-view />
  </div>
</template>
