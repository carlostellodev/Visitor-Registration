<template>
    <v-container fluid class="home-container pa-10" :style="{ background: backgroundGradient }">
        <v-card class="home-card mx-auto" max-width="800">
            <v-card-text class="pa-10">
                <!-- Header -->
                <v-row class="d-flex justify-space-between align-center flex-wrap mb-5">
                    <v-col>
                        <v-row>
                            <v-col>
                                <h1 class="text-h4 text-grey-darken-3">
                                    Bienvenido, {{ user?.name }}! 👋
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
                            {{ user?.name }}
                        </v-col>
                    </v-row>

                    <v-divider class="my-3"></v-divider>

                    <v-row dense class="info-item">
                        <v-col cols="12" sm="4" class="label font-weight-bold text-grey-darken-1">
                            Email:
                        </v-col>
                        <v-col cols="12" sm="8" class="value text-grey-darken-3">
                            {{ user?.email }}
                        </v-col>
                    </v-row>

                    <v-divider class="my-3"></v-divider>

                    <v-row dense class="info-item">
                        <v-col cols="12" sm="4" class="label font-weight-bold text-grey-darken-1">
                            Rol:
                        </v-col>
                        <v-col cols="12" sm="8" class="value text-grey-darken-3">
                            {{ user?.role }}
                        </v-col>
                    </v-row>

                    <v-divider class="my-3"></v-divider>

                    <v-row dense class="info-item">
                        <v-col cols="12" sm="4" class="label font-weight-bold text-grey-darken-1">
                            ID:
                        </v-col>
                        <v-col cols="12" sm="8" class="value text-grey-darken-3">
                            {{ user?._id }}
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

// Computed para el gradiente de fondo dinámico
const backgroundGradient = computed(() => {
    const primary = tenant.value?.theme?.primary || '#667eea';
    const secondary = tenant.value?.theme?.secondary || '#764ba2';
    return `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`;
});

onMounted(async () => {
    // Si no hay datos del usuario, cargarlos
    if (!authStore.user || !authStore.tenant) {
        try {
            await authStore.fetchUser();

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
}

.home-card {
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}
</style>