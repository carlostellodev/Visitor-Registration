<template>
    <v-dialog v-model="dialogModel" max-width="600">
        <v-card>
            <v-card-title class="text-h5 d-flex align-center bg-primary">
                <v-icon class="mr-2">mdi-download</v-icon>
                Exportar visitantes
            </v-card-title>

            <v-card-text>
                <v-form ref="formRef">
                    <!-- Formato de exportación -->
                    <div class="mb-4">
                        <p class="d-flex align-center text-subtitle-1 font-weight-medium mb-2">
                            <v-icon size="small" class="mr-2">mdi-file-document</v-icon>
                            Formato de exportación
                        </p>
                        <v-radio-group v-model="exportFormat" inline class="d-flex ml-n2">
                            <v-radio label="PDF" value="pdf" color="error">
                                <template v-slot:label>
                                    <div class="d-flex align-center">
                                        <v-icon color="error" class="mr-2">mdi-file-pdf-box</v-icon>
                                        <span>PDF</span>
                                    </div>
                                </template>
                            </v-radio>
                            <v-radio label="Excel" value="excel" color="success" class="ml-4">
                                <template v-slot:label>
                                    <div class="d-flex align-center">
                                        <v-icon color="success" class="mr-2">mdi-microsoft-excel</v-icon>
                                        <span>Excel</span>
                                    </div>
                                </template>
                            </v-radio>
                        </v-radio-group>
                    </div>

                    <v-divider class="mb-4"></v-divider>

                    <!-- Rango de fechas -->
                    <div class="mb-2">
                        <p class="text-subtitle-1 font-weight-medium mb-3">
                            <v-icon size="small" class="mr-1">mdi-calendar-range</v-icon>
                            Período de datos
                        </p>
                        <v-select v-model="dateRangeOption" :items="dateRangeOptions" item-title="label"
                            item-value="value" variant="outlined" density="comfortable"
                            prepend-inner-icon="mdi-calendar" @update:model-value="handleDateRangeChange"></v-select>
                    </div>

                    <!-- Selector de fechas personalizado -->
                    <v-expand-transition>
                        <div v-if="dateRangeOption === 'custom'" class="mb-1 mt-n2">
                            <v-row>
                                <v-col cols="12" sm="6">
                                    <v-menu v-model="showStartDatePicker" :close-on-content-click="false">
                                        <template v-slot:activator="{ props }">
                                            <v-text-field v-bind="props" :model-value="formattedStartDate"
                                                label="Fecha inicio" prepend-inner-icon="mdi-calendar-start"
                                                variant="outlined" density="comfortable" readonly
                                                :rules="[v => !!v || 'Fecha inicio requerida']"></v-text-field>
                                        </template>
                                        <v-date-picker v-model="customStartDate" color="primary"
                                            :max="customEndDate || new Date()"
                                            @update:model-value="showStartDatePicker = false"></v-date-picker>
                                    </v-menu>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-menu v-model="showEndDatePicker" :close-on-content-click="false">
                                        <template v-slot:activator="{ props }">
                                            <v-text-field v-bind="props" :model-value="formattedEndDate"
                                                label="Fecha fin" prepend-inner-icon="mdi-calendar-end"
                                                variant="outlined" density="comfortable" readonly
                                                :rules="[v => !!v || 'Fecha fin requerida']"></v-text-field>
                                        </template>
                                        <v-date-picker v-model="customEndDate" color="primary" :min="customStartDate"
                                            :max="new Date()"
                                            @update:model-value="showEndDatePicker = false"></v-date-picker>
                                    </v-menu>
                                </v-col>
                            </v-row>
                        </div>
                    </v-expand-transition>

                    <!-- Información del rango seleccionado -->
                    <v-alert v-if="selectedDateInfo" type="info" variant="tonal" density="compact"
                        class="py-3 mb-2 mt-n1">
                        <div class="d-flex align-center">
                            <span>{{ selectedDateInfo }}</span>
                        </div>
                    </v-alert>
                </v-form>
            </v-card-text>

            <v-card-actions class="ma-4 mb-4 mt-n5 ga-4" :class="selectedDateInfo ? 'mt-n5' : 'mt-n9'">
                <v-spacer></v-spacer>
                <v-btn @click="handleCancel" variant="tonal" :disabled="loading">
                    Cancelar
                </v-btn>
                <v-btn @click="handleExport" :color="exportFormat === 'excel' ? 'green' : 'error'" variant="flat"
                    :loading="loading"
                    :prepend-icon="exportFormat === 'excel' ? 'mdi-microsoft-excel' : 'mdi-file-pdf-box'">
                    Exportar
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

