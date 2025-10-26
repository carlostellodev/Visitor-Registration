<template>
    <ViewCard :tenant="tenant" subtitle="Instrucciones generales de acceso a las instalaciones"
        content-class="pa-10 mt-n5" actions-class="mt-n15" :show-back-button="false">
        <!-- Contenido -->
        <template #default>
            <v-row>
                <v-col>
                    <v-row>
                        <v-col>
                            <span class="text-h6">Nombre y apellidos</span>
                            <v-text-field density="compact" variant="outlined" v-model="form.name" :rules="nameRules"
                                maxlength="100" counter placeholder="Ej: Juan Pérez García" @input="sanitizeName" />
                        </v-col>
                    </v-row>
                    <v-row class="mt-n6">
                        <v-col>
                            <span class="text-h6">Empresa</span>
                            <v-text-field density="compact" variant="outlined" v-model="form.company"
                                :rules="companyRules" maxlength="100" counter placeholder="Ej: Empresa S.L."
                                @input="sanitizeCompany" />
                        </v-col>
                    </v-row>
                </v-col>
                <v-col v-if="!xs">
                    <v-img height="170" :src="tenant.theme.logoUrl" />
                </v-col>
            </v-row>

            <div class="d-flex justify-space-evenly ga-4 mt-1 mb-3" :class="xs ? 'flex-column mt-n1' : ''">
                <!-- Motivos -->
                <v-card flat>
                    <p class="font-weight-medium mb-1 text-h6">Motivo:</p>

                    <!-- Select para pantallas xs -->
                    <v-select v-if="xs" v-model="form.purpose" :items="purposeOptions"
                        :item-title="item => capitalize(item)" :item-value="item => item" multiple chips closable-chips
                        density="comfortable" variant="outlined" placeholder="Seleccione motivos" />

                    <!-- Checkboxes para pantallas más grandes -->
                    <template v-else>
                        <v-checkbox v-for="purpose in purposeOptions" :key="purpose" v-model="form.purpose"
                            :label="capitalize(purpose)" :value="purpose" hide-details density="comfortable"
                            class="mt-n1" />
                    </template>
                </v-card>

                <!-- Zonas de acceso-->
                <v-card flat :class="xs ? 'mt-n4' : ''">
                    <p class="font-weight-medium mb-1 text-h6">Zona de acceso:</p>

                    <!-- Select para pantallas xs -->
                    <v-select v-if="xs" v-model="form.accessZone" :items="areaOptions"
                        :item-title="item => capitalize(item)" :item-value="item => item" multiple chips closable-chips
                        density="comfortable" variant="outlined" placeholder="Seleccione zonas" />

                    <!-- Checkboxes para pantallas más grandes -->
                    <template v-else>
                        <v-checkbox v-for="area in areaOptions" :key="area" v-model="form.accessZone"
                            :label="capitalize(area)" :value="area" hide-details density="comfortable" class="mt-n1" />
                    </template>
                </v-card>
            </div>

            <v-row class="mt-n5">
                <v-col>
                    <v-row>
                        <v-col>
                            <span class="text-h6">Responsable que acompaña la visita</span>

                        </v-col>
                        <v-col class="d-flex align-end">
                            <span class="text-h6">Matrícula (opcional)</span>
                        </v-col>
                    </v-row>
                    <v-row class="mt-n6">
                        <v-col>
                            <v-select density="compact" variant="outlined" :items="workers" v-model="selectedWorker"
                                return-object item-title="name" item-value="value" :rules="workerRules"
                                placeholder="Seleccione una opción" />
                        </v-col>
                        <v-col>
                            <v-text-field density="compact" variant="outlined" v-model="form.plate" :rules="plateRules"
                                maxlength="15" counter placeholder="Ej: 1234ABC" @input="sanitizePlate" />
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </template>

        <!-- Acciones personalizadas -->
        <template #actions>
            <v-col class="ml-4 mb-1">
                <v-row>
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useWorkerStore } from '../stores/workerStore';
import { useVisitStore } from '../stores/visitStore';
import { useToastComposable } from '@/composables/useToast';
import ViewCard from '@/components/ViewCard.vue';
import { useDisplay } from 'vuetify'
const { md, xs } = useDisplay()

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

