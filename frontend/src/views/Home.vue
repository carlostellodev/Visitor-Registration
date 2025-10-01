<template>
    <div class="home-container">
        <div class="home-card">
            <div class="header">
                <h1>Bienvenido, {{ authStore.currentUser?.name }}! 👋</h1>
                <button @click="handleLogout" class="btn-logout">
                    Cerrar Sesión
                </button>
            </div>

            <div class="user-info">
                <h2>Tu Perfil</h2>
                <div class="info-item">
                    <span class="label">Nombre:</span>
                    <span class="value">{{ authStore.currentUser?.name }}</span>
                </div>
                <div class="info-item">
                    <span class="label">Email:</span>
                    <span class="value">{{ authStore.currentUser?.email }}</span>
                </div>
                <div class="info-item">
                    <span class="label">ID:</span>
                    <span class="value">{{ authStore.currentUser?._id }}</span>
                </div>
            </div>

            <div class="actions">
                <button @click="refreshProfile" class="btn-secondary">
                    Actualizar Perfil
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
    authStore.logout()
    router.push('/login')
}

const refreshProfile = async () => {
    try {
        await authStore.fetchProfile()
        alert('Perfil actualizado correctamente')
    } catch (error) {
        console.error('Error al actualizar perfil:', error)
    }
}
</script>

<style scoped>
.home-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 40px 20px;
}

.home-card {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    border-radius: 12px;
    padding: 40px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
    flex-wrap: wrap;
    gap: 20px;
}

h1 {
    margin: 0;
    color: #333;
    font-size: 28px;
}

h2 {
    margin: 0 0 20px 0;
    color: #555;
    font-size: 20px;
}

.btn-logout {
    padding: 10px 20px;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.3s;
}

.btn-logout:hover {
    opacity: 0.9;
}

.user-info {
    background: #f8f9fa;
    padding: 30px;
    border-radius: 8px;
    margin-bottom: 30px;
}

.info-item {
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid #dee2e6;
}

.info-item:last-child {
    border-bottom: none;
}

.label {
    font-weight: 600;
    color: #666;
}

.value {
    color: #333;
}

.actions {
    display: flex;
    gap: 15px;
    justify-content: center;
}

.btn-secondary {
    padding: 12px 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.3s;
}

.btn-secondary:hover {
    opacity: 0.9;
}
</style>