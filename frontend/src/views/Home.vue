<template>
    <v-container fluid class="home-container pa-10" :style="{ background: backgroundGradient }">

        <v-row>
            <v-col class="text-center mb-5 ">
                <h2 class="mb-4 text-center text-decoration-underline">
                    Instrucciones generales de acceso a las instalaciones
                </h2>
            </v-col>
        </v-row>
        <v-card class="home-card mx-auto" max-width="800">
            <v-card-text class="pa-10">

                <v-row class="d-flex justify-space-between">
                    <v-col cols="auto">
                        <v-btn @click="refreshStores" color="primary" variant="flat" prepend-icon="mdi-refresh">
                            Recargar página
                        </v-btn>
                    </v-col>
                    <v-col cols="auto">
                        <v-btn @click="handleLogout" color="error" variant="flat" prepend-icon="mdi-logout">
                            Cerrar Sesión
                        </v-btn>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <span class="text-h6">Nombre y apellidos</span>
                        <v-text-field density="compact" variant="outlined" v-model="form.name" />
                    </v-col>
                    <v-col>
                        <span class="text-h6">Empresa</span>
                        <v-text-field density="compact" variant="outlined" v-model="form.company" />
                    </v-col>
                </v-row>
                <v-row class="mt-n4">

                </v-row>
                <div class="d-flex justify-space-evenly ga-4 mt-4 mb-2">
                    <!-- Motivos -->
                    <v-card flat>
                        <p class="font-weight-medium mb-2 text-h6">Motivo:</p>
                        <v-checkbox v-for="purpose in purposeOptions" :key="purpose" v-model="form.purpose"
                            :label="capitalize(purpose)" :value="purpose" hide-details density="comfortable" />
                    </v-card>

                    <!-- Zonas de acceso-->
                    <v-card flat>
                        <p class="font-weight-medium mb-2 text-h6">Zona de acceso:</p>
                        <v-checkbox v-for="area in areaOptions" :key="area" v-model="form.accessZone"
                            :label="capitalize(area)" :value="area" hide-details density="comfortable" />
                    </v-card>
                </div>
                <v-row class="mt-n4">
                    <v-col>
                        <span class="text-h6">Resposable que acompaña la visita</span>
                        <v-select density="compact" variant="outlined" :items="workers" v-model="form.worker" />
                    </v-col>
                    <v-col>
                        <span class="text-h6">Matrícula (opcional)</span>
                        <v-text-field density="compact" variant="outlined" v-model="form.plate" />
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions class="pa-3 mt-n14 d-flex justify-end ">
                <v-col cols="2">
                    <v-img height="50" :src="'/imgs/right-arrow.png'" class="cursor-pointer" @click="enviar" />
                </v-col>
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useWorkerStore } from '../stores/workerStore';
import { useTheme } from 'vuetify';
import { useToastComposable } from '@/composables/useToast';

const { showToast } = useToastComposable();

const tenantSlug = computed(() => route.params.slug);
const tenant = computed(() => authStore.tenant);
const user = computed(() => authStore.user);

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const workerStore = useWorkerStore();
const theme = useTheme();

const form = ref({
    name: '',
    company: '',
    plate: '',
    worker: null,
    purpose: [],
    accessZone: []
})

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

    if (tenant.value?._id) {
        await workerStore.fetchWorkersByTenant(tenant.value._id);
    }

});

const workers = computed(() => workerStore.workerOptions);

//-----------------------------------------------------------------------------
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
//-----------------------------------------------------------------------------


//-----------------------------------------------------------------------------
// Computed para el gradiente de fondo dinámico
const backgroundGradient = computed(() => {
    const primary = tenant.value?.theme?.primary || '#667eea';
    const secondary = tenant.value?.theme?.secondary || '#764ba2';
    // return `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`;
    return `${secondary}`;
});

// Computeds para los checkboxes dinámicos
const purposeOptions = computed(() => {
    return tenant.value?.config?.allowedPurposes || [];
});

const areaOptions = computed(() => {
    return tenant.value?.config?.allowedAccessZones || [];
});
//-----------------------------------------------------------------------------


//-----------------------------------------------------------------------------
function enviar() {
    if (!form.value.name || !form.value.company || !form.value.worker || form.value.purpose.length === 0 || form.value.accessZone.length === 0) {
        showToast('Hay campos sin rellenar', 'error')
        return
    }
    const tenant = tenantSlug.value || null
    console.log('Payload de ejemplo', { tenantSlug: tenant, ...form.value })
    showToast('Registro confirmado')
}

function handleLogout() {
    authStore.logout();
    router.push('/login');
};

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

const refreshStores = async () => {
    try {
        await authStore.fetchUser();
        await workerStore.fetchWorkersByTenant(tenant.value._id);
        showToast('Perfil actualizado correctamente');
    } catch (error) {
        console.error('Error al actualizar la página:', error);
    }
};
//-----------------------------------------------------------------------------

</script>

<style scoped>
.home-container {
    min-height: 100vh;
}

.home-card {
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}
</style>