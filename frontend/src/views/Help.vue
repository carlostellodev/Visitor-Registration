<template>
    <v-container fluid class="view-container d-flex align-center justify-center pa-4">
        <v-card class="view-card" max-width="800" width="100%">
            <v-card-title class="text-h5 text-center bg-primary text-white">
                <v-avatar v-if="tenant?.theme?.logoUrl" size="60" class="mr-4">
                    <v-img :src="tenant.theme.logoUrl" />
                </v-avatar>
                <div>{{ tenant?.name }}</div>
            </v-card-title>
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
</script>