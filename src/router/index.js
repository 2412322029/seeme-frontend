import NotFound from '@/views/NotFound.vue'
import Home from '@/views/home.vue'
import Mc from '@/views/mc.vue'
import Steam from '@/views/steam.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/mcstatus/:address?',
      name: 'mcstatus',
      component: Mc,
    },
    {
      path: '/steam',
      name: 'steam',
      component: Steam,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFound,
    },
  ],
})

export default router
