import { createRouter, createWebHistory } from 'vue-router'

const Home = () => import('@/views/home.vue')
const Mc = () => import('@/views/mc.vue')
const Steam = () => import('@/views/steam.vue')
const Calendar = () => import('@/views/calendar.vue')
const NotFound = () => import('@/views/NotFound.vue')

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
      path: '/calendar',
      name: 'calendar',
      component: Calendar,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFound,
    },
  ],
})

export default router
