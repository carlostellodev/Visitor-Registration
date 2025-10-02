import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true },
  },
  {
    path: '/home/:slug',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true },
  },
  {
    path: '/home',
    redirect: (to) => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return '/login'
      const slug = authStore.tenantSlug
      return slug ? `/home/${slug}` : '/login'
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// // Guard de navegación
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  // Rutas que requieren autenticación
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }

  // Rutas solo para invitados (login, register)
  if (to.meta.requiresGuest && isAuthenticated) {
    const slug = authStore.tenantSlug
    next(slug ? `/home/${slug}` : '/home')
    return
  }

  // Si va a /home/:slug y está autenticado, verificar que el slug coincida
  if (to.name === 'Home' && isAuthenticated && to.params.slug) {
    const userSlug = authStore.tenantSlug
    if (userSlug && to.params.slug !== userSlug) {
      console.warn('Slug no coincide con el tenant del usuario')
      next(`/home/${userSlug}`)
      return
    }
  }

  next()
})

export default router
