<template>
  <div class="min-h-screen bg-gray-50" v-if="auth.user">
    <!-- Navbar -->
    <nav class="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
      <router-link to="/" class="text-indigo-600 font-medium hover:underline">← Volver</router-link>
      <h1 class="text-xl font-bold text-indigo-600">{{ parche?.name }}</h1>
      <span class="text-sm text-gray-500">{{ parche?.members_count }} miembros</span>
    </nav>

    <div class="max-w-2xl mx-auto px-4 py-8 space-y-6">

      <!-- Código invitación -->
      <div class="bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-3 flex justify-between items-center">
        <span class="text-sm text-indigo-700">Código de invitación</span>
        <strong class="text-indigo-800 tracking-widest">{{ parche?.invite_code }}</strong>
      </div>

      <!-- Balance personal -->
      <div class="bg-white rounded-xl shadow-sm p-5">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Mi balance</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-green-50 rounded-lg p-3 text-center">
            <p class="text-xs text-gray-500 mb-1">Pagado</p>
            <p class="text-lg font-bold text-green-600">${{ balance.pagado }}</p>
          </div>
          <div class="bg-blue-50 rounded-lg p-3 text-center">
            <p class="text-xs text-gray-500 mb-1">Recibido</p>
            <p class="text-lg font-bold text-blue-600">${{ balance.recibido }}</p>
          </div>
          <div class="bg-red-50 rounded-lg p-3 text-center">
            <p class="text-xs text-gray-500 mb-1">Deudas</p>
            <p class="text-lg font-bold text-red-500">${{ balance.deudas }}</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-3 text-center">
            <p class="text-xs text-gray-500 mb-1">Neto</p>
            <p class="text-lg font-bold text-gray-700">${{ balance.neto }}</p>
          </div>
        </div>
      </div>

      <!-- Crear evento -->
      <div class="bg-white rounded-xl shadow-sm p-5">
        <h2 class="text-lg font-semibold text-gray-800 mb-3">Crear evento</h2>
        <form @submit.prevent="handleCrearEvento" class="space-y-3">
          <input
            v-model="eventoForm.name"
            placeholder="Nombre del evento"
            required
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            v-model="eventoForm.total_amount"
            placeholder="Monto total"
            type="number"
            required
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <select
            v-model="eventoForm.split_type"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
          <option disabled value="">
          Seleccione un responsable
          </option>
          
            <option value="equal">Partes iguales</option>
            <option value="custom">Monto personalizado</option>
          </select>
          
          <select 
            v-model="eventoForm.responsible_id" required
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
          <option disabled value="">
          Seleccione un responsable
          </option>

          <option
            v-for="miembro in miembros"
            :key="miembro.id"
            :value="miembro.id"
          >
            {{ miembro.username }}
          </option>
        </select>

          <button
            type="submit"
            class="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
          >

            Crear evento
          </button>
        </form>
      </div>

      <!-- Lista de eventos -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold text-gray-800">Eventos</h2>

        <div
          v-for="(evento, i) in eventos"
          :key="i"
          class="bg-white rounded-xl shadow-sm p-5"
        >
          <div class="flex justify-between items-start mb-3">
            <div>
              <p class="font-semibold text-gray-800">{{ evento.name }}</p>
              <p class="text-sm text-gray-500">Total: ${{ evento.total_amount }}</p>
            </div>
            <span class="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
              {{ evento.participants?.length }} participantes
            </span>
          </div>

          <div class="space-y-2">
            <div
              v-for="(p, j) in evento.participants"
              :key="j"
              class="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-2"
            >
              <div>
                <p class="text-sm font-medium text-gray-700">{{ p.user?.username }}</p>
                <p class="text-xs text-gray-500">${{ p.amount_owed }}</p>
              </div>
              <div>
                <span v-if="p.paid" class="text-green-500 text-sm font-medium">✅ Pagado</span>
                <button
                  v-else-if="p.user && auth.user && p.user.id === auth.user.id"
                  @click="handlePagar(p.id)"
                  class="text-xs bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700 transition"
                >
                  Marcar pagado
                </button>
                <span v-else class="text-red-400 text-sm">❌ Pendiente</span>
              </div>
            </div>
          </div>
        </div>

        <p v-if="eventos.length === 0" class="text-gray-400 text-sm text-center">
          No hay eventos aún
        </p>
      </div>

      <!-- ── Suscripciones ───────────────────────────────────────── -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold text-gray-800">Suscripciones</h2>

        <!-- Lista de suscripciones existentes -->
        <div
          v-for="sus in suscripciones"
          :key="sus.id"
          class="bg-white rounded-xl shadow-sm p-5 flex justify-between items-start"
        >
          <div>
            <p class="font-semibold text-gray-800">{{ sus.name }}</p>
            <p class="text-sm text-gray-500">
              ${{ sus.amount }} · Corte: {{ formatFecha(sus.cutoff_date) }}
            </p>
            <p class="text-xs text-gray-400 mt-1">
              Responsable: {{ sus.responsible?.username || '—' }}
            </p>
          </div>
          <button
            @click="handleEliminarSuscripcion(sus.id)"
            class="text-xs text-red-400 hover:text-red-600 hover:underline transition"
          >
            Eliminar
          </button>
        </div>

        <p v-if="suscripciones.length === 0" class="text-gray-400 text-sm text-center">
          No hay suscripciones aún
        </p>

        <!-- Formulario nueva suscripción -->
        <div class="bg-white rounded-xl shadow-sm p-5">
          <h3 class="text-base font-semibold text-gray-800 mb-3">Nueva suscripción</h3>
          <form @submit.prevent="handleCrearSuscripcion" class="space-y-3">
            <input
              v-model="susForm.name"
              placeholder="Nombre (ej: Netflix, Spotify)"
              required
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <input
              v-model="susForm.amount"
              placeholder="Monto mensual"
              type="number"
              min="0"
              required
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <div>
              <label class="block text-xs text-gray-500 mb-1">Fecha de corte (día de pago)</label>
              <input
                v-model="susForm.cutoff_date"
                type="date"
                required
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <select
              v-model="susForm.responsible_id"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Sin responsable</option>
              <option
                v-for="miembro in miembros"
                :key="miembro.id"
                :value="miembro.id"
              >
                {{ miembro.username }}
              </option>
            </select>
            <button
              type="submit"
              class="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition font-medium"
            >
              Agregar suscripción
            </button>
          </form>
        </div>
      </div>

      <!-- ── Finanzas ──────────────────────────────────────────────── -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold text-gray-800">💰 Finanzas del parche</h2>

        <!-- Balance mutuo: quién le debe a quién -->
        <div class="bg-white rounded-xl shadow-sm p-5">
          <h3 class="text-base font-semibold text-gray-700 mb-3">Balance con cada miembro</h3>
          <div v-if="Object.keys(balanceMutuo).length > 0" class="space-y-2">
            <div
              v-for="(monto, usuario) in balanceMutuo"
              :key="usuario"
              class="flex justify-between items-center px-4 py-2 rounded-lg"
              :class="monto >= 0 ? 'bg-green-50' : 'bg-red-50'"
            >
              <span class="text-sm text-gray-700">{{ usuario }}</span>
              <span
                class="text-sm font-semibold"
                :class="monto >= 0 ? 'text-green-600' : 'text-red-500'"
              >
                {{ monto >= 0 ? '+' : '' }}${{ Number(monto).toLocaleString('es-CO') }}
              </span>
            </div>
          </div>
          <p v-else class="text-sm text-gray-400 text-center">Sin movimientos entre miembros aún</p>
        </div>

        <!-- Historial de transacciones -->
        <div class="bg-white rounded-xl shadow-sm p-5">
          <h3 class="text-base font-semibold text-gray-700 mb-3">Historial de transacciones</h3>
          <div class="space-y-2 max-h-64 overflow-y-auto">
            <div
              v-for="tx in transacciones"
              :key="tx.id"
              class="flex justify-between items-start bg-gray-50 rounded-lg px-4 py-3"
            >
              <div>
                <p class="text-sm font-medium text-gray-800">
                  {{ tx.from_user?.username }} → {{ tx.to_user?.username }}
                </p>
                <p class="text-xs text-gray-500">{{ tx.concept || '(sin concepto)' }}</p>
                <p class="text-xs text-gray-400">{{ formatFecha(tx.created_at?.split('T')[0]) }}</p>
              </div>
              <span
                class="text-sm font-semibold whitespace-nowrap ml-4"
                :class="tx.type === 'pago' ? 'text-green-600' : 'text-red-500'"
              >
                ${{ Number(tx.amount).toLocaleString('es-CO') }}
              </span>
            </div>
            <p v-if="transacciones.length === 0" class="text-sm text-gray-400 text-center">
              No hay transacciones registradas
            </p>
          </div>
        </div>

        <!-- Registrar pago manual -->
        <div class="bg-white rounded-xl shadow-sm p-5">
          <h3 class="text-base font-semibold text-gray-700 mb-3">Registrar pago manual</h3>
          <form @submit.prevent="handleCrearTransaccion" class="space-y-3">
            <select
              v-model="txForm.to_user_id"
              required
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Selecciona a quién le pagas</option>
              <option
                v-for="m in miembros.filter(m => m.id !== auth.user?.id)"
                :key="m.id"
                :value="m.id"
              >
                {{ m.username }}
              </option>
            </select>
            <input
              v-model="txForm.amount"
              type="number"
              min="0"
              placeholder="Monto"
              required
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <input
              v-model="txForm.concept"
              placeholder="Concepto (opcional)"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              type="submit"
              class="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition font-medium"
            >
              Registrar pago
            </button>
          </form>
        </div>
      </div>

      <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>
    </div>
  </div>

  <div v-else class="min-h-screen flex items-center justify-center">
    <p class="text-gray-400">Cargando...</p>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useParchesStore } from '@/stores/parches.js'
