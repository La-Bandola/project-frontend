<template>
  <div class="min-h-screen bg-surface" v-if="auth.user">
    <AppNavbar />
    <div class="bg-white border-b px-6 py-2 flex justify-between items-center text-sm text-gray-500">
      <span class="font-medium text-gray-700">{{ parche?.name }}</span>
      <span>👥 {{ parche?.members_count }} miembros</span>
    </div>

    <div class="max-w-6xl mx-auto px-4 py-6 space-y-6">

      <!-- Código invitación -->
      <div class="bg-brand-50 border border-brand-200 rounded-xl px-5 py-3 flex justify-between items-center">
        <span class="text-sm text-brand-700">Código de invitación</span>
        <strong class="text-brand-900 tracking-widest">{{ parche?.invite_code }}</strong>
      </div>

      <!-- Balance personal -->
      <div class="bg-white rounded-xl shadow-sm p-5">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Mi balance</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
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

      <!-- ── Layout 2 columnas: Eventos | Suscripciones ─────────── -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

        <!-- Columna izquierda: Eventos (60%) -->
        <div class="lg:col-span-3 space-y-4">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold text-gray-800">Eventos</h2>
            <button
              @click="mostrarFormEvento = !mostrarFormEvento"
              class="text-sm bg-brand-500 text-white px-4 py-1.5 rounded-lg hover:bg-brand-600 transition font-medium"
            >
              {{ mostrarFormEvento ? '✕ Cancelar' : '+ Nuevo evento' }}
            </button>
          </div>

          <!-- Formulario crear evento (colapsable) -->
          <div v-if="mostrarFormEvento" class="bg-white rounded-xl shadow-sm p-5 border border-brand-200">
            <h3 class="text-base font-semibold text-gray-700 mb-3">Nuevo evento</h3>
            <form @submit.prevent="handleCrearEvento" class="space-y-3">
              <input
                v-model="eventoForm.name"
                placeholder="Nombre del evento"
                required
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <div class="grid grid-cols-2 gap-3">
                <input
                  v-model="eventoForm.total_amount"
                  placeholder="Monto total"
                  type="number"
                  required
                  class="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
                <select
                  v-model="eventoForm.split_type"
                  class="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
                >
                  <option disabled value="">División</option>
                  <option value="equal">Partes iguales</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>

              <select
                v-model="eventoForm.responsible_id" required
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                <option disabled value="">Seleccione un responsable</option>
                <option v-for="miembro in miembros" :key="miembro.id" :value="miembro.id">
                  {{ miembro.username }}
                </option>
              </select>

              <!-- Participantes -->
              <div>
                <label class="block text-xs text-gray-500 mb-1">Participantes</label>
                <div class="space-y-2 border border-gray-300 rounded-lg px-4 py-2">
                  <label
                    v-for="miembro in miembros"
                    :key="miembro.id"
                    class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      :value="miembro.id"
                      v-model="eventoForm.participant_ids"
                      class="accent-brand-500"
                    />
                    <span class="flex-1">{{ miembro.username }}</span>
                    <input
                      v-if="eventoForm.split_type === 'custom' && eventoForm.participant_ids.includes(miembro.id)"
                      :value="eventoForm.custom_amounts[miembro.id] || ''"
                      @input="eventoForm.custom_amounts[miembro.id] = $event.target.value"
                      type="number"
                      min="0"
                      placeholder="Monto"
                      class="w-24 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                    />
                  </label>
                </div>
              </div>

              <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
              <button
                type="submit"
                class="w-full bg-brand-500 text-white py-2 rounded-lg hover:bg-brand-600 transition font-medium"
              >
                Crear evento
              </button>
            </form>
          </div>

          <!-- Lista de eventos -->
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
              <div class="flex items-center gap-2">
                <span class="text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded-full">
                  {{ evento.participants?.length }} participantes
                </span>
                <button
                  @click="handleEliminarEvento(evento.id)"
                  class="text-xs text-red-400 hover:text-red-600 hover:underline transition"
                >
                  Eliminar
                </button>
              </div>
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

          <p v-if="eventos.length === 0" class="text-gray-400 text-sm text-center bg-white rounded-xl py-6">
            No hay eventos aún
          </p>
        </div>

        <!-- Columna derecha: Suscripciones (40%) -->
        <div class="lg:col-span-2 space-y-4">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold text-gray-800">Suscripciones</h2>
            <button
              @click="mostrarFormSus = !mostrarFormSus"
              class="text-sm bg-brand-500 text-white px-4 py-1.5 rounded-lg hover:bg-brand-600 transition font-medium"
            >
              {{ mostrarFormSus ? '✕ Cancelar' : '+ Nueva' }}
            </button>
          </div>

          <!-- Formulario nueva suscripción (colapsable) -->
          <div v-if="mostrarFormSus" class="bg-white rounded-xl shadow-sm p-5 border border-brand-200">
            <h3 class="text-base font-semibold text-gray-700 mb-3">Nueva suscripción</h3>
            <form @submit.prevent="handleCrearSuscripcion" class="space-y-3">
              <input
                v-model="susForm.name"
                placeholder="Nombre (ej: Netflix)"
                required
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <input
                v-model="susForm.amount"
                placeholder="Monto mensual"
                type="number"
                min="0"
                required
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <div>
                <label class="block text-xs text-gray-500 mb-1">Fecha de corte</label>
                <input
                  v-model="susForm.cutoff_date"
                  type="date"
                  required
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>
              <select
                v-model="susForm.responsible_id"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                <option value="">Sin responsable</option>
                <option v-for="miembro in miembros" :key="miembro.id" :value="miembro.id">
                  {{ miembro.username }}
                </option>
              </select>
              <button
                type="submit"
                class="w-full bg-brand-500 text-white py-2 rounded-lg hover:bg-brand-600 transition font-medium"
              >
                Agregar suscripción
              </button>
            </form>
          </div>

          <!-- Lista de suscripciones -->
          <div
            v-for="sus in suscripciones"
            :key="sus.id"
            class="bg-white rounded-xl shadow-sm p-4 flex justify-between items-start"
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
              class="text-xs text-red-400 hover:text-red-600 hover:underline transition ml-2"
            >
              Eliminar
            </button>
          </div>

          <p v-if="suscripciones.length === 0" class="text-gray-400 text-sm text-center bg-white rounded-xl py-6">
            No hay suscripciones aún
          </p>
        </div>
      </div>

      <!-- ── Finanzas del parche ────────────────────────────────── -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold text-gray-800">💰 Finanzas del parche</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <!-- Balance mutuo -->
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

          <!-- Historial de transacciones + Registrar pago -->
          <div class="space-y-4">
            <div class="bg-white rounded-xl shadow-sm p-5">
              <h3 class="text-base font-semibold text-gray-700 mb-3">Historial de transacciones</h3>
              <div class="space-y-2 max-h-48 overflow-y-auto">
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

            <!-- Registrar pago manual (colapsable) -->
            <div class="bg-white rounded-xl shadow-sm p-5">
              <div class="flex justify-between items-center">
                <h3 class="text-base font-semibold text-gray-700">Registrar pago manual</h3>
                <button
                  @click="mostrarFormTx = !mostrarFormTx"
                  class="text-sm bg-gold-500 text-white px-3 py-1.5 rounded-lg hover:bg-gold-600 transition font-medium"
                >
                  {{ mostrarFormTx ? '✕ Cancelar' : '+ Registrar' }}
                </button>
              </div>
              <form v-if="mostrarFormTx" @submit.prevent="handleCrearTransaccion" class="space-y-3 mt-3">
                <select
                  v-model="txForm.to_user_id"
                  required
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
                >
                  <option value="">¿A quién le pagas?</option>
                  <option
                    v-for="m in miembros.filter(m => m.id !== auth.user?.id)"
                    :key="m.id"
                    :value="m.id"
                  >
                    {{ m.username }}
                  </option>
                </select>
                <div class="grid grid-cols-2 gap-3">
                  <input
                    v-model="txForm.amount"
                    type="number"
                    min="0"
                    placeholder="Monto"
                    required
                    class="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                  <input
                    v-model="txForm.concept"
                    placeholder="Concepto (opcional)"
                    class="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>
                <button
                  type="submit"
                  class="w-full bg-gold-500 text-white py-2 rounded-lg hover:bg-gold-600 transition font-medium"
                >
                  Registrar pago
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>

      <!-- ── Ahorros colectivos ─────────────────────────────────── -->
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold text-gray-800">🏦 Ahorros colectivos</h2>
          <button
            @click="mostrarFormAhorro = !mostrarFormAhorro"
            class="text-sm bg-brand-500 text-white px-4 py-1.5 rounded-lg hover:bg-brand-600 transition font-medium"
          >
            {{ mostrarFormAhorro ? '✕ Cancelar' : '+ Nuevo espacio' }}
          </button>
        </div>

        <!-- Formulario nuevo espacio de ahorro (colapsable) -->
        <div v-if="mostrarFormAhorro" class="bg-white rounded-xl shadow-sm p-5 border border-brand-200">
          <h3 class="text-base font-semibold text-gray-700 mb-3">Crear espacio de ahorro</h3>
          <form @submit.prevent="handleCrearAhorro" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              v-model="ahorroForm.name"
              placeholder="Nombre (ej: Viaje a Cartagena)"
              required
              class="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <input
              v-model="ahorroForm.description"
              placeholder="Descripción (opcional)"
              class="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <input
              v-model="ahorroForm.goal_amount"
              type="number"
              min="1"
              placeholder="Meta de ahorro ($)"
              required
              class="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <div>
              <label class="block text-xs text-gray-500 mb-1">Fecha objetivo (opcional)</label>
              <input
                v-model="ahorroForm.target_date"
                type="date"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <button
              type="submit"
              class="sm:col-span-2 w-full bg-brand-500 text-white py-2 rounded-lg hover:bg-brand-600 transition font-medium"
            >
              Crear espacio
            </button>
          </form>
        </div>

        <!-- Grid de espacios de ahorro -->
        <div class="space-y-4">
          <div
            v-for="espacio in ahorros"
            :key="espacio.id"
            class="bg-white rounded-xl shadow-sm p-5"
          >
            <!-- Cabecera -->
            <div class="flex justify-between items-start mb-3">
              <div>
                <p class="font-semibold text-gray-800">{{ espacio.name }}</p>
                <p v-if="espacio.description" class="text-xs text-gray-400 mt-0.5">
                  {{ espacio.description }}
                </p>
              </div>
              <button
                @click="handleEliminarAhorro(espacio.id)"
                class="text-xs text-red-400 hover:text-red-600 hover:underline transition ml-4 shrink-0"
              >
                Eliminar
              </button>
            </div>

            <!-- Barra de progreso + aportes en 2 columnas -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

              <!-- Izquierda: progreso -->
              <div>
                <div class="flex justify-between text-xs text-gray-500 mb-1">
                  <span>${{ Number(espacio.current_amount).toLocaleString('es-CO') }} ahorrado</span>
                  <span>Meta: ${{ Number(espacio.goal_amount).toLocaleString('es-CO') }}</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    class="bg-brand-500 h-2.5 rounded-full transition-all"
                    :style="{ width: Math.min(espacio.progress_percentage, 100) + '%' }"
                  />
                </div>
                <p class="text-xs text-right text-brand-500 mt-1 font-medium">
                  {{ espacio.progress_percentage }}%
                  <span v-if="espacio.target_date"> · Fecha: {{ formatFecha(espacio.target_date) }}</span>
                </p>

                <!-- Aportes recientes -->
                <div v-if="espacio.aportes?.length > 0" class="space-y-1 mt-3">
                  <p class="text-xs font-medium text-gray-500">Aportes recientes</p>
                  <div
                    v-for="aporte in espacio.aportes"
                    :key="aporte.id"
                    class="flex justify-between text-xs bg-gray-50 rounded px-3 py-1.5"
                  >
                    <span class="text-gray-700">{{ aporte.user?.username }}</span>
                    <span class="text-green-600 font-medium">
                      +${{ Number(aporte.amount).toLocaleString('es-CO') }}
                      <span v-if="aporte.note" class="text-gray-400 font-normal ml-1">· {{ aporte.note }}</span>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Derecha: formulario aportar -->
              <div class="flex flex-col justify-center">
                <p class="text-xs font-medium text-gray-500 mb-2">Hacer un aporte</p>
                <form @submit.prevent="handleAportar(espacio.id, $event)" class="space-y-2">
                  <input
                    :name="'monto-' + espacio.id"
                    type="number"
                    min="1"
                    placeholder="Monto a aportar ($)"
                    required
                    class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                  <input
                    :name="'nota-' + espacio.id"
                    type="text"
                    placeholder="Nota (opcional)"
                    class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                  <button
                    type="submit"
                    class="w-full bg-brand-500 text-white py-2 rounded-lg text-sm hover:bg-brand-600 transition font-medium"
                  >
                    Aportar
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>


        <p v-if="ahorros.length === 0" class="text-gray-400 text-sm text-center bg-white rounded-xl py-6">
          No hay espacios de ahorro aún
        </p>
      </div>

    </div>
  </div>

  <div v-else class="min-h-screen flex items-center justify-center">
    <p class="text-gray-400">Cargando...</p>
  </div>
