<template>
    <v-container fluid class="view-container d-flex align-center justify-center pa-4">
        <v-card class="view-card" :max-width="maxWidth" width="100%">
            <!-- Header -->
            <v-card-title class="text-h5 text-center bg-primary text-white">
                <v-img v-if="showLogo && tenant?.theme?.logoUrl" :src="tenant.theme.logoUrl" height="60" />
                <div class="d-flex flex-column align-center">
                    <div v-if="tenant?.name">{{ tenant.name }}</div>
                    <div v-if="subtitle" class="text-h6 mt-1">{{ subtitle }}</div>
                </div>
            </v-card-title>

            <!-- Contenido principal -->
            <v-card-text :class="contentClass">
                <slot />
            </v-card-text>

            <!-- Acciones / Navegación -->
            <v-card-actions v-if="showActions" class="pa-3 d-flex justify-space-between" :class="actionsClass">
                <!-- Botón atrás -->
                <v-col v-if="showBackButton" cols="2" class="ml-n3">
                    <v-img height="50"
                        src="https://res.cloudinary.com/dpzkb97cs/image/upload/v1759774671/left-arrow_listjp.png"
                        class="cursor-pointer" @click="handleBack" />
                </v-col>

                <!-- Acciones personalizadas -->
                <slot name="actions" />
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
    // Datos del tenant
    tenant: {
        type: Object,
        default: null
    },

    // Subtítulo debajo del nombre del tenant
    subtitle: {
        type: String,
        default: ''
    },

    // Mostrar logo en el header
    showLogo: {
        type: Boolean,
        default: true
    },

    // Ancho máximo de la card
    maxWidth: {
        type: [String, Number],
        default: 800
    },

    // Clases adicionales para el contenido
    contentClass: {
        type: String,
        default: 'pa-6'
    },

    // Mostrar sección de acciones
    showActions: {
        type: Boolean,
        default: true
    },

    // Clases adicionales para las acciones
    actionsClass: {
        type: String,
        default: ''
    },

    // Mostrar botón de retroceso
    showBackButton: {
        type: Boolean,
        default: true
    },

    // Ruta personalizada para el botón de retroceso
    backRoute: {
        type: String,
        default: null
    }
});

const emit = defineEmits(['back']);

const handleBack = () => {
    emit('back');

    if (!emit('back')) {
        router.go(-1);
    }
};
</script>