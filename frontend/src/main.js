import './assets/base.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import Toast, { POSITION } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

import vuetify from './plugins/vuetify'
import App from './App.vue'
import router from './router'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(vuetify)
app.use(Toast, {
  position: POSITION.TOP_RIGHT,
  containerClassName: 'custom-toast-container',
  timeout: 3000,
  closeOnClick: true,
  pauseOnHover: true,
  transition: 'Vue-Toastification__fade',
})

app.mount('#app')
