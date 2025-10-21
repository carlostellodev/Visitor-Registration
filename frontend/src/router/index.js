import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useVisitStore } from '../stores/visitStore'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Home from '../views/Home.vue'
import Legal from '../views/Legal.vue'
import Signature from '../views/Signature.vue'
import Help from '../views/Help.vue'
import VisitorsList from '@/views/VisitorsList.vue'

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true, dontShowHelp: true },
  },
  // {
  //   path: '/register',
  //   name: 'Register',
  //   component: Register,
  //   meta: { requiresGuest: true, dontShowHelp: true },
  // },
  {
    path: '/home/:slug',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true, step: 1 },
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
  {
    path: '/legal/:slug',
    name: 'Legal',
    component: Legal,
    meta: { requiresAuth: true, requiresFormData: true, step: 2 },
  },
  {
    path: '/signature/:slug',
    name: 'Signature',
    component: Signature,
    meta: { requiresAuth: true, requiresLegalAcceptance: true, step: 3 },
  },
  {
    path: '/help/:slug',
    name: 'Help',
    component: Help,
    meta: { requiresAuth: true, dontShowHelp: true },
  },
  {
    path: '/visitors/:slug',
    name: 'VisitorsList',
    component: VisitorsList,
    meta: { requiresAuth: true, dontShowList: true },
  },
  {
    // Ruta 404 - Captura cualquier ruta no definida
    path: '/:pathMatch(.*)*',
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
  const visitStore = useVisitStore()
  const isAuthenticated = authStore.isAuthenticated
  const userSlug = authStore.tenantSlug

  // Rutas que requieren autenticación
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }

  // Rutas solo para invitados (login, register)
  if (to.meta.requiresGuest && isAuthenticated) {
    next(userSlug ? `/home/${userSlug}` : '/home')
    return
  }

  // Validar slug del tenant
  if (isAuthenticated && to.params.slug && to.name !== 'Help') {
    if (!userSlug) {
      next('/login')
      return
    }

    if (to.params.slug !== userSlug) {
      // Redirigir a la misma ruta pero con el slug correcto
      const correctPath = to.path.replace(to.params.slug, userSlug)
      next(correctPath)
      return
    }
  }

  // Validación del flujo correcto (Home -> Legal -> Signature)
  if (isAuthenticated && to.meta.step) {
    // Verificar que tenga datos del formulario para Legal
    if (to.name === 'Legal' && !visitStore.isFormDataValid) {
      next(`/home/${userSlug}`)
      return
    }

    // Verificar que haya aceptado documentos para /signature
    if (to.name === 'Signature') {
      if (!visitStore.isFormDataValid) {
        next(`/home/${userSlug}`)
        return
      }

      if (!visitStore.canAccessSignature) {
        next(`/legal/${userSlug}`)
        return
      }
    }
  }

  // Permitir navegación
  next()
})

export default router
