<template>
  <v-app id="app" :style="{ background: backgroundGradient }" class="outline">
    <router-view />
    <v-icon class="mt-n4 mb-3 ml-3" size="x-large" @click="handleHelp">mdi-tooltip-question-outline</v-icon>
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
    if (newTheme) {
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
  const primary = authStore.tenant?.theme?.primary || '#667eea'
  const secondary = authStore.tenant?.theme?.secondary || '#9fc5e8'
  // return `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`
  return `${secondary}`;
})
//-----------------------------------------------------------------------------

function handleHelp() {
  window.open('https://github.com/ctell/visitor-registration', '_blank');
};
</script>