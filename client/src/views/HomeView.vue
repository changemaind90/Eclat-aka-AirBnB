
<template>
  <div class="home-view">
    <H1Title @search="handleSearch" />

    <div v-if="loading">Загрузка объявлений...</div>
    <div v-else-if="error">{{ error }}</div>

   <ListingsContainer 
    :listings="filteredListings"
    :can-book="authStore.isAuthenticated"
    :can-cancel="false" 
    @listing-click="goToListing"
  />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useListingsStore } from '@/stores/listings'
import { useAuthStore } from '@/stores/auth'
import H1Title from '@/components/H1Title.vue'
import ListingsContainer from '@/components/ListingsContainer.vue'

const authStore = useAuthStore()
const router = useRouter()
const listingsStore = useListingsStore()
const loading = ref(true)
const error = ref<string | null>(null)
const filters = ref<{ query: string; type: string }>({ query: '', type: '' })

const filteredListings = computed(() => {
  const query = filters.value.query.trim().toLowerCase()
  if (!query) return listingsStore.allListings
  return listingsStore.allListings.filter(
    (listing) =>
      listing.title.toLowerCase().includes(query) ||
      listing.address.toLowerCase().includes(query)
  )
})

onMounted(async () => {
  try {
    const requests: Promise<unknown>[] = [listingsStore.fetchAllListings()]
    if (authStore.isAuthenticated) {
      requests.push(listingsStore.fetchUserBookings())
    }
    await Promise.all(requests)
  } catch {
    error.value = 'Ошибка загрузки объявлений'
  } finally {
    loading.value = false
  }
})

const handleSearch = (value: { query: string; type: string }) => {
  filters.value = value
}

const goToListing = (id: number) => {
  router.push(`/listing/${id}`)
}
</script>

<style scoped>
.home-view {
  min-height: calc(100vh - 200px);
}
</style>
