<!-- <template>
    <div class="home-container">
        <div class="home-card">
            <div class="header">
                <h1>Bienvenido, {{ authStore.user?.name }}! 👋</h1>
                <button @click="handleLogout" class="btn-logout">
                    Cerrar Sesión
                </button>
            </div>

            <div class="user-info">
                <h2>Tu Perfil</h2>
                <div class="info-item">
                    <span class="label">Nombre:</span>
                    <span class="value">{{ authStore.user?.name }}</span>
                </div>
                <div class="info-item">
                    <span class="label">Email:</span>
                    <span class="value">{{ authStore.user?.email }}</span>
                </div>
                <div class="info-item">
                    <span class="label">ID:</span>
                    <span class="value">{{ authStore.user?._id }}</span>
                </div>
            </div>

            <div class="actions">
                <button @click="refreshUser" class="btn-secondary">
                    Actualizar Perfil
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
    console.log(authStore.user);
})

const handleLogout = () => {
    authStore.logout()
    router.push('/login')
}

const refreshUser = async () => {
    try {
        await authStore.fetchUser()
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
</style> -->

<template>
    <v-container fluid class="home-container pa-10">
        <v-card class="home-card mx-auto" max-width="800">
            <v-card-text class="pa-10">
                <!-- Header -->
                <v-row class="d-flex justify-space-between align-center flex-wrap mb-5">
                    <v-col>
                        <v-row>
                            <v-col>
                                <h1 class="text-h4 text-grey-darken-3">
                                    Bienvenido, {{ authStore.user?.name }}! 👋
                                </h1>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="auto">
                                <v-btn @click="refreshUser" color="primary" variant="flat" prepend-icon="mdi-refresh">
                                    Actualizar Perfil
                                </v-btn>
                            </v-col>
                            <v-col>
                                <v-btn @click="handleLogout" color="error" variant="flat" prepend-icon="mdi-logout">
                                    Cerrar Sesión
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>

                <!-- Información del Tenant -->
                <v-sheet class="user-info pa-8 mb-8" rounded="lg" color="grey-lighten-4">
                    <h2 class="text-h5 text-grey-darken-2 mb-5">Información del Tenant</h2>

                    <v-row dense class="info-item">
                        <v-col cols="12" sm="4" class="label font-weight-bold text-grey-darken-1">
                            Nombre:
                        </v-col>
                        <v-col cols="12" sm="8" class="value text-grey-darken-3">
                            {{ tenant?.name }}
                        </v-col>
                    </v-row>

                    <v-divider class="my-3"></v-divider>

                    <v-row dense class="info-item">
                        <v-col cols="12" sm="4" class="label font-weight-bold text-grey-darken-1">
                            Slug:
                        </v-col>
                        <v-col cols="12" sm="8" class="value text-grey-darken-3">
                            {{ tenant?.slug }}
                        </v-col>
                    </v-row>

                    <v-divider class="my-3"></v-divider>

                    <v-row dense class="info-item">
                        <v-col cols="12" sm="4" class="label font-weight-bold text-grey-darken-1">
                            Color Primario:
                        </v-col>
                        <v-col cols="12" sm="8" class="value text-grey-darken-3">
                            <v-chip :color="tenant?.theme?.primary" size="small">
                                {{ tenant?.theme?.primary }}
                            </v-chip>
                        </v-col>
                    </v-row>

                    <v-divider class="my-3"></v-divider>

                    <v-row dense class="info-item">
                        <v-col cols="12" sm="4" class="label font-weight-bold text-grey-darken-1">
                            Color Secundario:
                        </v-col>
                        <v-col cols="12" sm="8" class="value text-grey-darken-3">
                            <v-chip :color="tenant?.theme?.secondary" size="small">
                                {{ tenant?.theme?.secondary }}
                            </v-chip>
                        </v-col>
                    </v-row>
                </v-sheet>

                <!-- Tu Perfil -->
                <v-sheet class="user-info pa-8 mb-8" rounded="lg" color="grey-lighten-4">
                    <h2 class="text-h5 text-grey-darken-2 mb-5">Tu Perfil</h2>

                    <v-row dense class="info-item">
                        <v-col cols="12" sm="4" class="label font-weight-bold text-grey-darken-1">
                            Nombre:
                        </v-col>
                        <v-col cols="12" sm="8" class="value text-grey-darken-3">
                            {{ authStore.user?.name }}
                        </v-col>
                    </v-row>

                    <v-divider class="my-3"></v-divider>

                    <v-row dense class="info-item">
                        <v-col cols="12" sm="4" class="label font-weight-bold text-grey-darken-1">
                            Email:
                        </v-col>
                        <v-col cols="12" sm="8" class="value text-grey-darken-3">
                            {{ authStore.user?.email }}
                        </v-col>
                    </v-row>

                    <v-divider class="my-3"></v-divider>

                    <v-row dense class="info-item">
                        <v-col cols="12" sm="4" class="label font-weight-bold text-grey-darken-1">
                            Rol:
                        </v-col>
                        <v-col cols="12" sm="8" class="value text-grey-darken-3">
                            {{ authStore.user?.role }}
                        </v-col>
                    </v-row>

                    <v-divider class="my-3"></v-divider>

                    <v-row dense class="info-item">
                        <v-col cols="12" sm="4" class="label font-weight-bold text-grey-darken-1">
                            ID:
                        </v-col>
                        <v-col cols="12" sm="8" class="value text-grey-darken-3">
                            {{ authStore.user?._id }}
                        </v-col>
                    </v-row>
                </v-sheet>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useTheme } from 'vuetify';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const theme = useTheme();

const tenantSlug = computed(() => route.params.slug);
const tenant = computed(() => authStore.tenant);
const user = computed(() => authStore.user);

// Aplicar theme del tenant a Vuetify
watch(
    () => tenant.value?.theme,
    (newTheme) => {
        if (newTheme) {
            theme.themes.value.light.colors.primary = newTheme.primary || '#667eea';
            theme.themes.value.light.colors.secondary = newTheme.secondary || '#764ba2';
        }
    },
    { immediate: true }
);

onMounted(async () => {
    console.log(authStore.user);
    console.log(authStore.tenant);

    // Si no hay datos del usuario, cargarlos
    if (!authStore.user || !authStore.tenant) {
        try {
            await authStore.fetchProfile();

            // Verificar que el slug coincide con el tenant del usuario
            if (tenantSlug.value && authStore.tenantSlug !== tenantSlug.value) {
                console.warn('Slug no coincide con el tenant del usuario');
                router.push(`/home/${authStore.tenantSlug}`);
            }
        } catch (error) {
            console.error('Error al cargar perfil:', error);
            router.push('/login');
        }
    }
});

const handleLogout = () => {
    authStore.logout();
    router.push('/login');
};

const refreshUser = async () => {
    try {
        await authStore.fetchUser();
        alert('Perfil actualizado correctamente');
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
    }
};
</script>

<style scoped>
.home-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #1acd32 0%, #4ba298 100%);
}

.home-card {
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}
</style>