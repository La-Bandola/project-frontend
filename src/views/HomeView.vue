<template>
  <div class="min-h-screen bg-surface">
    <!-- Navbar -->
    <nav class="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
      <ParCheckLogo size="sm" to="/" />
      <div class="flex gap-4 items-center">
        <router-link to="/perfil" class="text-sm text-gray-600 hover:text-brand-500">
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

    <div class="max-w-5xl mx-auto px-4 py-8 space-y-8">

      <!-- ── Fila superior: Boletín + Deudas ──────────────────── -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

        <!-- Boletín financiero global -->
        <div v-if="boletin" class="bg-white rounded-xl shadow-sm p-5">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">📊 Mi resumen financiero</h2>
          <div class="grid grid-cols-3 gap-3">
            <div class="bg-green-50 rounded-lg p-3 text-center">
              <p class="text-xs text-gray-500 mb-1">Total pagado</p>
              <p class="text-base font-bold text-green-600">
                ${{ Number(boletin.total_pagado).toLocaleString('es-CO') }}
              </p>
            </div>
            <div class="bg-brand-50 rounded-lg p-3 text-center">
              <p class="text-xs text-gray-500 mb-1">Total recibido</p>
              <p class="text-base font-bold text-brand-500">
                ${{ Number(boletin.total_recibido).toLocaleString('es-CO') }}
              </p>
            </div>
            <div
              class="rounded-lg p-3 text-center"
              :class="boletin.saldo_neto >= 0 ? 'bg-emerald-50' : 'bg-red-50'"
            >
              <p class="text-xs text-gray-500 mb-1">Saldo neto</p>
              <p
                class="text-base font-bold"
                :class="boletin.saldo_neto >= 0 ? 'text-emerald-600' : 'text-red-500'"
              >
                {{ boletin.saldo_neto >= 0 ? '+' : '' }}${{ Number(boletin.saldo_neto).toLocaleString('es-CO') }}
              </p>
            </div>
          </div>
          <p class="text-xs text-gray-400 text-center mt-3">
            En {{ boletin.num_parches }} parche{{ boletin.num_parches !== 1 ? 's' : '' }}
          </p>
        </div>

        <!-- Deudas pendientes globales -->
        <div class="bg-white rounded-xl shadow-sm p-5">
          <h2 class="text-lg font-semibold text-gray-800 mb-3">💸 Mis deudas pendientes</h2>

          <!-- Resumen total si hay deudas -->
          <div
            v-if="deudas.length > 0"
            class="bg-red-50 border border-red-200 rounded-xl px-4 py-2 mb-3 flex justify-between items-center"
          >
            <span class="text-sm text-red-700">Total pendiente</span>
            <strong class="text-red-700 text-base">
              ${{ totalDeudas.toLocaleString('es-CO') }}
            </strong>
          </div>

          <div class="space-y-2 max-h-64 overflow-y-auto">
            <router-link
              v-for="deuda in deudas"
              :key="deuda.participant_id"
              :to="`/parches/${deuda.parche_id}`"
              class="block bg-gray-50 rounded-lg px-4 py-3 hover:bg-gray-100 transition"
            >
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-medium text-gray-800 text-sm">{{ deuda.evento_nombre }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">
                    📍 {{ deuda.parche_nombre }}
                    <span v-if="deuda.responsable">· Para: {{ deuda.responsable }}</span>
                  </p>
                </div>
                <span class="text-red-500 font-semibold text-sm whitespace-nowrap ml-4">
                  ${{ Number(deuda.monto_adeudado).toLocaleString('es-CO') }}
                </span>
              </div>
            </router-link>

            <p v-if="deudas.length === 0" class="text-green-600 text-sm text-center bg-green-50 rounded-xl px-4 py-4">
              ✅ ¡Estás al día! No tienes deudas pendientes.
            </p>
          </div>
        </div>
      </div>

      <!-- ── Mis parches + acciones ────────────────────────────── -->
      <div>
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800">Mis parches</h2>
          <div class="flex gap-2">
            <button
              @click="toggleCrear"
              class="flex items-center gap-1.5 text-sm bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-600 transition font-medium"
            >
              {{ mostrarCrear ? '✕ Cancelar' : '+ Crear parche' }}
            </button>
            <button
              @click="toggleUnirse"
              class="flex items-center gap-1.5 text-sm bg-gold-500 text-white px-4 py-2 rounded-lg hover:bg-gold-600 transition font-medium"
            >
              {{ mostrarUnirse ? '✕ Cancelar' : '🔗 Unirse' }}
            </button>
          </div>
        </div>

        <!-- Formulario Crear parche (colapsable) -->
        <div v-if="mostrarCrear" class="bg-white rounded-xl shadow-sm p-5 mb-4 border border-brand-200">
          <h3 class="text-base font-semibold text-gray-700 mb-3">Nuevo parche</h3>
          <form @submit.prevent="handleCrear" class="flex flex-col sm:flex-row gap-3">
            <input
              v-model="form.name"
              placeholder="Nombre del parche"
              required
              class="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <input
              v-model="form.description"
              placeholder="Descripción (opcional)"
              class="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <button
              type="submit"
              class="bg-brand-500 text-white px-6 py-2 rounded-lg hover:bg-brand-600 transition font-medium whitespace-nowrap"
            >
              Crear
            </button>
          </form>
        </div>

        <!-- Formulario Unirse a parche (colapsable) -->
        <div v-if="mostrarUnirse" class="bg-white rounded-xl shadow-sm p-5 mb-4 border border-gold-200">
          <h3 class="text-base font-semibold text-gray-700 mb-3">Unirse con código</h3>
          <form @submit.prevent="handleUnirse" class="flex flex-col sm:flex-row gap-3">
            <input
              v-model="codigoInvitacion"
              placeholder="Código de invitación"
              required
              class="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold-400"
            />
            <button
              type="submit"
              class="bg-gold-500 text-white px-6 py-2 rounded-lg hover:bg-gold-600 transition font-medium whitespace-nowrap"
            >
              Unirse
            </button>
          </form>
        </div>

        <!-- Grid de parches -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <router-link
            v-for="parche in parches.parches"
            :key="parche.id"
            :to="`/parches/${parche.id}`"
            class="block bg-white rounded-xl shadow-sm px-5 py-4 hover:shadow-md transition hover:-translate-y-0.5"
          >
            <p class="font-semibold text-gray-800">{{ parche.name }}</p>
            <p class="text-sm text-gray-500 mt-1">👥 {{ parche.members_count }} miembros</p>
          </router-link>

          <p v-if="parches.parches.length === 0" class="text-gray-400 text-sm col-span-full text-center py-6">
            No tienes parches aún. ¡Crea uno o únete con un código!
          </p>
        </div>
      </div>

      <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import ParCheckLogo from '@/components/ParCheckLogo.vue'
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
const boletin = ref(null)

