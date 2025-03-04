import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import ShowDetails from '../views/ShowDetails.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/show/:id', component: ShowDetails, props: true },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
