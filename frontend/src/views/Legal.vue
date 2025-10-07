<template>
    <ViewCard :tenant="tenant" content-class="pa-6" :actions-class="currentDocument?.isRequired ? 'mt-n7' : 'mt-n12'"
        @back="goBack">
        <!-- Contenido principal -->
        <template #default>
            <div v-if="currentDocument">
                <!-- Document title and description -->
                <div class="mb-4">
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
                <vue-pdf-app style="height: 100vh;" :pdf="currentDocument.fileUrl" :page-scale="'page-width'"
                    :page-number="1" :config="pdfConfig" class="mb-6" />

                <!-- Acceptance checkbox -->
                <v-card v-if="currentDocument.isRequired" variant="outlined" class="pl-1">
                    <v-checkbox :model-value="hasAcceptedCurrent" @update:model-value="toggleAcceptance" color="primary"
                        hide-details>
                        <template v-slot:label>
                            <span class="text-body-1 font-weight-medium ml-2">
                                Manifiesto que he leído, comprendo y acepto:
                                <strong>{{ currentDocument.title }}</strong>
                            </span>
                        </template>
                    </v-checkbox>
                </v-card>
            </div>

            <!-- Loading state -->
            <div v-else-if="documentStore.loading" class="text-center pa-10">
                <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
                <p class="mt-4 text-grey-darken-1">Cargando documentos...</p>
            </div>

            <!-- Error state -->
            <div v-else-if="documentStore.error">
                <v-alert type="error" variant="tonal">
                    {{ documentStore.error }}
                </v-alert>
            </div>
        </template>

        <!-- Acciones personalizadas -->
        <template #actions>
            <v-col cols="auto" class="d-flex ga-4">
                <v-btn v-if="currentStep > 0" @click="previousDocument" prepend-icon="mdi-chevron-left" size="large"
                    variant="outlined">
                    Anterior
                </v-btn>
                <v-btn @click="isLastDocument ? finishAndContinue() : nextDocument()" :disabled="!hasAcceptedCurrent"
                    :loading="loading" color="primary" :prepend-icon="isLastDocument ? 'mdi-check-circle' : undefined"
                    :append-icon="!isLastDocument ? 'mdi-chevron-right' : undefined" size="large" variant="flat">
                    {{ isLastDocument ? 'Finalizar y Continuar' : 'Siguiente' }}
                </v-btn>
            </v-col>
        </template>
    </ViewCard>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useDocumentStore } from '../stores/documentStore';
import { useVisitStore } from '../stores/visitStore';
import ViewCard from '@/components/ViewCard.vue';

import VuePdfApp from "vue3-pdf-app";
import "vue3-pdf-app/dist/icons/main.css";

const pdfConfig = {
    toolbar: {
        toolbarViewerLeft: {
            findbar: false
        },
        toolbarViewerRight: {
            presentationMode: true,
            openFile: false,
            print: false,
            download: true,
            viewBookmark: false,
        },
    },
    secondaryToolbar: false,
}

const router = useRouter();
const authStore = useAuthStore();
const documentStore = useDocumentStore();
const visitStore = useVisitStore();

const currentStep = ref(0);
const acceptedDocuments = ref([]);
const loading = ref(false);

const documents = computed(() => documentStore.activeDocuments);
const currentDocument = computed(() => documents.value[currentStep.value]);
const isLastDocument = computed(() => currentStep.value === documents.value.length - 1);
const hasAcceptedCurrent = computed(() =>
    (currentDocument.value && acceptedDocuments.value.includes(currentDocument.value._id)) ||
    !currentDocument.value?.isRequired
);
const canProceed = computed(() => acceptedDocuments.value.length === documents.value.length);
const tenant = computed(() => authStore.tenant);

// const pdfViewerUrl = computed(() => {
//     if (!currentDocument.value?.fileUrl) return '';
//     return `https://docs.google.com/viewer?url=${encodeURIComponent(currentDocument.value.fileUrl)}&embedded=true&chrome=false`;
// });

onMounted(async () => {
    if (!tenant.value?._id) {
        router.push('/login');
        return;
    }

    try {
        await documentStore.fetchDocumentsByTenant(tenant.value._id);

        if (documents.value.length === 0) {
            router.push(`/home/${tenant.value.slug}`);
        }
    } catch (error) {
        console.error('Error cargando documentos:', error);
    }

    if (visitStore.acceptedDocuments) {
        acceptedDocuments.value = visitStore.acceptedDocuments;
    }

    if (visitStore.currentStep) {
        currentStep.value = visitStore.currentStep;
    }
});

onUnmounted(() => {
    visitStore.saveAcceptedDocuments(acceptedDocuments.value);
    visitStore.saveCurrentStep(currentStep.value);
});

const toggleAcceptance = () => {
    if (!currentDocument.value) return;

    const index = acceptedDocuments.value.indexOf(currentDocument.value._id);
    if (index > -1) {
        acceptedDocuments.value.splice(index, 1);
    } else if (!acceptedDocuments.value.includes(currentDocument.value._id)) {
        acceptedDocuments.value.push(currentDocument.value._id);
    }
};

const nextDocument = () => {
    if (!currentDocument.value.isRequired && !acceptedDocuments.value.includes(currentDocument.value._id)) {
        acceptedDocuments.value.push(currentDocument.value._id);
    }
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
    if (!currentDocument.value.isRequired) {
        acceptedDocuments.value.push(currentDocument.value._id);
    }

    if (!canProceed.value) {
        return;
    }

    loading.value = true;

    try {
        visitStore.saveAcceptedDocuments(acceptedDocuments.value);
        visitStore.saveCurrentStep(currentStep.value);
        router.push(`/signature/${tenant.value.slug}`);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        loading.value = false;
    }
};

const goBack = () => {
    visitStore.saveAcceptedDocuments(acceptedDocuments.value);
    visitStore.saveCurrentStep(currentStep.value);
    router.push(`/home/${tenant.value.slug}`);
};
</script>