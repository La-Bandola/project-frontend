<template>
  <div class="min-h-screen bg-surface" v-if="auth.user">
    <AppNavbar />

    <div class="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      <!-- Encabezado -->
      <div class="flex justify-between items-center bg-white rounded-xl shadow-sm p-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">💸 Historial de transacciones</h1>
          <p class="text-gray-500 mt-1">Todos tus pagos enviados y recibidos en todos los parches.</p>
        </div>
        <router-link
          to="/"
          class="text-sm bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition font-medium"
        >
          Volver al inicio
        </router-link>
      </div>

      <!-- Filtros (Visuales por ahora) -->
      <div class="flex gap-2">
        <button class="px-4 py-1.5 rounded-full text-sm font-medium bg-brand-500 text-white">Todos</button>
        <button class="px-4 py-1.5 rounded-full text-sm font-medium bg-white text-gray-600 border border-gray-200 hover:bg-gray-50">Enviados</button>
        <button class="px-4 py-1.5 rounded-full text-sm font-medium bg-white text-gray-600 border border-gray-200 hover:bg-gray-50">Recibidos</button>
      </div>

      <!-- Lista de transacciones -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div v-if="loading" class="p-8 text-center text-gray-400">Cargando historial...</div>
        
        <div v-else-if="transacciones.length === 0" class="p-12 text-center">
          <p class="text-4xl mb-3">📭</p>
          <h3 class="text-lg font-semibold text-gray-700">Aún no hay transacciones</h3>
          <p class="text-gray-500 mt-1">Cuando realices o recibas pagos, aparecerán aquí.</p>
        </div>

        <div v-else class="divide-y divide-gray-100">
          <div
            v-for="tx in transacciones"
            :key="tx.id"
            class="p-5 hover:bg-gray-50 transition"
          >
            <!-- Transacción View -->
            <div v-if="editandoId !== tx.id" class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-4">
                <!-- Icono -->
                <div 
                  class="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                  :class="esMiEnvio(tx) ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'"
                >
                  {{ esMiEnvio(tx) ? '↗️' : '↙️' }}
                </div>
                
                <!-- Info -->
                <div>
                  <p class="font-semibold text-gray-800">
                    {{ esMiEnvio(tx) ? `A ${tx.to_user.username}` : `De ${tx.from_user.username}` }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ tx.concept }} <span class="mx-1">•</span>
                    <span class="text-brand-600 font-medium">{{ tx.parche_name }}</span>
                  </p>
                </div>
              </div>

              <!-- Monto y Acciones -->
              <div class="text-right flex flex-col items-end">
                <p 
                  class="font-bold text-lg"
                  :class="esMiEnvio(tx) ? 'text-red-500' : 'text-green-600'"
                >
                  {{ esMiEnvio(tx) ? '-' : '+' }}${{ Number(tx.amount).toLocaleString('es-CO') }}
                </p>
                <p class="text-xs text-gray-400">{{ formatFecha(tx.created_at) }}</p>
                
                <button 
                  v-if="esMiEnvio(tx)" 
                  @click="iniciarEdicion(tx)"
                  class="mt-2 text-xs text-brand-500 hover:text-brand-700 hover:underline font-medium"
                >
                  ✏️ Editar monto
                </button>
              </div>
            </div>

            <!-- Formulario de Edición -->
            <div v-else class="bg-brand-50 p-4 rounded-lg border border-brand-100">
              <h3 class="text-sm font-semibold text-brand-800 mb-3">Editar transacción</h3>
              <form @submit.prevent="guardarEdicion(tx.id)" class="flex gap-3 items-end">
                <div class="flex-1">
                  <label class="block text-xs font-medium text-gray-600 mb-1">Monto ($)</label>
                  <input 
                    v-model.number="formEdicion.amount"
                    type="number"
                    min="1"
                    required
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>
                <div class="flex-1">
                  <label class="block text-xs font-medium text-gray-600 mb-1">Concepto</label>
                  <input 
                    v-model="formEdicion.concept"
                    required
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>
                <div class="flex gap-2">
                  <button type="submit" class="bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-600 transition">
                    Guardar
                  </button>
                  <button type="button" @click="cancelarEdicion" class="bg-white border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                    Cancelar
                  </button>
                </div>
              </form>
              <p v-if="errorEdicion" class="text-xs text-red-500 mt-2">{{ errorEdicion }}</p>
            </div>

          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import AppNavbar from '@/components/AppNavbar.vue'
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import api from '@/services/api.js'

const auth = useAuthStore()
const transacciones = ref([])
const loading = ref(true)

const editandoId = ref(null)
const errorEdicion = ref(null)
const formEdicion = reactive({ amount: '', concept: '' })

onMounted(async () => {
  await fetchTransacciones()
})

const fetchTransacciones = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/finanzas/historial-global/')
    transacciones.value = data
  } catch (e) {
    console.error('Error cargando historial:', e)
  } finally {
    loading.value = false
  }
}

const esMiEnvio = (tx) => {
  return tx.from_user.id === auth.user?.id
}

const formatFecha = (isoString) => {
  const date = new Date(isoString)
  return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const iniciarEdicion = (tx) => {
  editandoId.value = tx.id
  formEdicion.amount = parseFloat(tx.amount)
  formEdicion.concept = tx.concept
  errorEdicion.value = null
}

const cancelarEdicion = () => {
  editandoId.value = null
  errorEdicion.value = null
}

const guardarEdicion = async (id) => {
  try {
    errorEdicion.value = null
    await api.patch(`/finanzas/transacciones/${id}/`, {
      amount: formEdicion.amount,
      concept: formEdicion.concept
    })
    // Actualizamos en local para no hacer refetch si no es necesario, o refetch. Mejor refetch.
    await fetchTransacciones()
    editandoId.value = null
  } catch (e) {
    errorEdicion.value = 'Error al guardar la transacción. Verifica los datos.'
  }
}
</script>
