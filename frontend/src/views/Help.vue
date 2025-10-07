<template>
    <v-container fluid class="view-container d-flex align-center justify-center pa-4">
        <v-card class="view-card" max-width="800" width="100%">
            <v-card-title class="text-h5 text-center bg-primary text-white">
                <v-img height="50" :src="tenant.theme.logoUrl" />
                <div>{{ tenant?.name }}</div>
            </v-card-title>
            <v-card-text class="pa-6">
                <v-card variant="outlined" class="mb-3">
                    <v-card-title class="bg-grey-lighten-4">
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

                    <v-card-title class="bg-grey-lighten-4">
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
            </v-card-text>
            <v-card-actions class="pa-3 mt-n9 ml-n3">
                <v-col cols="2">
                    <v-img height="50"
                        src="https://res.cloudinary.com/dpzkb97cs/image/upload/v1759774671/left-arrow_listjp.png"
                        class="cursor-pointer" @click="goBack" />
                </v-col>
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

const tenantSlug = computed(() => route.params.slug);
const tenant = computed(() => authStore.tenant);

onMounted(async () => {
    if (!tenant.value?._id) {
        router.push('/login');
        return;
    }

});

function goBack() {
    router.go(-1);
}
</script>