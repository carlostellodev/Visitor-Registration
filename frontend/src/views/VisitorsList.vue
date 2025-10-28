<template>
    <ViewCard :tenant="tenant" subtitle="Registro histórico de visitantes a las instalaciones"
        content-class="pa-10 mt-n5" actions-class="mt-n10" :show-back-button="true" @back="goBack">
        <template #default>
            <v-row class="mt-n2 mb-n1">
                <!-- Selector de fecha -->
                <v-col cols="12" md="6">
                    <v-card variant="tonal" class="d-flex align-center cursor-pointer flex-column bg-grey-lighten"
                        @click="showDatePicker = true" :ripple="false">
                        <v-card-text class="d-flex align-center justify-space-between w-100 pa-5">
                            <div>
                                <div class="text-h6 mb-3">Seleccionar fecha</div>
                                <div class="text-h4 font-weight-bold">
                                    {{ formattedSelectedDate }}
                                </div>
                            </div>
                            <v-icon size="70">mdi-calendar</v-icon>
                        </v-card-text>
                        <v-fade-transition>
                            <v-card-text v-show="!isToday" class="w-100 mt-n5">
                                <v-btn color="#3d3d3d" variant="flat" @click.stop="clearFilters" block
                                    prepend-icon="mdi-refresh" class="return-pointer" :ripple="false">
                                    Volver a hoy
                                </v-btn>
                            </v-card-text>
                        </v-fade-transition>
                    </v-card>
                </v-col>

                <!-- Número de visitantes -->
                <v-col cols="12" md="6">
                    <v-card variant="outlined" color="primary" class="d-flex align-center flex-column">
                        <v-card-text class="d-flex align-center justify-space-between w-100 pa-5">
                            <div>
                                <div class="text-h3 font-weight-bold">{{ visitors.length }}</div>
                                <div class="text-h5 ">
                                    <span>{{ visitors.length === 1 ? 'Visitante ' : 'Visitantes' }}</span>
                                    <span v-if="isToday"> hoy</span>
                                </div>
                            </div>
                            <v-icon v-if="visitors.length > 0" size="70" color="primary">mdi-account-multiple</v-icon>
                            <v-icon v-else size="70" color="primary">mdi-account-off</v-icon>
                        </v-card-text>
                        <!-- <v-fade-transition>
                            <v-card-text v-show="!isToday" class="w-100 mt-n5">
                                <v-btn color="primary" variant="flat" @click="clearFilters" block
                                    prepend-icon="mdi-account-plus" class="return-pointer" :ripple="false">
                                    Crear nuevo registro
                                </v-btn>
                            </v-card-text>
                        </v-fade-transition> -->
                    </v-card>
                </v-col>
            </v-row>

            <!-- Tabla de visitantes -->
            <v-row>
                <v-col cols="12">
                    <v-card variant="outlined" class="mt-n2">
                        <v-card-title class="d-flex align-center bg-grey-lighten-3">
                            <v-icon class="mr-2">mdi-clipboard-text</v-icon>
                            Lista de visitantes
                            <v-spacer></v-spacer>
                            <v-text-field v-if="!xs" v-model="search" density="compact" placeholder="Buscar..."
                                prepend-inner-icon="mdi-magnify" variant="outlined" hide-details single-line
                                style="max-width: 300px;" clearable class="bg-white" />
                        </v-card-title>

                        <v-data-table :headers="headers" :items="visitors" :search="search" :loading="loading"
                            loading-text="Cargando visitantes..."
                            no-data-text="No hay visitantes registrados para esta fecha"
                            items-per-page-text="Visitantes por página" :items-per-page="10">

                            <!-- Columna de hora y fecha -->
                            <template v-slot:item.datetime="{ item }">
                                <div class="ml-2 d-flex flex-column">
                                    <div class="d-flex align-center">
                                        <v-icon size="small" class="mr-1">mdi-clock-outline</v-icon>
                                        <span class="font-weight-medium">{{ formatTime(item.visitDate) }}</span>
                                    </div>
                                    <div class="d-flex align-center text-caption text-grey">
                                        <v-icon size="small" class="mr-1">mdi-calendar</v-icon>
                                        <span>{{ formatDate(item.visitDate) }}</span>
                                    </div>

                                </div>
                            </template>

                            <!-- Columna de acciones -->
                            <template v-slot:item.actions="{ item }">
                                <div class="d-flex ga-1">
                                    <v-tooltip text="Ver registro">
                                        <template v-slot:activator="{ props }">
                                            <v-btn v-bind="props" @click="handleShow(item)" icon="mdi-eye"
                                                variant="text" />
                                        </template>
                                    </v-tooltip>

                                    <v-tooltip text="Ver PDF">
                                        <template v-slot:activator="{ props }">
                                            <v-btn v-bind="props" @click="handleDownload(item)" icon="mdi-file-pdf-box"
                                                variant="text" color="error" />
                                        </template>
                                    </v-tooltip>

                                    <!-- <v-tooltip text="Editar">
                                        <template v-slot:activator="{ props }">
                                            <v-btn v-bind="props" @click="handleEdit(item)" icon="mdi-pencil"
                                                variant="text" color="info" />
                                        </template>
                                    </v-tooltip> -->

                                    <v-tooltip text="Eliminar">
                                        <template v-slot:activator="{ props }">
                                            <v-btn v-bind="props" @click="handleDelete(item)" icon="mdi-delete"
                                                variant="text" color="error" />
                                        </template>
                                    </v-tooltip>
                                </div>
                            </template>
                        </v-data-table>
                    </v-card>
                </v-col>
            </v-row>
        </template>

        <!-- Botones de exportación -->
        <template #actions>
            <v-col class="d-flex justify-end mr-4">
                <v-btn @click="showExportDialog = true" variant="outlined" prepend-icon="mdi-download">
                    Exportar
                </v-btn>
            </v-col>
        </template>
    </ViewCard>

    <!-- Date Picker Dialog -->
    <v-dialog v-model="showDatePicker" max-width="400">
        <v-card>
            <v-card-text class="pa-0">
                <v-date-picker v-model="selectedDate" color="primary" show-adjacent-months width="100%"
                    @update:model-value="handleDateChange" />
            </v-card-text>
        </v-card>
    </v-dialog>

    <!-- Diálogo para ver crear un nuevo visitante -->
    <!-- <v-dialog v-model="addDialog" max-width="800">
        <v-card>
            <v-card-title class="text-h5 d-flex align-center">
                <v-icon color="info" class="mr-2">mdi-eye</v-icon>
                Ver visitante
            </v-card-title>
            <v-card-text>
                <v-form v-if="selectedVisitor" ref="createFormRef">
                    <v-row>
                        Espacio para la hora de visita
                        <v-col>
                            <v-select></v-select>
                        </v-col> 
                        <v-col cols="12" md="6" sm="6">
                            <v-text-field v-model="selectedVisitor.name" label="Nombre y apellidos" variant="outlined"
                                density="comfortable" :rules="nameRules" prepend-inner-icon="mdi-account" />
                        </v-col>
                        <v-col cols="12" md="6" sm="6">
                            <v-text-field v-model="selectedVisitor.company" label="Empresa" variant="outlined"
                                density="comfortable" :rules="companyRules" prepend-inner-icon="mdi-domain" />
                        </v-col>
                        <v-col cols="12" md="6" sm="6">
                            <v-text-field v-model="selectedVisitor.purpose"
                                :label="selectedVisitor.purpose.length > 1 ? 'Motivos' : 'Motivo'" variant="outlined"
                                density="comfortable" prepend-inner-icon="mdi-notebook" />
                        </v-col>
                        <v-col cols="12" md="6" sm="6">
                            <v-text-field v-model="selectedVisitor.accessZone"
                                :label="selectedVisitor.accessZone.length > 1 ? 'Zonas de acceso' : 'Zona de acceso'"
                                variant="outlined" density="comfortable" prepend-inner-icon="mdi-map-marker" />
                        </v-col>
                        <v-col cols="12" md="6" sm="6">
                            <v-text-field v-model="selectedVisitor.workerId.name" label="Responsable" variant="outlined"
                                density="comfortable" prepend-inner-icon="mdi-account-tie" />
                        </v-col>
                        <v-col v-if="selectedVisitor.plate" cols="12" md="6" sm="6">
                            <v-text-field v-model="selectedVisitor.plate" label="Matrícula" variant="outlined"
                                density="comfortable" prepend-inner-icon="mdi-car" />
                        </v-col>
                        Espacio para la firma
                        <v-col>
                            <v-img :src="selectedVisitor.signature"></v-img>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="showDialog = false" variant="text">
                    Volver
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog> -->

    <!-- Diálogo para ver detalles de un visitante -->
    <v-dialog v-model="showDialog" max-width="800">
        <v-card>
            <v-card-title class="text-h5 d-flex align-center bg-primary">
                <v-icon class="mr-2">mdi-eye</v-icon>
                Ver visitante
            </v-card-title>
            <v-card-text>
                <v-form v-if="selectedVisitor" ref="viewFormRef">
                    <v-col>
                        <v-row>
                            <v-col cols="12" md="6" sm="6">
                                <v-text-field v-model="selectedVisitorDate" label="Fecha" variant="outlined"
                                    density="comfortable" prepend-inner-icon="mdi-calendar" readonly />
                            </v-col>
                            <v-col cols="12" md="6" sm="6" :class="xs ? 'mt-n6' : ''">
                                <v-text-field v-model="selectedVisitorHour" label="Hora" variant="outlined"
                                    density="comfortable" prepend-inner-icon="mdi-clock-outline" readonly />
                            </v-col>
                        </v-row>
                        <v-row class="mt-n6">
                            <v-col cols="12" md="6" sm="6">
                                <v-text-field v-model="selectedVisitor.name" label="Nombre y apellidos"
                                    variant="outlined" density="comfortable" :rules="nameRules"
                                    prepend-inner-icon="mdi-account" readonly />
                                <v-text-field v-model="selectedVisitor.company" label="Empresa" variant="outlined"
                                    density="comfortable" :rules="companyRules" prepend-inner-icon="mdi-domain"
                                    readonly />
                            </v-col>
                            <v-col cols="12" md="6" sm="6" v-if="!xs">
                                <v-card variant="outlined" class="border-opacity-25">
                                    <v-card-text class="mb-n3 mt-n3">
                                        Firma
                                    </v-card-text>
                                    <v-divider class="border-opacity-25" />
                                    <v-img style="max-height: 100px;" :src="selectedVisitor.signature" />
                                </v-card>
                            </v-col>
                            <v-col cols="12" md="6" sm="6" v-else class="mb-6 mt-n6">
                                <v-card variant="outlined" class="border-opacity-25">
                                    <v-card-text class="mt-n3">
                                        Firma
                                    </v-card-text>
                                    <v-divider class="border-opacity-25" />
                                    <v-img :src="selectedVisitor.signature" />
                                </v-card>
                            </v-col>
                        </v-row>
                        <v-row class="mt-n6">
                            <v-col cols="12" md="6" sm="6">
                                <v-text-field v-model="selectedVisitor.purpose"
                                    :label="selectedVisitor.purpose.length > 1 ? 'Motivos' : 'Motivo'"
                                    variant="outlined" density="comfortable" prepend-inner-icon="mdi-notebook"
                                    readonly />
                            </v-col>
                            <v-col cols="12" md="6" sm="6" :class="xs ? 'mt-n6' : ''">
                                <v-text-field v-model="selectedVisitor.accessZone"
                                    :label="selectedVisitor.accessZone.length > 1 ? 'Zonas de acceso' : 'Zona de acceso'"
                                    variant="outlined" density="comfortable" prepend-inner-icon="mdi-map-marker"
                                    readonly />
                            </v-col>
                        </v-row>
                        <v-row class="mt-n6 mb-n5">
                            <v-col cols="12" md="6" sm="6">
                                <v-text-field v-model="selectedVisitor.workerId.name" label="Responsable"
                                    variant="outlined" density="comfortable" prepend-inner-icon="mdi-account-tie"
                                    readonly />
                            </v-col>
                            <v-col v-if="selectedVisitor.plate" cols="12" md="6" sm="6">
                                <v-text-field v-model="selectedVisitor.plate" label="Matrícula" variant="outlined"
                                    density="comfortable" prepend-inner-icon="mdi-car" readonly />
                            </v-col>
                        </v-row>
                    </v-col>
                </v-form>
            </v-card-text>
            <v-card-actions class="ma-6 mt-n9">
                <v-spacer></v-spacer>
                <v-btn @click="showDialog = false" variant="tonal" class="mr-1">
                    Volver
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- Diálogo para editar visitante -->
    <!-- <v-dialog v-model="editDialog" max-width="800">
        <v-card>
            <v-card-title class="text-h5 d-flex align-center bg-primary">
                <v-icon class="mr-2">mdi-pencil</v-icon>
                Editar visitante
            </v-card-title>
            <v-card-text>
                <v-form v-if="editForm" ref="editFormRef">
                    <v-col>
                        <v-row>
                            <v-col cols="12" md="6" sm="6">
                                <v-text-field v-model="editForm.name" label="Nombre y apellidos" variant="outlined"
                                    density="comfortable" :rules="nameRules" prepend-inner-icon="mdi-account" />
                            </v-col>
                            <v-col cols="12" md="6" sm="6">
                                <v-text-field v-model="editForm.company" label="Empresa" variant="outlined"
                                    density="comfortable" :rules="companyRules" prepend-inner-icon="mdi-domain" />
                            </v-col>
                        </v-row>
                        <v-row class="mt-n4">
                            <v-col cols="12" md="6" sm="6">
                                <v-select v-model="editForm.purpose" label="Motivos"
                                    :items="['Visita', 'Mantenimiento']" multiple item-title="name" item-value="_id"
                                    variant="outlined" density="comfortable" prepend-inner-icon="mdi-notebook" />
                            </v-col>
                            <v-col cols="12" md="6" sm="6">
                                <v-select v-model="editForm.accessZone" label="Zonas de acceso"
                                    :items="['Oficina', 'C.Clasificacion', 'Naves']" multiple item-title="name"
                                    item-value="_id" variant="outlined" density="comfortable"
                                    prepend-inner-icon="mdi-map-marker" />
                            </v-col>
                        </v-row>
                        <v-row class="mt-n4">
                            <v-col cols="12" md="6" sm="6">
                                <v-select v-model="editForm.workerId" label="Responsable" :items="mockWorkers"
                                    item-title="name" item-value="_id" variant="outlined" density="comfortable"
                                    prepend-inner-icon="mdi-account-tie" />
                            </v-col>
                            <v-col cols="12" md="6" sm="6">
                                <v-text-field v-model="editForm.plate" label="Matrícula" variant="outlined"
                                    density="comfortable" prepend-inner-icon="mdi-car" />
                            </v-col>
                        </v-row>
                        <v-row v-if="!isEditingSignature" class="mt-n4">
                            <v-col cols="12">
                                <v-card variant="outlined">
                                    <v-card-text class="mb-n2 mt-n2 ">
                                        Firma
                                    </v-card-text>
                                    <v-divider class="border-opacity-25" />
                                    <v-img :src="editForm.signature" />
                                    <v-card-actions class="d-flex justify-end mr-2 mb-2">
                                        <v-btn variant="tonal" @click="isEditingSignature = !isEditingSignature">
                                            Cambiar firma
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-col>
                        </v-row>
                        <v-row v-if="isEditingSignature" class="mt-n4">
                            <v-col cols="12">
                                <v-card variant="outlined" class="pt-4 px-1 pb-0">
                                    <v-card-title class="mt-n3 d-flex justify-space-between align-center">
                                        <span>Firma:</span>
                                        <v-btn @click="clearSignature" variant="outlined" size="small"
                                            prepend-icon="mdi-eraser" color="error">
                                            Limpiar
                                        </v-btn>
                                    </v-card-title>
                                    <v-card-text>
                                        <div class="signature-pad-wrapper">
                                            <VueSignature ref="signatureRef" :sigOption="{ penColor: 'rgb(0, 0, 0)' }"
                                                :w="'100%'" :h="'180px'" @end="handleEnd" />
                                        </div>
                                        <v-divider class="my-2" />
                                        <div class="text-center text-caption text-grey-darken-1">
                                            Firme en el recuadro superior
                                        </div>
                                        <v-card-actions class="d-flex justify-end mt-n5 mb-n2 mr-n2">
                                            <v-btn variant="tonal" @click="isEditingSignature = !isEditingSignature">
                                                Cancelar
                                            </v-btn>
                                        </v-card-actions>
                                    </v-card-text>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-form>
            </v-card-text>
            <v-card-actions class="ma-6 mt-n5 ga-4">
                <v-spacer />
                <v-btn @click="editDialog = false" variant="tonal">
                    Cancelar
                </v-btn>
                <v-btn @click="confirmEdit" color="primary" variant="flat" :loading="editing" class="mr-1">
                    Guardar cambios
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog> -->

    <!-- Diálogo de confirmación para eliminar -->
    <v-dialog v-model="deleteDialog" max-width="500">
        <v-card>
            <v-card-title class="text-h5 d-flex align-center bg-red">
                <v-icon class="mr-2">mdi-alert-circle</v-icon>
                Confirmar eliminación
            </v-card-title>
            <v-card-text>
                <p class="text-body-1 mb-1">
                    ¿Estás seguro de que deseas eliminar este registro de visitante?
                </p>
                <div v-if="selectedVisitor" class="">
                    <p><strong>Nombre:</strong> {{ selectedVisitor.name }}</p>
                    <p><strong>Empresa:</strong> {{ selectedVisitor.company }}</p>
                    <p><strong>Fecha:</strong> {{ formatDate(selectedVisitor.createdAt) }}</p>
                    <p><strong>Hora:</strong> {{ formatTime(selectedVisitor.createdAt) }}</p>
                </div>
                <v-alert type="warning" variant="tonal" density="compact" class="mt-4 mb-n2">
                    Esta acción no se puede deshacer
                </v-alert>
            </v-card-text>
            <v-card-actions class="mb-4 mr-4 mt-n1 ga-4">
                <v-spacer />
                <v-btn @click="deleteDialog = false" variant="tonal">
                    Cancelar
                </v-btn>
                <v-btn @click="confirmDelete" color="error" variant="flat" :loading="deleting">
                    Eliminar
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- Diálogo de exportación -->
    <ExportVisitorsDialog v-model="showExportDialog" @export="handleExport" />

