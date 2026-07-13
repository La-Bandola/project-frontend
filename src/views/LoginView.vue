<template>
  <div class="min-h-screen bg-surface flex items-center justify-center">
    <div class="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
      <div class="flex justify-center mb-2">
        <ParCheckLogo size="lg" />
      </div>
      <p class="text-center text-gray-500 mb-6">Gestiona tus gastos compartidos</p>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
          <input
            v-model="form.username"
            placeholder="tu_usuario"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>

        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>

        <button
          type="submit"
          class="w-full bg-brand-500 text-white py-2 rounded-lg hover:bg-brand-600 transition font-medium"
        >
          Ingresar
        </button>
      </form>

      <p class="text-center text-sm text-gray-500 mt-4">
        ¿No tienes cuenta?
        <router-link to="/register" class="text-brand-500 hover:underline">Regístrate</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import ParCheckLogo from '@/components/ParCheckLogo.vue'
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthSubmission } from '@/composables/useAuthSubmission.js'
import { useAuthStore } from '@/stores/auth.js'
import { AUTH_ERROR_MESSAGES } from '@/utils/authErrors.js'

const auth = useAuthStore()
const router = useRouter()
const form = reactive({ username: '', password: '' })
const { error, submit } = useAuthSubmission({
  onSubmit: () => auth.login(form.username, form.password),
  fallbackError: AUTH_ERROR_MESSAGES.invalidCredentials,
})

const handleLogin = async () => {
  const isSuccessful = await submit()
  if (isSuccessful) router.push('/')
}
</script>