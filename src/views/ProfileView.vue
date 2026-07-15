<template>
  <div class="min-h-screen bg-surface" v-if="auth.user">
    <AppNavbar />

    <div class="max-w-5xl mx-auto px-4 py-8 space-y-6">

      <!-- ── Header del perfil ──────────────────────────────────── -->
      <div class="bg-white rounded-xl shadow-sm p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <!-- Avatar -->
        <div class="relative shrink-0">
          <div class="w-24 h-24 rounded-full bg-brand-100 flex items-center justify-center overflow-hidden ring-4 ring-brand-200">
            <img v-if="auth.user.photo" :src="auth.user.photo" class="w-full h-full object-cover" />
            <span v-else class="text-4xl text-brand-500 font-bold">
              {{ auth.user.username?.charAt(0).toUpperCase() }}
            </span>
          </div>
        </div>

        <!-- Info -->
        <div class="flex-1 text-center sm:text-left">
          <h1 class="text-2xl font-bold text-gray-800">{{ auth.user.username }}</h1>
          <p class="text-brand-500 font-medium">@{{ auth.user.nickname || 'sin nickname' }}</p>
          <p class="text-sm text-gray-500 mt-1">{{ auth.user.email }}</p>
          <p v-if="auth.user.bio" class="text-sm text-gray-600 mt-2 max-w-md">{{ auth.user.bio }}</p>
        </div>

        <!-- Botón editar -->
        <button
          v-if="!editando"
          @click="editando = true"
          class="shrink-0 text-sm bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-600 transition font-medium"
        >
          ✏️ Editar perfil
        </button>
      </div>

      <!-- ── Formulario editar perfil (colapsable) ─────────────── -->
      <div v-if="editando" class="bg-white rounded-xl shadow-sm p-6 border border-brand-200">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800">Editar información</h2>
          <button @click="editando = false" class="text-sm text-gray-400 hover:text-gray-600">✕ Cancelar</button>
        </div>
        <form @submit.prevent="handleGuardar" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nickname</label>
            <input
              v-model="form.nickname"
              placeholder="@nickname"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Foto de perfil</label>
            <input type="file" accept="image/*" @change="handleFoto" class="text-sm w-full border border-gray-300 rounded-lg px-3 py-2" />
            <img v-if="preview" :src="preview" class="mt-2 w-16 h-16 rounded-full object-cover" />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              v-model="form.bio"
              placeholder="Cuéntanos algo sobre ti"
              rows="2"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
            />
          </div>
          <div class="sm:col-span-2 flex gap-3">
            <button type="submit" class="flex-1 bg-brand-500 text-white py-2 rounded-lg hover:bg-brand-600 transition font-medium">
              Guardar cambios
            </button>
            <button type="button" @click="editando = false" class="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition">
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <!-- ── Grid: Cuentas + Soporte ───────────────────────────── -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        <!-- Cuentas bancarias -->
        <div class="bg-white rounded-xl shadow-sm p-5 space-y-4">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold text-gray-800">💳 Cuentas bancarias</h2>
            <button
              @click="mostrarFormCuenta = !mostrarFormCuenta"
              class="text-sm bg-gold-500 text-white px-3 py-1.5 rounded-lg hover:bg-gold-600 transition font-medium"
            >
              {{ mostrarFormCuenta ? '✕ Cancelar' : '+ Agregar' }}
            </button>
          </div>

          <!-- Formulario agregar cuenta (colapsable) -->
          <div v-if="mostrarFormCuenta" class="border border-gold-200 rounded-xl p-4 space-y-3">
            <form @submit.prevent="handleAgregarCuenta" class="space-y-3">
              <select
                v-model="cuentaForm.bank"
                required
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                <option value="">Selecciona un banco</option>
                <option value="nequi">Nequi</option>
                <option value="daviplata">Daviplata</option>
                <option value="bancolombia">Bancolombia</option>
                <option value="otro">Otro</option>
              </select>
              <input
                v-model="cuentaForm.number"
                placeholder="Número o llave"
                required
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <label class="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" v-model="cuentaForm.is_primary" class="accent-brand-500" />
                Marcar como cuenta principal
              </label>
              <button
                type="submit"
                class="w-full bg-gold-500 text-white py-2 rounded-lg hover:bg-gold-600 transition font-medium"
              >
                Agregar cuenta
              </button>
            </form>
          </div>

          <!-- Lista de cuentas -->
          <div class="space-y-2">
            <div
              v-for="cuenta in cuentas"
              :key="cuenta.id"
              class="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-3"
            >
              <div>
                <p class="text-sm font-medium text-gray-800 capitalize">{{ cuenta.bank }}</p>
                <p class="text-xs text-gray-500">**** {{ cuenta.number.slice(-4) }}</p>
              </div>
              <div class="flex items-center gap-2">
                <span v-if="cuenta.is_primary" class="text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded-full">
                  Principal
                </span>
                <button @click="handleEliminarCuenta(cuenta.id)" class="text-xs text-red-400 hover:text-red-600 hover:underline transition">
                  Eliminar
                </button>
              </div>
            </div>
            <p v-if="cuentas.length === 0" class="text-sm text-gray-400 text-center py-4">
              No tienes cuentas registradas
            </p>
          </div>
        </div>

        <!-- Soporte y Feedback -->
        <div class="bg-white rounded-xl shadow-sm p-5 space-y-4">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold text-gray-800">📩 Soporte y feedback</h2>
            <button
              @click="mostrarFormFeedback = !mostrarFormFeedback"
              class="text-sm bg-brand-500 text-white px-3 py-1.5 rounded-lg hover:bg-brand-600 transition font-medium"
            >
              {{ mostrarFormFeedback ? '✕ Cancelar' : '+ Enviar' }}
            </button>
          </div>

          <!-- Formulario enviar feedback (colapsable) -->
          <div v-if="mostrarFormFeedback" class="border border-brand-200 rounded-xl p-4">
            <form @submit.prevent="handleEnviarFeedback" class="space-y-3">
              <select
                v-model="feedbackForm.type"
                required
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                <option value="opinion">💭 Opinión</option>
                <option value="sugerencia">💡 Sugerencia</option>
                <option value="reclamo">⚠️ Reclamo</option>
              </select>
              <textarea
                v-model="feedbackForm.message"
                placeholder="Escribe tu mensaje..."
                rows="3"
                required
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
              />
              <button
                type="submit"
                class="w-full bg-brand-500 text-white py-2 rounded-lg hover:bg-brand-600 transition font-medium"
              >
                Enviar feedback
              </button>
            </form>
          </div>

          <!-- Historial feedbacks -->
          <div v-if="feedbacks.length > 0" class="space-y-2 max-h-72 overflow-y-auto">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mis envíos</p>
            <div
              v-for="fb in feedbacks"
              :key="fb.id"
              class="bg-gray-50 rounded-lg px-4 py-3"
            >
              <div class="flex justify-between items-center mb-1">
                <span class="text-xs font-medium text-gray-700 capitalize">{{ fb.type }}</span>
                <span
                  class="text-xs px-2 py-0.5 rounded-full font-medium"
                  :class="{
                    'bg-yellow-100 text-yellow-700': fb.status === 'pendiente',
                    'bg-brand-100 text-brand-700':   fb.status === 'revisado',
                    'bg-green-100 text-green-700':   fb.status === 'resuelto',
                  }"
                >
                  {{ fb.status }}
                </span>
              </div>
              <p class="text-sm text-gray-600">{{ fb.message }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ formatFecha(fb.created_at?.split('T')[0]) }}</p>
            </div>
          </div>
          <p v-else class="text-sm text-gray-400 text-center py-4">Aún no has enviado ningún feedback</p>
        </div>
      </div>

      <!-- Mensajes de estado -->
      <p v-if="mensaje" class="text-green-600 text-sm text-center bg-green-50 rounded-xl py-3">✅ {{ mensaje }}</p>
      <p v-if="error"   class="text-red-500   text-sm text-center bg-red-50   rounded-xl py-3">❌ {{ error }}</p>

    </div>
  </div>

  <div v-else class="min-h-screen flex items-center justify-center">
    <p class="text-gray-400">Cargando...</p>
  </div>
