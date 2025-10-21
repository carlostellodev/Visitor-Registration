<template>
    <ViewCard :tenant="tenant" content-class="pa-6" actions-class="mt-n9 ml-n3" @back="goBack">
        <v-card variant="outlined" class="mb-3">
            <v-card-title class="bg-grey-lighten-3">
                Datos de la empresa
            </v-card-title>
            <v-card-text class="pa-4">
                <v-row dense>
                    <v-col cols="12" sm="6">
                        <div class="mb-2">
                            <div class="text-caption text-grey-darken-1">Empresa</div>
                            <div class="text-h6 font-weight-medium">{{ authStore.tenant.name }}</div>
                        </div>
                    </v-col>
                    <v-col cols="12" sm="6">
                        <div class="mb-2">
                            <div class="text-caption text-grey-darken-1">Email</div>
                            <div class="text-h6 font-weight-medium">{{ authStore.tenant.email }}</div>
                        </div>
                    </v-col>
                    <v-col cols="12" sm="6">
                        <div class="mb-2">
                            <div class="text-caption text-grey-darken-1">Teléfono</div>
                            <div class="text-h6 font-weight-medium">{{ authStore.tenant.phone }}</div>
                        </div>
                    </v-col>
                    <v-col cols="12" sm="6">
                        <div class="mb-2">
                            <div class="text-caption text-grey-darken-1">Dirección</div>
                            <div class="text-h6 font-weight-medium">{{ authStore.tenant.address }}</div>
                        </div>
                    </v-col>
                </v-row>
            </v-card-text>

            <v-card-title class="bg-grey-lighten-3">
                Datos del desarrollador
            </v-card-title>
            <v-card-text class="pa-4">
                <v-row dense>
                    <v-col cols="12" sm="6">
                        <div class="mb-2">
                            <div class="text-caption text-grey-darken-1">Nombre</div>
                            <div class="text-h6 font-weight-medium">Carlos Tello</div>
                        </div>
                    </v-col>
                    <v-col cols="12" sm="6">
                        <div class="mb-2">
                            <div class="text-caption text-grey-darken-1">Email</div>
                            <div class="text-h6 font-weight-medium">carlostello.dev@gmail.com</div>
                        </div>
                    </v-col>
                    <v-col cols="12" sm="6">
                        <div class="mb-2">
                            <div class="text-caption text-grey-darken-1">Teléfono</div>
                            <div class="text-h6 font-weight-medium">+34 633061793</div>
                        </div>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
    </ViewCard>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import ViewCard from '@/components/ViewCard.vue';

const router = useRouter();
const authStore = useAuthStore();

const tenant = computed(() => authStore.tenant);

onMounted(async () => {
    if (!tenant.value?._id) {
        router.push('/login');
    }
});

function goBack() {
    router.go(-1);
}
</script>