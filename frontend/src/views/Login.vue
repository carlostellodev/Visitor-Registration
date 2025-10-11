<template>
    <v-container fluid class="view-container d-flex align-center justify-center">
        <v-card class="view-card" max-width="400" width="100%">
            <v-card-text class="pa-10">
                <h1 class="text-h4 text-center text-grey-darken-3 mb-8">Iniciar Sesión</h1>

                <v-form @submit.prevent="handleLogin">
                    <v-text-field v-model="form.email" label="Email" type="email" placeholder="tu@email.com"
                        variant="outlined" density="comfortable" prepend-inner-icon="mdi-email" required
                        :disabled="authStore.loading || authStore.isRateLimited" class="mb-4">
                    </v-text-field>

                    <v-text-field v-model="form.password" label="Contraseña" type="password" placeholder="••••••••"
                        variant="outlined" density="comfortable" prepend-inner-icon="mdi-lock" required
                        :disabled="authStore.loading || authStore.isRateLimited" class="mb-4">
                    </v-text-field>

                    <!-- Alerta de Rate Limiting -->
                    <v-alert v-if="authStore.isRateLimited" type="warning" variant="tonal" density="compact"
                        class="mb-4 mt-n3">
                        <div class="d-flex flex-row align-center justify-space-between outline">
                            <div class="d-flex align-center">
                                <v-icon icon="mdi-shield-lock" size="small" class="mr-2"></v-icon>
                                <div>
                                    <div class="text-body-2 font-weight-bold">Cuenta bloqueada</div>
                                    <div class="text-caption">{{ authStore.rateLimitInfo.details }}</div>
                                </div>
                            </div>
                            <v-chip v-if="remainingTime" color="error" variant="flat" class="mt-2">
                                <v-icon icon="mdi-clock-outline" size="x-small" start></v-icon>
                                {{ remainingTime }}
                            </v-chip>
                        </div>
                    </v-alert>

                    <!-- Alerta de Error General -->
                    <v-alert v-else-if="authStore.error" type="error" variant="tonal" density="compact"
                        class="mb-4 mt-n3">
                        {{ authStore.error }}
                    </v-alert>

                    <v-btn type="submit" :loading="authStore.loading"
                        :disabled="authStore.loading || authStore.isRateLimited" color="primary" block size="large">
                        <span v-if="authStore.isRateLimited">Cuenta bloqueada</span>
                        <span v-else>{{ authStore.loading ? 'Cargando...' : 'Iniciar Sesión' }}</span>
                    </v-btn>
                </v-form>

                <!-- <p class="text-center text-grey-darken-1 mt-6">
                    ¿No tienes cuenta?
                    <router-link to="/register" class="text-primary text-decoration-none font-weight-bold">
                        Regístrate aquí
                    </router-link>
                </p> -->
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
    email: '',
    password: ''
})

const remainingTime = ref('')
let countdownInterval = null

// Calcular tiempo restante del bloqueo
const updateCountdown = () => {
    if (!authStore.rateLimitInfo?.lockedUntil) {
        remainingTime.value = ''
        return
    }

    const now = new Date()
    const lockUntil = new Date(authStore.rateLimitInfo.lockedUntil)
    const diff = lockUntil - now

    if (diff <= 0) {
        remainingTime.value = ''
        authStore.clearError()
        if (countdownInterval) {
            clearInterval(countdownInterval)
            countdownInterval = null
        }
        return
    }

    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    remainingTime.value = `${minutes}m ${seconds}s`
}

// Iniciar countdown cuando hay rate limit
watch(() => authStore.rateLimitInfo, (newVal) => {
    if (newVal?.lockedUntil) {
        updateCountdown()
        countdownInterval = setInterval(updateCountdown, 1000)
    } else {
        if (countdownInterval) {
            clearInterval(countdownInterval)
            countdownInterval = null
        }
    }
}, { immediate: true })

onMounted(() => {
    authStore.clearError()
})

// Limpiar intervalo al desmontar
onUnmounted(() => {
    if (countdownInterval) {
        clearInterval(countdownInterval)
    }
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