<template>
    <v-container fluid class="view-container d-flex align-center justify-center">
        <v-card class="view-card" max-width="400" width="100%">
            <v-card-text class="pa-10">
                <h1 class="text-h4 text-center text-grey-darken-3 mb-8">Crear Cuenta</h1>

                <v-form @submit.prevent="handleRegister">
                    <v-text-field v-model="form.name" label="Nombre" type="text" placeholder="Tu nombre"
                        variant="outlined" density="comfortable" prepend-inner-icon="mdi-account" required
                        class="mb-4" />

                    <v-text-field v-model="form.email" label="Email" type="email" placeholder="tu@email.com"
                        variant="outlined" density="comfortable" prepend-inner-icon="mdi-email" required class="mb-4" />

                    <v-text-field v-model="form.password" label="Contraseña" type="password"
                        placeholder="Mínimo 6 caracteres" variant="outlined" density="comfortable"
                        prepend-inner-icon="mdi-lock" required :rules="[v => v.length >= 6 || 'Mínimo 6 caracteres']"
                        class="mb-4" />

                    <v-text-field v-model="form.tenantId" label="ID del Cliente" type="text" placeholder="Tenant-ID"
                        variant="outlined" density="comfortable" prepend-inner-icon="mdi-office-building" required
                        class="mb-4" />

                    <v-alert v-if="authStore.error" type="error" variant="tonal" class="mb-4">
                        {{ authStore.error }}
                    </v-alert>

                    <v-btn type="submit" :loading="authStore.loading" :disabled="authStore.loading" color="primary"
                        block size="large">
                        {{ authStore.loading ? 'Cargando...' : 'Registrarse' }}
                    </v-btn>
                </v-form>

                <p class="text-center text-grey-darken-1 mt-6">
                    ¿Ya tienes cuenta?
                    <router-link to="/login" class="text-primary text-decoration-none font-weight-bold">
                        Inicia sesión aquí
                    </router-link>
                </p>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
    name: '',
    email: '',
    password: '',
    tenantId: ''
})

onMounted(() => {
    authStore.clearError()
})

const handleRegister = async () => {
    try {
        await authStore.register(form.value)
        router.push('/')
    } catch (error) {
        console.error('Error en registro:', error)
    }
}
</script>