import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [] as Array<{
      id: number
      message: string
      type: 'success' | 'error' | 'info'
    }>
  }),
  actions: {
    add(message: string, type: 'success' | 'error' | 'info' = 'info') {
      const id = Date.now() + Math.random()
      this.notifications.push({
        id,
        message,
        type
      })
      setTimeout(() => {
        this.remove(id)
      }, 3000)
    },
    remove(id: number) {
      const index = this.notifications.findIndex((n) => n.id === id)
      if (index !== -1) {
        this.notifications.splice(index, 1)
      }
    }
  }
})