// ============ REGLAS DE VALIDACIÓN ============
// Reglas para nombre
const nameRules = [
    v => !!v || 'El nombre es requerido',
    v => v.length >= 3 || 'Mínimo 3 caracteres',
    v => v.length <= 100 || 'Máximo 100 caracteres',
    v => /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(v) || 'Solo letras, espacios, guiones y apóstrofes',
    v => !/[<>\"%;()&+\[\]{}=]/.test(v) || 'Caracteres no permitidos'
];

// Reglas para empresa
const companyRules = [
    v => !!v || 'La empresa es requerida',
    v => v.length >= 2 || 'Mínimo 2 caracteres',
    v => v.length <= 100 || 'Máximo 100 caracteres',
    v => /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,'&-]+$/.test(v) || 'Caracteres no válidos para empresa',
    v => !/[<>\"%;()[\]{}=]/.test(v) || 'Caracteres no permitidos'
];

// Reglas para matrícula
const plateRules = [
    v => !v || v.length <= 15 || 'Máximo 15 caracteres',
    v => !v || /^[a-zA-Z0-9\s-]+$/.test(v) || 'Solo letras, números, espacios y guiones',
    v => !v || !/[<>\"'%;()&+\[\]{}=]/.test(v) || 'Caracteres no permitidos'
];

// Reglas para trabajador
const workerRules = [
    v => !!v || 'Selecciona un responsable'
];

// ============ FUNCIONES DE SANITIZACIÓN ============
// Sanitizar nombre (solo letras, espacios, guiones y apóstrofes)
const sanitizeName = (event) => {
    const value = event.target.value;
    form.value.name = value
        .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]/g, '')
        .replace(/\s{2,}/g, ' ') // Máximo un espacio consecutivo
        .slice(0, 100);
};

// Sanitizar empresa (letras, números, espacios y algunos caracteres especiales permitidos)
const sanitizeCompany = (event) => {
    const value = event.target.value;
    form.value.company = value
        .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,'&-]/g, '')
        .replace(/\s{2,}/g, ' ')
        .slice(0, 100);
};

// Sanitizar matrícula (solo letras, números, espacios y guiones)
const sanitizePlate = (event) => {
    const value = event.target.value;
    form.value.plate = value
        .toUpperCase()
        .replace(/[^A-Z0-9\s-]/g, '')
        .replace(/\s{2,}/g, ' ')
        .slice(0, 15);
};

// Sanitizar input general para envío al backend
const sanitizeInput = (input) => {
    if (!input || typeof input !== 'string') return '';
    return input
        .trim()
        .replace(/[<>\"'%;()&+\[\]{}=]/g, '')
        .replace(/\s{2,}/g, ' ');
};

// Validar arrays (purpose y accessZone)
const validateArray = (arr, fieldName) => {
    if (!Array.isArray(arr) || arr.length === 0) {
        return false;
    }
    // Verificar que todos los elementos sean strings seguros
    return arr.every(item =>
        typeof item === 'string' &&
        item.length > 0 &&
        item.length < 50 &&
        !/[<>\"'%;()&+\[\]{}=]/.test(item)
    );
};

// ============ LIFECYCLE ============
onMounted(async () => {
    window.scrollTo(0, 0);
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

    if (visitStore.formData) {
        form.value = visitStore.formData;
        if (visitStore.formData.worker) selectedWorker.value = form.value.worker;
    }

    if (tenant.value?._id) {
        await workerStore.fetchWorkersByTenant(tenant.value._id);
    }
});

onUnmounted(() => {
    // Validar reglas de los campos
    const nameValid = nameRules.every(rule => rule(form.value.name) === true);
    const companyValid = companyRules.every(rule => rule(form.value.company) === true);
    const plateValid = plateRules.every(rule => rule(form.value.plate) === true);

    if (!nameValid || !companyValid || !plateValid) {
        return;
    }

    // Sanitizar datos antes de guardar
    const sanitizedData = {
        name: sanitizeInput(form.value.name),
        company: sanitizeInput(form.value.company),
        plate: sanitizeInput(form.value.plate),
        purpose: form.value.purpose.map(p => sanitizeInput(p)),
        accessZone: form.value.accessZone.map(z => sanitizeInput(z)),
        worker: selectedWorker?.value?.raw || selectedWorker?.value || null,
    };

    visitStore.saveFormData(sanitizedData);
});

// ============ COMPUTED ============
const workers = computed(() => workerStore.workerOptions);
const purposeOptions = computed(() => tenant.value?.config?.allowedPurposes || []);
const areaOptions = computed(() => tenant.value?.config?.allowedAccessZones || []);

// ============ MÉTODOS ============
function handleSubmit() {
    // Validaciones
    if (!form.value.name || !form.value.company || !selectedWorker.value) {
        showToast('Completa todos los campos obligatorios', 'error');
        return;
    }

    if (!validateArray(form.value.purpose, 'purpose') && !validateArray(form.value.accessZone, 'accessZone')) {
        showToast('Selecciona al menos un motivo y una zona de acceso válidos', 'error');
        return;
    }

    if (!validateArray(form.value.purpose, 'purpose')) {
        showToast('Selecciona al menos un motivo válido', 'error');
        return;
    }

    if (!validateArray(form.value.accessZone, 'accessZone')) {
        showToast('Selecciona al menos una zona de acceso válida', 'error');
        return;
    }

    // Validar reglas de los campos
    const nameValid = nameRules.every(rule => rule(form.value.name) === true);
    const companyValid = companyRules.every(rule => rule(form.value.company) === true);
    const plateValid = plateRules.every(rule => rule(form.value.plate) === true);

    if (!nameValid || !companyValid || !plateValid) {
        showToast('Corrige los errores en el formulario', 'error');
        return;
    }

    // Sanitizar datos antes de guardar
    const sanitizedData = {
        name: sanitizeInput(form.value.name),
        company: sanitizeInput(form.value.company),
        plate: sanitizeInput(form.value.plate),
        purpose: form.value.purpose.map(p => sanitizeInput(p)),
        accessZone: form.value.accessZone.map(z => sanitizeInput(z)),
        worker: selectedWorker.value.raw || selectedWorker.value || null,
    };

    // Validación final de longitudes
    if (sanitizedData.name.length < 3 || sanitizedData.company.length < 2) {
        showToast('Los datos sanitizados no cumplen los requisitos mínimos', 'error');
        return;
    }

    visitStore.saveFormData(sanitizedData);

    const tenant = tenantSlug.value || null;
    router.push(`/legal/${tenant}`);
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

<style scoped>
.checkbox-error-alert {
    position: absolute;
    bottom: -50px;
    left: 50%;
    transform: translateX(-50%);
    width: 90%;
    max-width: 500px;
    z-index: 10;
}
</style>