</template>

<script setup>
import AppNavbar from '@/components/AppNavbar.vue'
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
const ahorros        = ref([])
const error          = ref(null)
const balance        = ref({ pagado: 0, recibido: 0, deudas: 0, neto: 0 })

// Toggles para formularios colapsables
const mostrarFormEvento  = ref(false)
const mostrarFormSus     = ref(false)
const mostrarFormTx      = ref(false)
const mostrarFormAhorro  = ref(false)

const eventoForm = reactive({
  name:           '',
  total_amount:   '',
  split_type:     'equal',
  responsible_id: '',
  participant_ids: [],
  custom_amounts:   {},
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

const ahorroForm = reactive({
  name:        '',
  description: '',
  goal_amount: '',
  target_date: '',
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
  await fetchAhorros()
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
    mostrarFormTx.value = false
    await fetchTransacciones()
    await fetchBalanceMutuo()
    await fetchBalance()
  } catch {
    error.value = 'Error al registrar el pago'
  }
}

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
    mostrarFormSus.value   = false
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
    const payload = {
      name:            eventoForm.name,
      total_amount:    eventoForm.total_amount,
      split_type:      eventoForm.split_type,
      responsible_id:  eventoForm.responsible_id || null,
      participant_ids: eventoForm.participant_ids.length > 0
                       ? eventoForm.participant_ids
                       : [auth.user.id],
    }

    if (eventoForm.split_type === 'custom') {
      payload.custom_amounts = eventoForm.custom_amounts
    }

    await api.post(`/parches/${route.params.id}/eventos/`, payload)

    eventoForm.name            = ''
    eventoForm.total_amount    = ''
    eventoForm.responsible_id  = ''
    eventoForm.participant_ids = []
    eventoForm.custom_amounts   = {}
    error.value                = null
    mostrarFormEvento.value    = false
    await fetchEventos()
    await fetchBalance()
  } catch (e) {
    const detail = e.response?.data?.custom_amounts
    error.value = detail ? detail : 'Error al crear el evento'
  }
}

