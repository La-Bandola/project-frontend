import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api.js'

export const useNotificationsStore = defineStore('notifications', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  const unreadCount = computed(() => {
    return items.value.filter(n => !n.is_read).length
  })

  const fetchNotifications = async () => {
    loading.value = true
    try {
      const { data } = await api.get('/users/notifications/')
      items.value = data
      error.value = null
    } catch (e) {
      error.value = 'Error al cargar notificaciones'
    } finally {
      loading.value = false
    }
  }

  const markAsRead = async (id) => {
    try {
      await api.patch(`/users/notifications/${id}/read/`)
      const notif = items.value.find(n => n.id === id)
      if (notif) notif.is_read = true
    } catch (e) {
      console.error('Error al marcar notificación como leída', e)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.post('/users/notifications/read-all/')
      items.value.forEach(n => n.is_read = true)
    } catch (e) {
      console.error('Error al marcar todas como leídas', e)
    }
  }

  return { items, loading, error, unreadCount, fetchNotifications, markAsRead, markAllAsRead }
})
