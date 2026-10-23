import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Creators from '../views/Creators.vue'
import MapsView from '../views/MapsView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: Creators
  },
  {
    path: '/maps',
    name: 'maps',
    component: MapsView
  },
  {
    path: '/listing/:id',
    name: 'listing',
    component: () => import('@/views/ListingView.vue')
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/AuthView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/auth/callback',
    name: 'auth-callback',
    component: () => import('@/views/AuthCallbackView.vue')
  },
  {
    path: '/404',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/AuthView.vue'),
    meta: { guestOnly: true }
  },
  // Unknown paths go to 404
  { path: '/:pathMatch(.*)*', redirect: '/404' }
]
    
const router = createRouter({ history: createWebHistory(), routes })

router.onError((error) => {
  const navError = error as { code?: string | number; status?: number }
  if (navError.code === '404' || navError.status === 404) {
    router.push('/404')
  } else {
    console.error('Навигационная ошибка:', error)
  }
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  const hasToken = !!(localStorage.getItem('token') || sessionStorage.getItem('token'))

  if (!authStore.isAuthenticated && hasToken) {
    authStore.checkAuth()
      .then(() => finish())
      .catch(() => {
        authStore.logout()
        next('/login')
      })
    return
  }

  finish()

  function finish() {
    if (to.meta.requiresAuth && !authStore.isAuthenticated) return next('/login')
    if (to.meta.guestOnly && authStore.isAuthenticated) return next('/')
    return next()
  }
})

export default router