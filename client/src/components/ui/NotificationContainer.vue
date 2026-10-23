<template>
  <div class="notifications">
    <div v-for="notification in notifications" :key="notification.id">
      {{ notification.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useNotificationStore } from '@/stores/notification'
const store = useNotificationStore()
const { notifications } = storeToRefs(store)
</script>