import { useAuthStore } from '@/stores/auth.js'
import api from '@/services/api.js'

const route   = useRoute()
const parches = useParchesStore()
const auth    = useAuthStore()
const parche        = ref(null)
const eventos       = ref([])
const miembros      = ref([])
const suscripciones  = ref([])
const transacciones  = ref([])
const balanceMutuo   = ref({})
const error          = ref(null)
const balance        = ref({ pagado: 0, recibido: 0, deudas: 0, neto: 0 })

const eventoForm = reactive({
  name:           '',
  total_amount:   '',
  split_type:     'equal',
  responsible_id: '',   // fix: declarado aquí para que Vue lo rastree con v-model
})

const susForm = reactive({
  name:           '',
  amount:         '',
  cutoff_date:    '',
  responsible_id: '',
})

const txForm = reactive({
  to_user_id: '',
  amount:     '',
  concept:    '',
  type:       'pago',
})

onMounted(async () => {
  await auth.fetchProfile()
  parche.value = await parches.fetchParche(route.params.id)

  await fetchEventos()
  await fetchBalance()
  await fetchMiembros()
  await fetchSuscripciones()
  await fetchTransacciones()
  await fetchBalanceMutuo()
})

const fetchEventos = async () => {
  try {
    const { data } = await api.get(`/parches/${route.params.id}/eventos/`)
    eventos.value = data.map(evento => ({
      ...evento,
      participants: evento.participants.filter(p => p !== null && p.user !== null)
    }))
  } catch (e) {
    console.error('error cargando eventos:', e.response?.data)
  }
}

