<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navbar -->
    <nav class="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
      <h1 class="text-xl font-bold text-indigo-600">ParCheck</h1>
      <div class="flex gap-4 items-center">
        <router-link to="/perfil" class="text-sm text-gray-600 hover:text-indigo-600">
          👤 {{ auth.user?.nickname || auth.user?.username }}
        </router-link>
        <button
          @click="auth.logout(); router.push('/login')"
          class="text-sm text-red-500 hover:underline"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>

    <div class="max-w-2xl mx-auto px-4 py-8 space-y-8">

      <!-- ── Deudas pendientes globales ──────────────────────────── -->
      <div>
        <h2 class="text-lg font-semibold text-gray-800 mb-3">
          💸 Mis deudas pendientes
        </h2>

        <!-- Resumen total si hay deudas -->
        <div
          v-if="deudas.length > 0"
          class="bg-red-50 border border-red-200 rounded-xl px-5 py-3 mb-3 flex justify-between items-center"
        >
          <span class="text-sm text-red-700">Total pendiente</span>
          <strong class="text-red-700 text-base">
            ${{ totalDeudas.toLocaleString('es-CO') }}
          </strong>
        </div>

        <div class="space-y-2">
          <router-link
            v-for="deuda in deudas"
            :key="deuda.participant_id"
            :to="`/parches/${deuda.parche_id}`"
            class="block bg-white rounded-xl shadow-sm px-5 py-4 hover:shadow-md transition"
          >
            <div class="flex justify-between items-start">
              <div>
                <p class="font-medium text-gray-800">{{ deuda.evento_nombre }}</p>
                <p class="text-xs text-gray-400 mt-0.5">
                  📍 {{ deuda.parche_nombre }}
                  <span v-if="deuda.responsable"> · Para: {{ deuda.responsable }}</span>
                </p>
              </div>
              <span class="text-red-500 font-semibold text-sm whitespace-nowrap ml-4">
                ${{ Number(deuda.monto_adeudado).toLocaleString('es-CO') }}
              </span>
            </div>
          </router-link>

          <p v-if="deudas.length === 0" class="text-green-600 text-sm text-center bg-green-50 rounded-xl px-5 py-4">
            ✅ ¡Estás al día! No tienes deudas pendientes.
          </p>
        </div>
      </div>

      <!-- Mis parches -->
      <div>
        <h2 class="text-lg font-semibold text-gray-800 mb-3">Mis parches</h2>
        <div class="space-y-2">
          <router-link
            v-for="parche in parches.parches"
            :key="parche.id"
            :to="`/parches/${parche.id}`"
            class="block bg-white rounded-xl shadow-sm px-5 py-4 hover:shadow-md transition"
          >
            <p class="font-medium text-gray-800">{{ parche.name }}</p>
            <p class="text-sm text-gray-500">{{ parche.members_count }} miembros</p>
          </router-link>
          <p v-if="parches.parches.length === 0" class="text-gray-400 text-sm">
            No tienes parches aún
          </p>
        </div>
      </div>

      <!-- Crear parche -->
      <div class="bg-white rounded-xl shadow-sm p-5">
        <h2 class="text-lg font-semibold text-gray-800 mb-3">Crear parche</h2>
        <form @submit.prevent="handleCrear" class="space-y-3">
          <input
            v-model="form.name"
            placeholder="Nombre del parche"
            required
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            v-model="form.description"
            placeholder="Descripción (opcional)"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            class="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            Crear
          </button>
        </form>
      </div>

      <!-- Unirse a parche -->
      <div class="bg-white rounded-xl shadow-sm p-5">
        <h2 class="text-lg font-semibold text-gray-800 mb-3">Unirse a un parche</h2>
        <form @submit.prevent="handleUnirse" class="space-y-3">
          <input
            v-model="codigoInvitacion"
            placeholder="Código de invitación"
            required
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium"
          >
            Unirse
          </button>
        </form>
      </div>

      <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { useParchesStore } from '@/stores/parches.js'
import api from '@/services/api.js'

const auth    = useAuthStore()
const parches = useParchesStore()
const router  = useRouter()
const error   = ref(null)
const deudas  = ref([])

const form             = reactive({ name: '', description: '' })
const codigoInvitacion = ref('')

// Suma total de todas las deudas pendientes
const totalDeudas = computed(() =>
  deudas.value.reduce((acc, d) => acc + Number(d.monto_adeudado), 0)
)

onMounted(async () => {
  await parches.fetchParches()
  await fetchDeudas()
})

const fetchDeudas = async () => {
  try {
    const { data } = await api.get('/deudas-pendientes/')
    deudas.value = data
  } catch (e) {
    console.error('Error cargando deudas pendientes:', e.response?.data)
  }
}

const handleCrear = async () => {
  try {
    await parches.crearParche({ ...form })
    form.name        = ''
    form.description = ''
    error.value      = null
  } catch {
    error.value = 'Error al crear el parche'
  }
}

const handleUnirse = async () => {
  try {
    await parches.unirseParche(codigoInvitacion.value)
    codigoInvitacion.value = ''
    error.value            = null
  } catch {
    error.value = 'Código inválido o ya eres miembro'
  }
}
</script>