</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useVisitStore } from '@/stores/visitStore';
import { useToastComposable } from '@/composables/useToast';
import ViewCard from '@/components/ViewCard.vue';
import ExportVisitorsDialog from '@/components/ExportVisitorsDialog.vue';
import VueSignature from 'vue3-signature';
import { useDisplay } from 'vuetify'
const { xs } = useDisplay()

const { showToast } = useToastComposable();
const router = useRouter();
const authStore = useAuthStore();
const visitStore = useVisitStore();

const tenant = computed(() => authStore.tenant);

// Estados
const loading = ref(false);
const deleting = ref(false);
const editing = ref(false);
const search = ref('');
const showDatePicker = ref(false);
const selectedDate = ref(new Date()); // Por defecto hoy
const visitors = ref([]);
const selectedVisitor = ref(null);
const addDialog = ref(false);
const showDialog = ref(false);
const editDialog = ref(false);
const deleteDialog = ref(false);

const showExportDialog = ref(false);

const editForm = ref(null);
const createFormRef = ref(null);
const viewFormRef = ref(null);
const editFormRef = ref(null);

const isEditingSignature = ref(false);

const signatureRef = ref(null);
const hasSignature = ref(false);

// Headers de la tabla 
const headers = [
    { title: 'Hora y fecha', key: 'datetime', sortable: false },
    { title: 'Nombre', key: 'name', sortable: false, width: '15%' },
    { title: 'Empresa', key: 'company', sortable: false, width: '15%' },
    { title: 'Responsable', key: 'workerId.name', sortable: false },
    { title: 'Acciones', key: 'actions', sortable: false, align: 'center', width: '20%' }
];

