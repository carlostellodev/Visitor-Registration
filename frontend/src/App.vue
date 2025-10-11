<template>
  <v-app id="app" :style="{ background: backgroundGradient }" class="outline">
    <router-view />
  </v-app>
</template>

<script setup>
import { RouterView } from 'vue-router'
import { computed, watch } from 'vue'
import { useAuthStore } from './stores/authStore'
import { useTheme } from 'vuetify'

const authStore = useAuthStore()
const theme = useTheme()


//-----------------------------------------------------------------------------
// Aplicar theme del tenant a Vuetify
watch(
  () => authStore.tenant?.theme,
  (newTheme) => {
    console.log(authStore.tenant?.theme);

    if (newTheme && authStore.tenant) {
      theme.themes.value.light.colors.primary = newTheme.primary || '#2986cc';
      theme.themes.value.light.colors.secondary = newTheme.secondary || '#9fc5e8';
    }
  },
  { immediate: true }
);
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// Computed para el gradiente de fondo dinámico
const backgroundGradient = computed(() => {
  console.log(authStore.tenant?.theme);

  const primary = authStore.tenant?.theme?.primary || '#667eea'
  const secondary = authStore.tenant?.theme?.secondary || '#9fc5e8'
  // return `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`
  return `${secondary}`;
})
//-----------------------------------------------------------------------------
</script>