// Props
const props = defineProps({
    modelValue: {
        type: Boolean,
        required: true
    }
});

// Emits
const emit = defineEmits(['update:modelValue', 'export']);

// Estados
const formRef = ref(null);
const loading = ref(false);
const exportFormat = ref('pdf');
const dateRangeOption = ref('today');
const showStartDatePicker = ref(false);
const showEndDatePicker = ref(false);
const customStartDate = ref(null);
const customEndDate = ref(null);

// Computed para v-model del diálogo
const dialogModel = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit('update:modelValue', value);
    }
});

// Opciones de rango de fechas
const dateRangeOptions = [
    { label: 'Hoy', value: 'today' },
    { label: 'Esta semana', value: 'thisWeek' },
    { label: 'Últimos 30 días', value: 'last30Days' },
    { label: 'Este mes', value: 'thisMonth' },
    { label: 'Personalizado', value: 'custom' }
];

// Formatear fechas para mostrar
const formattedStartDate = computed(() => {
    if (!customStartDate.value) return '';
    return formatDate(customStartDate.value);
});

const formattedEndDate = computed(() => {
    if (!customEndDate.value) return '';
    return formatDate(customEndDate.value);
});

// Obtener etiqueta del rango de fechas
const getDateRangeLabel = computed(() => {
    const option = dateRangeOptions.find(opt => opt.value === dateRangeOption.value);

    if (dateRangeOption.value === 'custom') {
        if (customStartDate.value && customEndDate.value) {
            return `${formatDate(customStartDate.value)} - ${formatDate(customEndDate.value)}`;
        }
        return 'Selecciona fechas';
    }

    return option?.label || '';
});

// Información del rango seleccionado
const selectedDateInfo = computed(() => {
    const { startDate, endDate } = getDateRange();

    if (!startDate || !endDate) return null;

    // Normalizar fechas a medianoche para comparación exacta
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    // Calcular días inclusivos 
    const days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (dateRangeOption.value === 'today' || dateRangeOption.value === 'thisWeek') {
        return;
    }

    return `Se exportarán los datos de ${days} día${days !== 1 ? 's' : ''}`;
});

// Funciones auxiliares
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

function getDateRange() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let startDate, endDate;

    switch (dateRangeOption.value) {
        case 'today':
            startDate = new Date(today);
            endDate = new Date(today);
            endDate.setHours(23, 59, 59, 999);
            break;

        case 'thisWeek':
            const dayOfWeek = today.getDay();
            const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
            startDate = new Date(today);
            startDate.setDate(diff);
            endDate = new Date(today);
            endDate.setHours(23, 59, 59, 999);
            break;

        case 'last30Days':
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 29);
            endDate = new Date(today);
            endDate.setHours(23, 59, 59, 999);
            break;

        case 'thisMonth':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today);
            endDate.setHours(23, 59, 59, 999);
            break;

        case 'custom':
            if (customStartDate.value && customEndDate.value) {
                startDate = new Date(customStartDate.value);
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(customEndDate.value);
                endDate.setHours(23, 59, 59, 999);
            }
            break;
    }

    return { startDate, endDate };
}

function handleDateRangeChange(value) {
    if (value === 'custom') {
        // Inicializar fechas personalizadas con el mes actual
        const today = new Date();
        customStartDate.value = new Date(today.getFullYear(), today.getMonth(), 1);
        customEndDate.value = new Date(today);
    }
}

async function handleExport() {
    // Validar formulario si es personalizado
    if (dateRangeOption.value === 'custom') {
        const { valid } = await formRef.value.validate();
        if (!valid) return;
    }

    const { startDate, endDate } = getDateRange();

    if (!startDate || !endDate) {
        return;
    }

    loading.value = true;

    try {
        // Emitir evento de exportación con los datos
        emit('export', {
            format: exportFormat.value,
            dateRange: dateRangeOption.value,
            startDate,
            endDate
        });

        // Cerrar el diálogo después de un breve delay
        setTimeout(() => {
            dialogModel.value = false;
            loading.value = false;
        }, 500);
    } catch (error) {
        console.error('Error en exportación:', error);
        loading.value = false;
    }
}

function handleCancel() {
    dialogModel.value = false;
}

// Resetear formulario cuando se cierra el diálogo
watch(dialogModel, (newValue) => {
    if (!newValue) {
        // Resetear valores al cerrar
        setTimeout(() => {
            exportFormat.value = 'pdf';
            dateRangeOption.value = 'today';
            customStartDate.value = null;
            customEndDate.value = null;
        }, 300);
    }
});
</script>