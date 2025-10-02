<template>
    <v-container fluid class="auth-container d-flex align-center justify-center">
        <v-card class="auth-card" max-width="400" width="100%">
            <v-card-text class="pa-10">
                <h1 class="text-h4 text-center text-grey-darken-3 mb-8">Iniciar Sesión</h1>

                <v-form @submit.prevent="handleLogin">
                    <v-text-field v-model="form.email" label="Email" type="email" placeholder="tu@email.com"
                        variant="outlined" density="comfortable" prepend-inner-icon="mdi-email" required
                        class="mb-4"></v-text-field>

                    <v-text-field v-model="form.password" label="Contraseña" type="password" placeholder="••••••••"
                        variant="outlined" density="comfortable" prepend-inner-icon="mdi-lock" required
                        class="mb-4"></v-text-field>

                    <v-alert v-if="authStore.error" type="error" variant="tonal" class="mb-4">
                        {{ authStore.error }}
                    </v-alert>

                    <v-btn type="submit" :loading="authStore.loading" :disabled="authStore.loading" color="primary"
                        block size="large">
                        {{ authStore.loading ? 'Cargando...' : 'Iniciar Sesión' }}
                    </v-btn>
                </v-form>

                <p class="text-center text-grey-darken-1 mt-6">
                    ¿No tienes cuenta?
                    <router-link to="/register" class="text-primary text-decoration-none font-weight-bold">
                        Regístrate aquí
                    </router-link>
                </p>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
    email: '',
    password: ''
})

onMounted(() => {
    authStore.clearError()
})

const handleLogin = async () => {
    try {
        authStore.clearError();
        const result = await authStore.login(form.value);

        // Redirigir a home con el slug del tenant
        const tenantSlug = result.user?.tenant?.slug;
        if (tenantSlug) {
            router.push(`/home/${tenantSlug}`);
        } else {
            router.push('/home');
        }
    } catch (error) {
        console.error('Error en login:', error);
    }
}
</script>

<style scoped>
.auth-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
}

.auth-card {
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
}
</style>