const form             = reactive({ name: '', description: '' })
const codigoInvitacion = ref('')
const mostrarCrear     = ref(false)
const mostrarUnirse    = ref(false)

const toggleCrear  = () => { mostrarCrear.value = !mostrarCrear.value; mostrarUnirse.value = false }
const toggleUnirse = () => { mostrarUnirse.value = !mostrarUnirse.value; mostrarCrear.value = false }

// Suma total de todas las deudas pendientes
const totalDeudas = computed(() =>
  deudas.value.reduce((acc, d) => acc + Number(d.monto_adeudado), 0)
)

onMounted(async () => {
  await parches.fetchParches()
  await fetchDeudas()
  await fetchBoletin()
})

const fetchBoletin = async () => {
  try {
    const { data } = await api.get('/finanzas/boletin/')
    boletin.value = data
  } catch (e) {
    console.error('Error cargando boletin:', e.response?.data)
  }
}

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
    mostrarCrear.value = false
  } catch {
    error.value = 'Error al crear el parche'
  }
}

const handleUnirse = async () => {
  try {
    await parches.unirseParche(codigoInvitacion.value)
    codigoInvitacion.value = ''
    error.value            = null
    mostrarUnirse.value    = false
  } catch {
    error.value = 'Código inválido o ya eres miembro'
  }
}
</script>