const handlePagar = async (participanteId) => {
  try {
    await api.patch(`/participantes/${participanteId}/pagar/`, {})
    await fetchEventos()
    await fetchBalance()
    await fetchTransacciones()
    await fetchBalanceMutuo()
  } catch {
    error.value = 'Error al marcar el pago'
  }
}

const fetchAhorros = async () => {
  try {
    const { data } = await api.get(`/parches/${route.params.id}/ahorros/`)
    ahorros.value = data
  } catch (e) {
    console.error('error cargando ahorros:', e.response?.data)
  }
}

const handleCrearAhorro = async () => {
  try {
    await api.post(`/parches/${route.params.id}/ahorros/`, {
      name:        ahorroForm.name,
      description: ahorroForm.description || '',
      goal_amount: ahorroForm.goal_amount,
      target_date: ahorroForm.target_date || null,
    })
    ahorroForm.name        = ''
    ahorroForm.description = ''
    ahorroForm.goal_amount = ''
    ahorroForm.target_date = ''
    error.value            = null
    mostrarFormAhorro.value = false
    await fetchAhorros()
  } catch {
    error.value = 'Error al crear el espacio de ahorro'
  }
}

const handleEliminarAhorro = async (id) => {
  try {
    await api.delete(`/parches/${route.params.id}/ahorros/${id}/`)
    error.value = null
    await fetchAhorros()
  } catch {
    error.value = 'Error al eliminar el espacio de ahorro'
  }
}

const handleAportar = async (espacioId, event) => {
  const form  = event.target
  const monto = form[`monto-${espacioId}`].value
  const nota  = form[`nota-${espacioId}`].value
  try {
    await api.post(`/ahorros/${espacioId}/aportar/`, {
      amount: monto,
      note:   nota || '',
    })
    form[`monto-${espacioId}`].value = ''
    form[`nota-${espacioId}`].value  = ''
    error.value = null
    await fetchAhorros()
  } catch {
    error.value = 'Error al registrar el aporte'
  }
}

const handleEliminarEvento = async (id) => {
  try {
    await api.delete(`/parches/${route.params.id}/eventos/${id}/`)
    error.value = null
    await fetchEventos()
    await fetchBalance()
  } catch {
    error.value = 'Error al eliminar el evento'
  }
}
</script>
