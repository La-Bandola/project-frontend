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
        <span class="hidden sm:inline">{{ auth.user?.nickname || auth.user?.username }}</span>
      </router-link>

      <!-- Notificaciones -->
      <div class="relative" ref="notifDropdown">
        <button
          @click="toggleNotifications"
          class="relative p-2 text-gray-500 hover:text-brand-500 transition rounded-full hover:bg-gray-50"
        >
          🔔
          <span 
            v-if="notifications.unreadCount > 0"
            class="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full"
          >
            {{ notifications.unreadCount > 9 ? '9+' : notifications.unreadCount }}
          </span>
        </button>

        <div 
          v-if="showNotifications"
          class="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
        >
          <div class="flex justify-between items-center px-4 py-3 bg-gray-50 border-b border-gray-100">
            <h3 class="font-semibold text-gray-700">Notificaciones</h3>
            <button 
              v-if="notifications.unreadCount > 0"
              @click="notifications.markAllAsRead" 
              class="text-xs text-brand-600 hover:underline"
            >
              Marcar todo como leído
            </button>
          </div>
          
          <div class="max-h-80 overflow-y-auto">
            <div v-if="notifications.loading" class="p-4 text-center text-gray-400 text-sm">
              Cargando...
            </div>
            <div v-else-if="notifications.items.length === 0" class="p-8 text-center">
              <p class="text-2xl mb-2">📭</p>
              <p class="text-gray-500 text-sm">No tienes notificaciones</p>
            </div>
            <div v-else class="divide-y divide-gray-50">
              <div 
                v-for="notif in notifications.items" 
                :key="notif.id"
                @click="handleNotificationClick(notif)"
                class="p-4 cursor-pointer hover:bg-gray-50 transition"
                :class="{ 'bg-brand-50/30': !notif.is_read }"
              >
                <div class="flex gap-3">
                  <div class="mt-0.5">
                    <div class="w-2 h-2 rounded-full" :class="notif.is_read ? 'bg-transparent' : 'bg-brand-500'"></div>
                  </div>
                  <div>
                    <p class="text-sm text-gray-800" :class="{ 'font-medium': !notif.is_read }">{{ notif.message }}</p>
                    <p class="text-xs text-gray-400 mt-1">{{ formatFecha(notif.created_at) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
import { useNotificationsStore } from '@/stores/notifications.js'
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'

const auth   = useAuthStore()
const notifications = useNotificationsStore()
const route  = useRoute()
const router = useRouter()

const showNotifications = ref(false)
const notifDropdown = ref(null)

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
}

const formatFecha = (fecha) => {
  if (!fecha) return ''
  const d = new Date(fecha)
  return d.toLocaleString('es-CO', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const handleNotificationClick = async (notif) => {
  if (!notif.is_read) {
    await notifications.markAsRead(notif.id)
  }
  showNotifications.value = false
  
  if (notif.parche_id) {
    router.push({
      path: `/parches/${notif.parche_id}`,
      query: { highlight: notif.related_type, id: notif.related_id }
    })
  }
}

const closeDropdown = (e) => {
  if (notifDropdown.value && !notifDropdown.value.contains(e.target)) {
    showNotifications.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
  if (auth.user) {
    notifications.fetchNotifications()
  }
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}
</script>