</template>

<script setup>
import AppNavbar from '@/components/AppNavbar.vue'
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import api from '@/services/api.js'

const auth     = useAuthStore()
const editando = ref(false)
const cuentas  = ref([])
const preview  = ref(null)
const mensaje  = ref(null)
const error    = ref(null)

const mostrarFormCuenta   = ref(false)
const mostrarFormFeedback = ref(false)

const form = reactive({ nickname: '', bio: '', foto: null })
const cuentaForm = reactive({ bank: '', number: '', is_primary: false })
const feedbackForm = reactive({ type: 'opinion', message: '' })
const feedbacks = ref([])

onMounted(async () => {
  await auth.fetchProfile()
  form.nickname = auth.user.nickname || ''
  form.bio      = auth.user.bio      || ''
  await fetchCuentas()
  await fetchFeedbacks()
})

const fetchCuentas = async () => {
  const { data } = await api.get('/users/me/bank-accounts/')
  cuentas.value = data
}

const handleFoto = (e) => {
  const file    = e.target.files[0]
  form.foto     = file
  preview.value = URL.createObjectURL(file)
}

const handleGuardar = async () => {
  try {
    const payload = new FormData()
    payload.append('nickname', form.nickname)
    payload.append('bio',      form.bio)
    if (form.foto) payload.append('photo', form.foto)
    await api.patch('/users/me/', payload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    await auth.fetchProfile()
    editando.value = false
    mensaje.value  = 'Perfil actualizado correctamente'
    error.value    = null
  } catch {
    error.value   = 'Error al guardar el perfil'
    mensaje.value = null
  }
}

const handleAgregarCuenta = async () => {
  try {
    await api.post('/users/me/bank-accounts/', { ...cuentaForm })
    cuentaForm.bank       = ''
    cuentaForm.number     = ''
    cuentaForm.is_primary = false
    mostrarFormCuenta.value = false
    mensaje.value         = 'Cuenta agregada'
    error.value           = null
    await fetchCuentas()
  } catch {
    error.value   = 'Error al agregar la cuenta'
    mensaje.value = null
  }
}

const handleEliminarCuenta = async (id) => {
  try {
    await api.delete(`/users/me/bank-accounts/${id}/`)
    mensaje.value = 'Cuenta eliminada'
    error.value   = null
    await fetchCuentas()
  } catch {
    error.value   = 'Error al eliminar la cuenta'
    mensaje.value = null
  }
}

const fetchFeedbacks = async () => {
  try {
    const { data } = await api.get('/soporte/feedback/mis-envios/')
    feedbacks.value = data
  } catch (e) {
    console.error('error cargando feedbacks:', e.response?.data)
  }
}

const handleEnviarFeedback = async () => {
  try {
    await api.post('/soporte/feedback/', {
      type:    feedbackForm.type,
      message: feedbackForm.message,
    })
    feedbackForm.message  = ''
    feedbackForm.type     = 'opinion'
    mostrarFormFeedback.value = false
    mensaje.value         = '¡Feedback enviado! Gracias por ayudarnos a mejorar 😊'
    error.value           = null
    await fetchFeedbacks()
  } catch {
    error.value   = 'Error al enviar el feedback'
    mensaje.value = null
  }
}

const formatFecha = (fecha) => {
  if (!fecha) return ''
  const [y, m, d] = fecha.split('-')
  return `${d}/${m}/${y}`
}
</script>