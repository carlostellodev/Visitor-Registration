<template>
    <div class="auth-container">
        <div class="auth-card">
            <h1>Crear Cuenta</h1>

            <form @submit.prevent="handleRegister">
                <div class="form-group">
                    <label for="name">Nombre</label>
                    <input id="name" v-model="form.name" type="text" placeholder="Tu nombre" required />
                </div>

                <div class="form-group">
                    <label for="email">Email</label>
                    <input id="email" v-model="form.email" type="email" placeholder="tu@email.com" required />
                </div>

                <div class="form-group">
                    <label for="password">Contraseña</label>
                    <input id="password" v-model="form.password" type="password" placeholder="Mínimo 6 caracteres"
                        required minlength="6" />
                </div>

                <div v-if="authStore.error" class="error-message">
                    {{ authStore.error }}
                </div>

                <button type="submit" :disabled="authStore.loading" class="btn-primary">
                    {{ authStore.loading ? 'Cargando...' : 'Registrarse' }}
                </button>
            </form>

            <p class="auth-footer">
                ¿Ya tienes cuenta?
                <router-link to="/login">Inicia sesión aquí</router-link>
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
    name: '',
    email: '',
    password: ''
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

<style scoped>
.auth-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
}

.auth-card {
    background: white;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
}

h1 {
    margin: 0 0 30px 0;
    color: #333;
    text-align: center;
}

.form-group {
    margin-bottom: 20px;
}

label {
    display: block;
    margin-bottom: 8px;
    color: #555;
    font-weight: 500;
}

input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.3s;
    box-sizing: border-box;
}

input:focus {
    outline: none;
    border-color: #667eea;
}

.btn-primary {
    width: 100%;
    padding: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.3s;
}

.btn-primary:hover {
    opacity: 0.9;
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.error-message {
    background: #fee;
    color: #c33;
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 20px;
    font-size: 14px;
}

.auth-footer {
    margin-top: 20px;
    text-align: center;
    color: #666;
    font-size: 14px;
}

.auth-footer a {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
}

.auth-footer a:hover {
    text-decoration: underline;
}
</style>