// Reglas de validación
const nameRules = [
    v => !!v || 'El nombre es requerido',
    v => v.length >= 3 || 'Mínimo 3 caracteres',
];

const companyRules = [
    v => !!v || 'La empresa es requerida',
    v => v.length >= 2 || 'Mínimo 2 caracteres',
];

// Computed properties
const formattedSelectedDate = computed(() => {
    if (!selectedDate.value) return '';
    return formatDate(selectedDate.value);
});

// Verificar si la fecha seleccionada es hoy
const isToday = computed(() => {
    if (!selectedDate.value) return true;
    const today = new Date();
    const selected = new Date(selectedDate.value);

    return (
        selected.getDate() === today.getDate() &&
        selected.getMonth() === today.getMonth() &&
        selected.getFullYear() === today.getFullYear()
    );
});

const selectedVisitorDate = computed(() => {
    return formatDate(selectedVisitor.value.visitDate)
})

const selectedVisitorHour = computed(() => {
    return formatTime(selectedVisitor.value.visitDate)
})

// Lifecycle
onMounted(() => {
    loadVisitors();
});

watch(selectedDate, (newDate) => {
    if (newDate) {
        loadVisitors();
    }
});

async function loadVisitors() {
    loading.value = true;
    try {
        // Enviar la fecha en formato YYYY-MM-DD
        const localDate = new Date(selectedDate.value);
        const dateString = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;

        visitors.value = await visitStore.fetchVisitorsByDate(
            tenant.value._id,
            dateString
        );
    } catch (error) {
        console.error('Error cargando visitantes:', error);
        showToast('Error al cargar visitantes', 'error');
    } finally {
        loading.value = false;
    }
}

