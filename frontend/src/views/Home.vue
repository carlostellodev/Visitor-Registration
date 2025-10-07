<template>
    <v-container fluid class="view-container pa-10">
        <v-card class="view-card mx-auto" max-width="800">
            <v-card-title class="text-h5 text-center bg-primary text-white">
                <v-img height="50" :src="tenant.theme.logoUrl" />
                <div>{{ tenant?.name }}</div>
                Instrucciones generales de acceso a las instalaciones
            </v-card-title>

            <v-card-text class="pa-10 mt-n4">
                <v-row>
                    <v-col>
                        <v-row>
                            <v-col>
                                <span class="text-h6">Nombre y apellidos</span>
                                <v-text-field density="compact" variant="outlined" v-model="form.name" />
                            </v-col>
                        </v-row>
                        <v-row class="mt-n4">
                            <v-col>
                                <span class="text-h6">Empresa</span>
                                <v-text-field density="compact" variant="outlined" v-model="form.company" />
                            </v-col>
                        </v-row>
                    </v-col>
                    <v-col>
                        <v-img height="190" :src="tenant.theme.logoUrl" />
                    </v-col>
                </v-row>
                <div class="d-flex justify-space-evenly ga-4 mt-4 mb-3">
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
                        <v-select density="compact" variant="outlined" :items="workers" v-model="selectedWorker"
                            return-object item-title="name" item-value="value" />
                    </v-col>
                    <v-col>
                        <span class="text-h6">Matrícula (opcional)</span>
                        <v-text-field density="compact" variant="outlined" v-model="form.plate" />
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions class="pa-3 mt-n16 d-flex justify-space-between ">
                <v-col class="ml-4">
                    <v-row>
                        <v-col cols="auto">
                            <v-btn @click="handleLogout" color="error" variant="flat" prepend-icon="mdi-logout">
                                Cerrar Sesión
                            </v-btn>
                        </v-col>
                        <v-col cols="auto">
                            <v-btn @click="handleClearForm" variant="outlined" prepend-icon="mdi-logout">
                                Limpiar formulario
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col cols="2" class="mr-n3">
                    <v-img height="50"
                        src="https://res.cloudinary.com/dpzkb97cs/image/upload/v1759774671/right-arrow_zj696p.png"
                        class="cursor-pointer" @click="handleSubmit" />
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
import { useVisitStore } from '../stores/visitStore';
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
const visitStore = useVisitStore();
const theme = useTheme();

const form = ref({
    name: '',
    company: '',
    plate: '',
    purpose: [],
    accessZone: []
})
const selectedWorker = ref(null);

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

    if (visitStore.formData && visitStore.formData.worker) {
        form.value = visitStore.formData;
        selectedWorker.value = form.value.worker;
    }

    if (tenant.value?._id) {
        await workerStore.fetchWorkersByTenant(tenant.value._id);
    }

});

const workers = computed(() => workerStore.workerOptions);

// Computeds para los checkboxes dinámicos
const purposeOptions = computed(() => {
    return tenant.value?.config?.allowedPurposes || [];
});

const areaOptions = computed(() => {
    return tenant.value?.config?.allowedAccessZones || [];
});
//-----------------------------------------------------------------------------


//-----------------------------------------------------------------------------
function handleSubmit() {
    if (!form.value.name || !form.value.company || !selectedWorker.value ||
        form.value.purpose.length === 0 || form.value.accessZone.length === 0) {
        showToast('Hay campos sin rellenar', 'error');
        return;
    }

    // Guardar datos del formulario en el store
    visitStore.saveFormData({
        ...form.value,
        worker: selectedWorker.value.raw || selectedWorker.value || null,  //Guardamos el objeto completo del responsable
    });

    const tenant = tenantSlug.value || null;
    //showToast('Registro confirmado');

    // Redirigir a Legal
    router.push(`/legal/${tenant}`);
}

function handleLogout() {
    authStore.logout();
    router.push('/login');
};

function handleClearForm() {
    visitStore.clearVisit();
    form.value = {
        name: '',
        company: '',
        plate: '',
        purpose: [],
        accessZone: []
    }
    selectedWorker.value = null;
};

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
//-----------------------------------------------------------------------------

</script>

<style scoped></style>