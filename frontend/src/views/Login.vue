<template>
    <v-container fluid class="view-container d-flex align-center justify-center">
        <v-card class="view-card" max-width="400" width="100%">
            <v-card-text class="pa-10">
                <h1 class="text-h4 text-center text-grey-darken-3 mb-8">Iniciar Sesión</h1>

                <v-form ref="formRef" @submit.prevent="handleLogin">
                    <v-text-field v-model="form.email" label="Email" type="email" placeholder="tu@email.com"
                        variant="outlined" density="comfortable" prepend-inner-icon="mdi-email" :rules="emailRules"
                        :disabled="authStore.loading || authStore.isRateLimited" autocomplete="email" maxlength="100"
                        required class="mb-4">
                    </v-text-field>

                    <v-text-field v-model="form.password" label="Contraseña" :type="showPassword ? 'text' : 'password'"
                        placeholder="••••••••" variant="outlined" density="comfortable" prepend-inner-icon="mdi-lock"
                        :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                        @click:append-inner="showPassword = !showPassword" :rules="passwordRules"
                        :disabled="authStore.loading || authStore.isRateLimited" autocomplete="current-password"
                        maxlength="128" required class="mb-4">
                    </v-text-field>

                    <!-- Alerta de Rate Limiting -->
                    <v-alert v-if="authStore.isRateLimited" title="Cuenta bloqueada" icon="mdi-shield-lock"
                        type="warning" variant="tonal" density="compact" class="mb-4 mt-n5 " border="start">
                        <v-col>
                            <v-row>
                                <div class="text-caption">{{ authStore.rateLimitInfo.details }}</div>
                            </v-row>

                        </v-col>
                        <v-col class="ml-13 mb-2">
                            <v-row>
                                <v-chip color="error" variant="flat" class="mt-2" size="small">
                                    <v-icon icon="mdi-clock-outline" size="small" start></v-icon>
                                    {{ remainingTime }}
                                </v-chip>
                            </v-row>
                        </v-col>
                    </v-alert>

                    <!-- Alerta de Error General -->
                    <v-alert v-else-if="authStore.error" type="error" variant="tonal" density="compact"
                        class="mb-4 mt-n5">
                        {{ authStore.error }}
                    </v-alert>

                    <v-btn type="submit" :loading="authStore.loading"
                        :disabled="authStore.loading || authStore.isRateLimited || !isFormValid" color="primary" block
                        size="large">
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref(null)
const showPassword = ref(false)

const form = ref({
    email: '',
    password: ''
})

const remainingTime = ref('')
let countdownInterval = null

// Reglas de validación para email
const emailRules = [
    v => !!v || 'El email es requerido',
    v => /.+@.+\..+/.test(v) || 'Email inválido',
    v => v.length <= 100 || 'Email demasiado largo',
    v => !/[<>\"'%;()&+]/.test(v) || 'Caracteres no permitidos en email'
]

// Reglas de validación para contraseña
const passwordRules = [
    v => !!v || 'La contraseña es requerida',
    v => v.length >= 6 || 'Mínimo 6 caracteres',
    v => v.length <= 128 || 'Contraseña demasiado larga',
    v => !/[<>\"'%;()&]/.test(v) || 'Caracteres no permitidos'
]

// Validar si el formulario es válido
const isFormValid = computed(() => {
    if (!form.value.email || !form.value.password) return false

    const emailValid = emailRules.every(rule => {
        const result = rule(form.value.email)
        return result === true
    })

    const passwordValid = passwordRules.every(rule => {
        const result = rule(form.value.password)
        return result === true
    })

    return emailValid && passwordValid
})

// Sanitizar input - remover caracteres peligrosos
const sanitizeInput = (input) => {
    if (!input) return ''
    return input
        .trim()
        .replace(/[<>\"'%;()&+]/g, '') // Remover caracteres peligrosos
        .slice(0, 200) // Limitar longitud máxima
}

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
    // Validar formulario antes de enviar
    const { valid } = await formRef.value.validate()
    if (!valid) return

    try {
        authStore.clearError()

        // Sanitizar inputs antes de enviar
        const sanitizedData = {
            email: sanitizeInput(form.value.email),
            password: form.value.password.trim() // No sanitizar password, solo trim
        }

        const result = await authStore.login(sanitizedData)

        // Redirigir a home con el slug del tenant
        const tenantSlug = result.user?.tenant?.slug
        if (tenantSlug) {
            router.push(`/home/${tenantSlug}`)
        } else {
            router.push('/home')
        }
    } catch (error) {
        console.error('Error en login:', error)
    }
}
</script>