// async function confirmEdit() {
//     // Validar formulario
//     const { valid } = await editFormRef.value.validate();
//     if (!valid) return;

//     editing.value = true;
//     try {
//         // TODO: Aquí irá la llamada al backend
//         // await visitStore.updateVisitor(editForm.value);

//         await new Promise(resolve => setTimeout(resolve, 1000));

//         // Actualizar en el array local
//         const index = visitors.value.findIndex(v => v._id === editForm.value._id);
//         if (index !== -1) {
//             visitors.value[index] = { ...editForm.value };
//         }

//         showToast('Visitante actualizado correctamente', 'success');
//         editDialog.value = false;
//     } catch (error) {
//         console.error('Error actualizando visitante:', error);
//         showToast('Error al actualizar visitante', 'error');
//     } finally {
//         editing.value = false;
//     }
// }

async function confirmDelete() {
    deleting.value = true;
    try {
        const res = await visitStore.deleteVisitor(selectedVisitor.value._id);

        // Eliminar del array local
        visitors.value = visitors.value.filter(v => v._id !== selectedVisitor.value._id);

        showToast('Visita y archivos asociados eliminados exitosamente', 'success');
        deleteDialog.value = false;
    } catch (error) {
        console.error('Error eliminando visitante:', error);
        showToast('Error al eliminar visitante', 'error');
    } finally {
        deleting.value = false;
    }
}

