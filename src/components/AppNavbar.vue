<template>
  <nav class="bg-white shadow-sm px-6 py-3 flex justify-between items-center sticky top-0 z-50">
    <ParCheckLogo size="sm" to="/" />

    <div class="flex items-center gap-4">
      <router-link
        to="/"
        class="text-sm text-gray-500 hover:text-brand-500 transition"
        :class="{ 'text-brand-600 font-medium': route.path === '/' }"
      >
        🏠 Inicio
      </router-link>

      <router-link
        to="/perfil"
        class="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-500 transition"
        :class="{ 'text-brand-600 font-medium': route.path === '/perfil' }"
      >
        <div class="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center overflow-hidden shrink-0">
          <img v-if="auth.user?.photo" :src="auth.user.photo" class="w-full h-full object-cover" />
          <span v-else class="text-xs text-brand-600 font-bold">
            {{ auth.user?.username?.charAt(0).toUpperCase() }}
          </span>
        </div>
        <span>{{ auth.user?.nickname || auth.user?.username }}</span>
      </router-link>

      <button
        @click="handleLogout"
        class="text-sm text-red-400 hover:text-red-600 transition"
      >
        Salir
      </button>
    </div>
  </nav>
</template>

<script setup>
import ParCheckLogo from '@/components/ParCheckLogo.vue'
import { useAuthStore } from '@/stores/auth.js'
import { useRoute, useRouter } from 'vue-router'

const auth   = useAuthStore()
const route  = useRoute()
const router = useRouter()

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}
</script>
