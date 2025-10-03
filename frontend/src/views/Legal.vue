<template>
    <v-container fluid class="legal-container d-flex align-center justify-center pa-4"
        :style="{ background: backgroundGradient }">
        <v-card class="legal-card" max-width="800" width="100%">
            <v-card-title class="text-h4 text-center pa-2 bg-primary text-white">
                Documentos Legales
            </v-card-title>

            <!-- Content -->
            <v-card-text v-if="currentDocument" class="pa-6">
                <!-- Document title and description -->
                <div class="mb-4 ">
                    <v-row>
                        <v-col>
                            <h2 class="text-h5 mb-2">{{ currentDocument.title }}</h2>
                            <p v-if="currentDocument.description" class="text-grey-darken-1">
                                {{ currentDocument.description }}
                            </p>
                        </v-col>
                        <v-col cols="auto">
                            <v-chip color="primary" variant="outlined" size="large">
                                Documento {{ currentStep + 1 }} de {{ documents.length }}
                            </v-chip>
                        </v-col>
                    </v-row>
                </div>

                <!-- PDF Viewer -->
                <v-sheet class="pdf-viewer mb-6" elevation="0" rounded>
                    <iframe :src="pdfViewerUrl" width="100%" height="600px"
                        style="border: none; border-radius: 8px;"></iframe>
                </v-sheet>

                <!-- Acceptance checkbox -->
                <v-card variant="outlined" class="pa-2">
                    <v-checkbox :model-value="hasAcceptedCurrent" @update:model-value="toggleAcceptance" color="primary"
                        hide-details>
                        <template v-slot:label>
                            <span class="text-body-1 font-weight-medium">
                                Manifiesto que he leído, comprendo y acepto:
                                <strong>{{ currentDocument.title }}</strong>
                            </span>
                        </template>
                    </v-checkbox>
                </v-card>

                <!-- Progress bar -->
                <!-- <v-progress-linear :model-value="(acceptedDocuments.length / documents.length) * 100" color="success"
                    height="20" rounded>
                    <template v-slot:default="{ value }">
                        <strong>{{ Math.ceil(value) }}%</strong>
                    </template>
                </v-progress-linear> -->
            </v-card-text>

            <!-- Loading state -->
            <v-card-text v-else-if="documentStore.loading" class="text-center pa-10">
                <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
                <p class="mt-4 text-grey-darken-1">Cargando documentos...</p>
            </v-card-text>

            <!-- Error state -->
            <v-card-text v-else-if="documentStore.error" class="pa-6">
                <v-alert type="error" variant="tonal">
                    {{ documentStore.error }}
                </v-alert>
            </v-card-text>

            <v-card-actions class="pa-3 mt-n6 d-flex justify-space-between ">
                <v-col cols="2">
                    <v-img height="50" :src="'/imgs/left-arrow.png'" class="cursor-pointer" @click="goBack" />
                </v-col>
                <v-col cols="auto" class="d-flex ga-4">
                    <v-btn v-if="currentStep > 0" @click="previousDocument" prepend-icon="mdi-chevron-left" size="large"
                        variant="outlined">
                        Anterior
                    </v-btn>
                    <v-btn @click="isLastDocument ? finishAndContinue() : nextDocument()"
                        :disabled="!hasAcceptedCurrent" :loading="loading" color="primary"
                        :prepend-icon="isLastDocument ? 'mdi-check-circle' : undefined"
                        :append-icon="!isLastDocument ? 'mdi-chevron-right' : undefined" size="large" variant="flat">
                        {{ isLastDocument ? 'Finalizar y Continuar' : 'Siguiente' }}
                    </v-btn>
                </v-col>
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
// import VuePdfEmbed from 'vue-pdf-embed';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useDocumentStore } from '../stores/documentStore';
import { useVisitStore } from '../stores/visitStore';

const router = useRouter();
const authStore = useAuthStore();
const documentStore = useDocumentStore();
const visitStore = useVisitStore();

const currentStep = ref(0);
const acceptedDocuments = ref([]);
const loading = ref(false);

const documents = computed(() => documentStore.requiredDocuments);
const currentDocument = computed(() => documents.value[currentStep.value]);
const isLastDocument = computed(() => currentStep.value === documents.value.length - 1);
const hasAcceptedCurrent = computed(() =>
    currentDocument.value && acceptedDocuments.value.includes(currentDocument.value._id)
);
const canProceed = computed(() => acceptedDocuments.value.length === documents.value.length);
const tenant = computed(() => authStore.tenant);

onMounted(async () => {
    if (!tenant.value?._id) {
        router.push('/login');
        return;
    }

    try {
        await documentStore.fetchDocumentsByTenant(tenant.value._id);

        if (documents.value.length === 0) {
            // Si no hay documentos, ir directo al formulario
            router.push(`/home/${tenant.value.slug}`);
        }
    } catch (error) {
        console.error('Error cargando documentos:', error);
    }
});

const toggleAcceptance = () => {
    if (!currentDocument.value) return;

    const index = acceptedDocuments.value.indexOf(currentDocument.value._id);
    if (index > -1) {
        acceptedDocuments.value.splice(index, 1);
    } else {
        acceptedDocuments.value.push(currentDocument.value._id);
    }
};

const nextDocument = () => {
    if (hasAcceptedCurrent.value && !isLastDocument.value) {
        currentStep.value++;
    }
};

const previousDocument = () => {
    if (currentStep.value > 0) {
        currentStep.value--;
    }
};

const finishAndContinue = async () => {
    if (!canProceed.value) {
        return;
    }

    loading.value = true;

    try {
        // Aquí más adelante guardaremos las aceptaciones en la BD
        // Por ahora solo redirigimos al home

        // Guardar documentos aceptados
        visitStore.saveAcceptedDocuments(acceptedDocuments.value);

        // Redirigir a la vista de firma
        //router.push(`/signature/${tenant.value.slug}`);

        router.push(`/home/${tenant.value.slug}`);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        loading.value = false;
    }
};

const pdfViewerUrl = computed(() => {
    if (!currentDocument.value?.fileUrl) return '';
    return `https://docs.google.com/viewer?url=${encodeURIComponent(currentDocument.value.fileUrl)}&embedded=true&chrome=false`;
});

const backgroundGradient = computed(() => {
    const primary = tenant.value?.theme?.primary || '#667eea';
    const secondary = tenant.value?.theme?.secondary || '#764ba2';
    // return `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`;
    return `${secondary}`;
});

const goBack = () => {
    router.push(`/home/${tenant.value.slug}`);
};

</script>

<style scoped>
.legal-container {
    min-height: 100vh;
    /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
}

.legal-card {
    border-radius: 0px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.pdf-viewer {
    border-radius: 8px;
    overflow: hidden;
    background: #f5f5f5;
}

.pdf-embed {
    width: 100%;
    min-height: 600px;
}
</style>