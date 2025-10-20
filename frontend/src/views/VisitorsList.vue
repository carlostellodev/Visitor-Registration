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
                <v-col class="d-flex flex-row">
                    <span>por cada visitante, un botón de descargar</span>
                    <v-btn size="small">Descargar</v-btn>
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