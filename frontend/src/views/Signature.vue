<template>
    <v-container fluid class="sinature-container d-flex align-center justify-center pa-4"
        :style="{ background: backgroundGradient }">
        <v-card class="legal-card" max-width="800" width="100%">
            <v-card-title class="text-h4 text-center pa-6 bg-primary text-white d-flex align-center justify-center">
                <v-avatar v-if="tenant?.theme?.logoUrl" size="60" class="mr-4">
                    <v-img :src="tenant.theme.logoUrl" />
                </v-avatar>
                <div>{{ tenant?.name }}</div>
            </v-card-title>

            <v-card-subtitle class="text-center pt-4 text-h6">
                Instrucciones generales de acceso a las instalaciones
            </v-card-subtitle>

            <v-divider class="my-4" />

            <v-card-text class="pa-6">
                <v-alert type="success" variant="tonal" class="mb-6">
                    <v-row align="center">
                        <v-col>
                            <strong>Normativa leída:</strong>
                            <p v-for="doc in documentsTitle">
                                {{ doc }}
                            </p>
                        </v-col>
                    </v-row>
                </v-alert>

                <v-card variant="outlined" class="mb-6">
                    <v-card-title class="bg-grey-lighten-4">
                        Datos de la visita
                    </v-card-title>
                    <v-card-text class="pa-4">
                        <v-row dense>
                            <v-col cols="12" sm="6">
                                <div class="mb-3">
                                    <div class="text-caption text-grey-darken-1">Nombre y apellidos</div>
                                    <div class="text-body-1 font-weight-medium">{{ formData.name }}</div>
                                </div>
                            </v-col>
                            <v-col cols="12" sm="6">
                                <div class="mb-3">
                                    <div class="text-caption text-grey-darken-1">Empresa</div>
                                    <div class="text-body-1 font-weight-medium">{{ formData.tenant }}</div>
                                </div>
                            </v-col>
                            <v-col cols="12" sm="6">
                                <div class="mb-3">
                                    <div class="text-caption text-grey-darken-1">Motivo</div>
                                    <div class="text-body-1">{{ getPurposeNames(formData.purpose) }}</div>
                                </div>
                            </v-col>
                            <v-col cols="12" sm="6">
                                <div class="mb-3">
                                    <div class="text-caption text-grey-darken-1">Zona de acceso</div>
                                    <div class="text-body-1">{{ getAreaNames(formData.accessZone) }}</div>
                                </div>
                            </v-col>
                            <v-col cols="12" sm="6" v-if="formData.plate">
                                <div class="mb-3">
                                    <div class="text-caption text-grey-darken-1">Matrícula</div>
                                    <div class="text-body-1">{{ formData.plate }}</div>
                                </div>
                            </v-col>
                            <v-col cols="12" sm="6">
                                <div class="mb-3">
                                    <div class="text-caption text-grey-darken-1">Responsable</div>
                                    <div class="text-body-1">{{ workerName }}</div>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>

                <v-alert type="info" variant="outlined" class="mb-6">
                    <p class="text-body-2 mb-0">
                        Manifiesto que he leído, comprendo y acepto las normativas mencionadas
                    </p>
                </v-alert>

                <v-card variant="outlined">
                    <v-card-title class="d-flex justify-space-between align-center">
                        <span>Firma:</span>
                        <v-btn @click="clearSignature" variant="text" size="small" prepend-icon="mdi-eraser"
                            color="error">
                            Limpiar
                        </v-btn>
                    </v-card-title>
                    <v-card-text>
                        <div class="signature-pad-wrapper">
                            <VueSignature ref="signatureRef" :sigOption="{ penColor: 'rgb(0, 0, 0)' }" :w="'100%'"
                                :h="'200px'" @endStroke="handleEnd" />
                        </div>
                        <v-divider class="my-2" />
                        <div class="text-center text-caption text-grey-darken-1">
                            Firme en el recuadro superior
                        </div>
                    </v-card-text>
                </v-card>


            </v-card-text>
            <v-card-actions class="pa-3 mt-n6 d-flex justify-space-between ">
                <v-col cols="2">
                    <v-img height="50" :src="'/imgs/left-arrow.png'" class="cursor-pointer" @click="goBack" />
                </v-col>
                <v-col cols="auto">
                    <v-btn @click="submitVisit" :disabled="!hasSignature" :loading="loading" color="primary"
                        variant="flat" size="x-large" prepend-icon="mdi-check-circle">
                        Confirmar y Finalizar
                    </v-btn>
                </v-col>
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useDocumentStore } from '@/stores/documentStore';
import { useVisitStore } from '../stores/visitStore';
import { useWorkerStore } from '@/stores/workerStore';
import VueSignature from 'vue3-signature';

const router = useRouter();
const authStore = useAuthStore();
const documentStore = useDocumentStore();
const visitStore = useVisitStore();
const workerStore = useWorkerStore();

const signatureRef = ref(null);
const hasSignature = ref(false);
const loading = ref(false);

const formData = computed(() => visitStore.formData);
const tenant = computed(() => authStore.tenant);
const documentsTitle = computed(() => documentStore.documents.map(d => d.title));
const workerName = computed(() => {
    const worker = workerStore.workers.find(w => w._id === formData.value.worker);
    return worker?.name || 'No especificado';
});

const getPurposeNames = (purposes) => {
    return purposes.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ');
};

const getAreaNames = (areas) => {
    return areas.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ');
};

onMounted(() => {
    if (!formData.value.name || !formData.value.tenant) {
        router.push(`/home/${authStore.tenant.slug}`);
    }
});

const clearSignature = () => {
    if (signatureRef.value) {
        signatureRef.value.clear();
        hasSignature.value = false;
    }
};

const handleEnd = () => {
    hasSignature.value = !signatureRef.value.isEmpty();
};

const submitVisit = async () => {
    if (!hasSignature.value) {
        alert('Por favor, firma el documento antes de continuar');
        return;
    }

    loading.value = true;

    try {
        const signatureData = signatureRef.value.save();
        visitStore.saveSignature(signatureData);

        alert('Visita registrada exitosamente');
        visitStore.clearVisit();
        router.push(`/home/${authStore.tenant.slug}`);
    } catch (error) {
        console.error('Error al registrar visita:', error);
        alert('Error al registrar la visita');
    } finally {
        loading.value = false;
    }
};

const backgroundGradient = computed(() => {
    const primary = tenant.value?.theme?.primary || '#667eea';
    const secondary = tenant.value?.theme?.secondary || '#764ba2';
    // return `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`;
    return `${secondary}`;
});

const goBack = () => {
    router.push(`/legal/${tenant.value.slug}`);
};
</script>

<style scoped>
.signature-container {
    min-height: 100vh;
    background: #f5f5f5;
}

.legal-card {
    border-radius: 0px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.signature-pad-wrapper {
    border: 2px dashed #ccc;
    border-radius: 8px;
    overflow: hidden;
    background: white;
}
</style>