<template>
    <ViewCard :tenant="tenant" subtitle="Instrucciones generales de acceso a las instalaciones"
        content-class="pa-10 mt-n4" actions-class="mt-n15" :show-back-button="false" @back="handleLogout">
        <!-- Contenido -->
        <template #default>
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
                    <span class="text-h6">Responsable que acompaña la visita</span>
                    <v-select density="compact" variant="outlined" :items="workers" v-model="selectedWorker"
                        return-object item-title="name" item-value="value" />
                </v-col>
                <v-col>
                    <span class="text-h6">Matrícula (opcional)</span>
                    <v-text-field density="compact" variant="outlined" v-model="form.plate" />
                </v-col>
            </v-row>
        </template>

        <!-- Acciones personalizadas -->
        <template #actions>
            <v-col class="ml-4 mb-1">
                <v-row>
                    <v-col cols="auto">
                        <v-btn @click="handleLogout" color="error" variant="flat" prepend-icon="mdi-logout">
                            Cerrar Sesión
                        </v-btn>
                    </v-col>
                    <v-col cols="auto">
                        <v-btn @click="handleClearForm" variant="outlined" prepend-icon="mdi-eraser">
                            Limpiar formulario
                        </v-btn>
                    </v-col>
                </v-row>
            </v-col>
            <v-col cols="2" class="mr-n3">
                <v-img height="50"
                    src="https://res.cloudinary.com/dpzkb97cs/image/upload/v1759945629/right-arrow_jusgkq.png"
                    class="cursor-pointer" @click="handleSubmit" />
            </v-col>
        </template>
    </ViewCard>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useWorkerStore } from '../stores/workerStore';
import { useVisitStore } from '../stores/visitStore';
import { useToastComposable } from '@/composables/useToast';
import ViewCard from '@/components/ViewCard.vue';

const { showToast } = useToastComposable();

const tenantSlug = computed(() => route.params.slug);
const tenant = computed(() => authStore.tenant);

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const workerStore = useWorkerStore();
const visitStore = useVisitStore();

const form = ref({
    name: '',
    company: '',
    plate: '',
    purpose: [],
    accessZone: []
});
const selectedWorker = ref(null);

onMounted(async () => {
    if (!authStore.user || !authStore.tenant) {
        try {
            await authStore.fetchUser();
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
const purposeOptions = computed(() => tenant.value?.config?.allowedPurposes || []);
const areaOptions = computed(() => tenant.value?.config?.allowedAccessZones || []);

function handleSubmit() {
    if (!form.value.name || !form.value.company || !selectedWorker.value ||
        form.value.purpose.length === 0 || form.value.accessZone.length === 0) {
        showToast('Hay campos sin rellenar', 'error');
        return;
    }

    visitStore.saveFormData({
        ...form.value,
        worker: selectedWorker.value.raw || selectedWorker.value || null,
    });

    const tenant = tenantSlug.value || null;
    router.push(`/legal/${tenant}`);
}

function handleLogout() {
    authStore.logout();
    router.push('/login');
}

function handleClearForm() {
    visitStore.clearVisit();
    form.value = {
        name: '',
        company: '',
        plate: '',
        purpose: [],
        accessZone: []
    };
    selectedWorker.value = null;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
</script>