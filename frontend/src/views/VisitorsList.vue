<template>
    <ViewCard :tenant="tenant" subtitle="Listado de visitantes" content-class="pa-10 mt-n5" actions-class="mt-n5"
        :show-back-button="true" @back="goBack">
        <template #default>
            <v-row>
                <v-col>
                    Selector de fecha
                </v-col>
            </v-row>
            <v-row>
                <v-col>
                    Lista
                </v-col>
                <v-col class="d-flex flex-row ga-2">
                    <span>por cada visitante</span>
                    <v-btn variant="outlined" size="small">Descargar</v-btn>
                    <v-btn variant="outlined" size="small">Editar</v-btn>
                    <v-btn variant="outlined" size="small">Borrar</v-btn>
                </v-col>
            </v-row>
        </template>

        <template #actions>
            <v-col class="d-flex justify-end">
                <v-btn @click="handleClearForm" variant="outlined" prepend-icon="mdi-microsoft-excel">
                    Exportar lista
                </v-btn>
            </v-col>
        </template>
    </ViewCard>

    <!-- Implementar un v-dialog para preguntar por las acciones CRUD de los visitantes -->
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import ViewCard from '@/components/ViewCard.vue';

const router = useRouter();
const authStore = useAuthStore();

const tenant = computed(() => authStore.tenant);


function goBack() {
    router.go(-1);
}
</script>