<template>
    <ViewCard :tenant="tenant" content-class="pa-6" actions-class="mt-n6" @back="goBack">
        <!-- Contenido principal -->
        <template #default>
            <!-- Datos de la visita -->
            <v-card variant="outlined" class="mb-3">
                <v-card-title class="bg-grey-lighten-4">
                    Datos de la visita
                </v-card-title>
                <v-card-text class="pa-4">
                    <v-row dense>
                        <v-col cols="12" sm="6">
                            <div class="mb-2">
                                <div class="text-caption text-grey-darken-1">Nombre y apellidos</div>
                                <div class="text-h6 font-weight-medium">{{ formData.name }}</div>
                            </div>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <div class="mb-2">
                                <div class="text-caption text-grey-darken-1">Empresa</div>
                                <div class="text-h6 font-weight-medium">{{ formData.company }}</div>
                            </div>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <div class="mb-2">
                                <div class="text-caption text-grey-darken-1">Motivo</div>
                                <div class="text-h6">{{ getPurposeNames(formData.purpose) }}</div>
                            </div>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <div class="mb-2">
                                <div class="text-caption text-grey-darken-1">Zona de acceso</div>
                                <div class="text-h6">{{ getAreaNames(formData.accessZone) }}</div>
                            </div>
                        </v-col>
                        <v-col cols="12" sm="6" v-if="formData.plate">
                            <div>
                                <div class="text-caption text-grey-darken-1">Matrícula</div>
                                <div class="text-h6">{{ formData.plate }}</div>
                            </div>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <div>
                                <div class="text-caption text-grey-darken-1">Responsable</div>
                                <div class="text-h6">{{ formData.worker?.name || 'No especificado' }}</div>
                            </div>
                        </v-col>
                    </v-row>
                </v-card-text>

                <!-- Firma -->
                <v-card-title class="mt-n2 d-flex justify-space-between align-center">
                    <span>Firma:</span>
                    <v-btn @click="clearSignature" variant="outlined" size="small" prepend-icon="mdi-eraser"
                        color="error">
                        Limpiar
                    </v-btn>
                </v-card-title>
                <v-card-text>
                    <div class="signature-pad-wrapper">
                        <VueSignature ref="signatureRef" :sigOption="{ penColor: 'rgb(0, 0, 0)' }" :w="'100%'"
                            :h="'180px'" @end="handleEnd" />
                    </div>
                    <v-divider class="my-2" />
                    <div class="text-center text-caption text-grey-darken-1">
                        Firme en el recuadro superior
                    </div>
                </v-card-text>
            </v-card>

            <!-- Alert informativo -->
            <v-alert type="info" variant="outlined" class="mt-3 pa-3">
                <p class="text-body-1 font-weight-medium">
                    Manifiesto que he leído, comprendo y acepto las normativas mostradas previamente
                </p>
            </v-alert>
        </template>

        <!-- Acciones personalizadas -->
        <template #actions>
            <v-col cols="auto">
                <v-btn @click="submitVisit" :disabled="!hasSignature" :loading="loading" color="primary" variant="flat"
                    size="x-large" prepend-icon="mdi-check-circle" class="pa-3">
                    Confirmar y Finalizar
                </v-btn>
            </v-col>
        </template>
    </ViewCard>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/utils/api';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useDocumentStore } from '@/stores/documentStore';
import { useVisitStore } from '../stores/visitStore';
import { useWorkerStore } from '@/stores/workerStore';
import VueSignature from 'vue3-signature';
import { getVisitPDFBlob } from '../utils/pdfGenerator';
import { useToastComposable } from '@/composables/useToast';
import ViewCard from '@/components/ViewCard.vue';

const { showToast } = useToastComposable();

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

onMounted(() => {
    if (!formData.value.name || !formData.value.company) {
        console.log("Saliendo", formData.value);
        router.push(`/home/${tenant.value.slug}`);
    }
});

const getPurposeNames = (purposes) => {
    return purposes.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ');
};

const getAreaNames = (areas) => {
    return areas.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ');
};

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
        showToast('Por favor, firma el documento antes de continuar', 'error');
        return;
    }

    loading.value = true;

    try {
        const signatureData = signatureRef.value.save();

        const visitDataComplete = {
            ...formData.value,
            signature: signatureData,
            workerName: formData.value.worker?.name || formData.value.worker,
            tenantId: tenant.value._id,
        };

        // Generar PDF
        // await downloadVisitPDF(
        //     visitDataComplete,
        //     tenant.value,
        //     `visita_${formData.value.name}_${Date.now()}.pdf`
        // );

        const pdfBlob = await getVisitPDFBlob(visitDataComplete, tenant.value);

        const documentsAcceptedFormatted = visitStore.acceptedDocuments.map(docId => ({
            documentId: docId,
            acceptedAt: new Date().toISOString()
        }));

        const pdfData = new FormData();
        pdfData.append('pdf', pdfBlob, `visita_${Date.now()}.pdf`);
        pdfData.append('name', visitDataComplete.name);
        pdfData.append('company', visitDataComplete.company);
        pdfData.append('plate', visitDataComplete.plate || '');
        pdfData.append('purpose', JSON.stringify(visitDataComplete.purpose));
        pdfData.append('accessZone', JSON.stringify(visitDataComplete.accessZone));
        pdfData.append('workerId', visitDataComplete.worker?._id || '');
        pdfData.append('tenantId', visitDataComplete.tenantId);
        pdfData.append('signature', signatureData);
        pdfData.append('documentsAccepted', JSON.stringify(documentsAcceptedFormatted));

        const response = await api.post('/visitors', pdfData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        showToast('Visita registrada con éxito');
        visitStore.clearVisit();
        router.push(`/home/${authStore.tenant.slug}`);
    } catch (error) {
        console.error('Error al registrar visita:', error);
        showToast('Error al registrar la visita', 'error');
    } finally {
        loading.value = false;
    }
};

const goBack = () => {
    router.push(`/legal/${tenant.value.slug}`);
};
</script>

<style scoped>
.signature-pad-wrapper {
    border: 2px dashed #ccc;
    border-radius: 8px;
    overflow: hidden;
    background: white;
}
</style>