function handleDateChange() {
    showDatePicker.value = false;
}

function handleShow(visitor) {
    selectedVisitor.value = visitor;
    selectedVisitor.value.purpose = selectedVisitor.value.purpose.map(p => capitalize(p));
    selectedVisitor.value.accessZone = selectedVisitor.value.accessZone.map(a => capitalize(a));
    showDialog.value = true;
}

function handleEdit(visitor) {
    visitor.purpose = visitor.purpose.map(p => capitalize(p));
    visitor.accessZone = visitor.accessZone.map(a => capitalize(a));
    selectedVisitor.value = visitor;
    editForm.value = { ...visitor };
    editDialog.value = true;
}

function handleDelete(visitor) {
    selectedVisitor.value = visitor;
    deleteDialog.value = true;
}

function handleDownload(visitor) {
    if (!visitor.pdfUrl) {
        showToast(`No hay pdf disponible para este visitante`, 'error');
        return;
    }

    // Crear un enlace temporal
    const link = document.createElement('a');
    link.href = visitor.pdfUrl;
    link.download = `visitor_${visitor.name}_${visitor.visitDate}.pdf`;
    link.target = '_blank';

    // Simular click y limpiar
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function handleExport(exportData) {
    const { format, startDate, endDate } = exportData;

    // Enviar las fechas en formato YYYY-MM-DD
    const localStartDate = new Date(startDate);
    const localEndDate = new Date(endDate);
    const startDateString = `${localStartDate.getFullYear()}-${String(localStartDate.getMonth() + 1).padStart(2, '0')}-${String(localStartDate.getDate()).padStart(2, '0')}`;
    const endDateString = `${localEndDate.getFullYear()}-${String(localEndDate.getMonth() + 1).padStart(2, '0')}-${String(localEndDate.getDate()).padStart(2, '0')}`;

    try {
        await visitStore.exportVisitors(
            tenant.value._id,
            startDateString,
            endDateString,
            format
        );

        showToast(
            `${format === 'pdf' ? 'PDF' : 'Excel'} descargado correctamente`,
            'success'
        );
    } catch (error) {
        console.error('Error exportando:', error);
        if (error.status === 401) {
            showToast('No tienes permisos para acceder a esta información', 'error');
        }
        else if (error.status === 404) {
            showToast('No se han encontrado visitantes para ese periodo', 'error');
        } else showToast(
            error.response?.data?.message || 'Error al exportar',
            'error'
        );
    }
}

function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

function formatTime(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: "Europe/Madrid",
    });
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function clearFilters() {
    selectedDate.value = new Date(); // Volver a hoy
    search.value = '';
}

const clearSignature = () => {
    if (signatureRef.value) {
        signatureRef.value.clear();
        hasSignature.value = false;
    }
};

const handleEnd = () => {
    hasSignature.value = !signatureRef.value.isEmpty();
};

function goBack() {
    router.go(-1);
}
</script>

<style scoped>
.cursor-pointer {
    cursor: pointer;
    transition: transform 0.2s;
}

.cursor-pointer:hover {
    transform: scale(1.01);
}

.return-pointer {
    cursor: pointer;
    transition: transform 0.2s;
}

.return-pointer:hover {
    opacity: 1 !important;
    background-color: #3d3d3d;
    transform: scale(1.02);
}

.return-pointer :deep(.v-btn__overlay) {
    opacity: 0 !important;
}

.signature-pad-wrapper {
    border: 2px dashed #ccc;
    border-radius: 8px;
    overflow: hidden;
    background: white;
}
</style>