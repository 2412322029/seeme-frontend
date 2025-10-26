import { createRouter, createWebHistory } from 'vue-router'

const Note = () => import('@/views/note.vue')
const Home = () => import('@/views/home.vue')
const Page = () => import('@/views/page.vue')
const Doing = () => import('@/views/doing.vue')
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
      path: '/note',
      name: 'note',
      component: Note,
      meta: {
        title: 'Note',
        description: 'A collection of notes and resources.',
        transition: 'fade'
      },
    },
    {
      path: '/p/:id?',
      name: 'page',
      component: Page,
    },
    {
      path: '/doing',
      name: 'doing',
      component: Doing,
    },
    {
      path: '/mcstatus/:address?',
      name: 'mcstatus',
      component: Mc,
      meta: {
        title: 'Minecraft Status',
        description: 'Check the status of a Minecraft server.',
        transition: 'fade'
      },
    },
    {
      path: '/steam',
      name: 'steam',
      component: Steam,
      meta: {
        title: 'Steam',
        description: 'View Steam game information and status.',
      },
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: Calendar,
      meta: {
        title: 'Calendar',
        description: 'A calendar view for anime',
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFound,
    },
  ],
})

export default router
