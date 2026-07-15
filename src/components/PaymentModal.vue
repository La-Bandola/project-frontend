<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
      
      <div class="p-6 border-b border-gray-100 flex justify-between items-center">
        <h3 class="text-xl font-bold text-gray-800">💸 Pagar Evento</h3>
        <button @click="close" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <form @submit.prevent="submitPayment" class="p-6 space-y-4">
        
        <!-- Info del Destinatario -->
        <div class="bg-brand-50 p-4 rounded-xl">
          <p class="text-sm text-brand-700">Responsable del evento:</p>
          <p class="text-lg font-semibold text-brand-900">{{ participant.evento?.responsible?.username || 'N/A' }}</p>
        </div>

        <!-- Monto -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Monto a pagar</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
            <input 
              v-model.number="amount"
              type="number" 
              required
              min="1"
              :max="maxAmount"
              class="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow"
            />
          </div>
          <p class="text-xs text-gray-500 mt-1">Deuda pendiente: ${{ Number(maxAmount).toLocaleString('es-CO') }}</p>
        </div>

        <!-- Cuentas Bancarias -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Cuenta de destino</label>
          <select 
            v-model="destination_account"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="">Ninguna / Pago en efectivo</option>
            <option 
              v-for="cuenta in cuentasDisponibles" 
              :key="cuenta.id" 
              :value="`${cuenta.bank} - ${cuenta.number}`"
            >
              {{ cuenta.bank }} - {{ cuenta.number }}
            </option>
          </select>
          <p v-if="cuentasDisponibles.length === 0" class="text-xs text-orange-500 mt-1">
            El responsable no tiene cuentas registradas. Realiza el pago en efectivo.
          </p>
        </div>

        <!-- Concepto -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Concepto o Nota</label>
          <input 
            v-model="concept"
            type="text" 
            placeholder="Ej. Pago de cervezas"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>

        <div class="pt-4 flex gap-3">
          <button 
            type="button" 
            @click="close"
            class="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            :disabled="loading"
            class="flex-1 py-3 px-4 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 transition disabled:opacity-50"
          >
            {{ loading ? 'Procesando...' : 'Confirmar Pago' }}
          </button>
        </div>

        <p v-if="error" class="text-sm text-red-500 text-center">{{ error }}</p>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import api from '@/services/api'

const props = defineProps({
  isOpen: Boolean,
  participant: Object
})

const emit = defineEmits(['close', 'payment-success'])

const amount = ref('')
const destination_account = ref('')
const concept = ref('')
const error = ref('')
const loading = ref(false)

const maxAmount = computed(() => {
  if (!props.participant) return 0
  const owed = parseFloat(props.participant.amount_owed) || 0
  const paid = parseFloat(props.participant.amount_paid) || 0
  return Math.max(owed - paid, 0)
})

const cuentasDisponibles = computed(() => {
  return props.participant?.evento?.responsible?.cuentas_bancarias || []
})

watch(() => props.isOpen, (newVal) => {
  if (newVal && props.participant) {
    console.log('[PaymentModal] participant:', props.participant)
    console.log('[PaymentModal] evento:', props.participant.evento)
    amount.value = maxAmount.value
    concept.value = `Pago evento: ${props.participant.evento?.name || ''}`
    destination_account.value = ''
    error.value = ''
  }
})

const close = () => {
  emit('close')
}

const submitPayment = async () => {
  if (amount.value <= 0) {
    error.value = 'El monto debe ser mayor a 0'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await api.post(`/participantes/${props.participant.id}/pagar/`, {
      amount: amount.value,
      concept: concept.value,
      destination_account: destination_account.value
    })
    
    emit('payment-success')
    close()
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al procesar el pago'
  } finally {
    loading.value = false
  }
}
</script>