const fetchBalance = async () => {
  const { data } = await api.get(`/parches/${route.params.id}/balance/personal/`)
  balance.value = data
}

const fetchMiembros = async () => {
  try {
    const { data } = await api.get(`/parches/${route.params.id}/members/`)
    miembros.value = data
  } catch (e) {
    console.error('error cargando miembros:', e.response?.data)
  }
}

const fetchSuscripciones = async () => {
  try {
    const { data } = await api.get(`/parches/${route.params.id}/suscripciones/`)
    suscripciones.value = data
  } catch (e) {
    console.error('error cargando suscripciones:', e.response?.data)
  }
}

const fetchTransacciones = async () => {
  try {
    const { data } = await api.get(`/parches/${route.params.id}/transacciones/`)
    transacciones.value = data
  } catch (e) {
    console.error('error cargando transacciones:', e.response?.data)
  }
}

const fetchBalanceMutuo = async () => {
  try {
    const { data } = await api.get(`/parches/${route.params.id}/balance/mutuo/`)
    balanceMutuo.value = data
  } catch (e) {
    console.error('error cargando balance mutuo:', e.response?.data)
  }
}

const handleCrearTransaccion = async () => {
  try {
    await api.post(`/parches/${route.params.id}/transacciones/`, {
      to_user_id: txForm.to_user_id,
      amount:     txForm.amount,
      concept:    txForm.concept,
      type:       'pago',
    })
    txForm.to_user_id = ''
    txForm.amount     = ''
    txForm.concept    = ''
    error.value       = null
    await fetchTransacciones()
    await fetchBalanceMutuo()
    await fetchBalance()
  } catch {
    error.value = 'Error al registrar el pago'
  }
}

// Formatea 'YYYY-MM-DD' a 'DD/MM/YYYY' para mostrar en la UI
const formatFecha = (fecha) => {
  if (!fecha) return '—'
  const [y, m, d] = fecha.split('-')
  return `${d}/${m}/${y}`
}

const handleCrearSuscripcion = async () => {
  try {
    await api.post(`/parches/${route.params.id}/suscripciones/`, {
      name:           susForm.name,
      amount:         susForm.amount,
      cutoff_date:    susForm.cutoff_date,
      responsible_id: susForm.responsible_id || null,
    })
    susForm.name           = ''
    susForm.amount         = ''
    susForm.cutoff_date    = ''
    susForm.responsible_id = ''
    error.value            = null
    await fetchSuscripciones()
  } catch {
    error.value = 'Error al crear la suscripción'
  }
}

const handleEliminarSuscripcion = async (id) => {
  try {
    await api.delete(`/parches/${route.params.id}/suscripciones/${id}/`)
    error.value = null
    await fetchSuscripciones()
  } catch {
    error.value = 'Error al eliminar la suscripción'
  }
}

const handleCrearEvento = async () => {
  try {
    await api.post(`/parches/${route.params.id}/eventos/`, {
      name:            eventoForm.name,
      total_amount:    eventoForm.total_amount,
      split_type:      eventoForm.split_type,
      responsible_id:  eventoForm.responsible_id || null,
      participant_ids: [auth.user.id],
    })
    eventoForm.name           = ''
    eventoForm.total_amount   = ''
    eventoForm.responsible_id = ''
    error.value               = null
    await fetchEventos()
    await fetchBalance()
  } catch {
    error.value = 'Error al crear el evento'
  }
}

const handlePagar = async (participanteId) => {
  try {
    await api.patch(`/participantes/${participanteId}/pagar/`, {})
    await fetchEventos()
    await fetchBalance()
  } catch {
    error.value = 'Error al marcar el pago'
  }
}
</script>
