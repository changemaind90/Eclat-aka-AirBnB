<template>
  <div class="profile-view">
    <div class="profile-inner">
      <UserInfo v-if="user" :user="user" />
      <div v-if="loading">Загрузка ваших бронирований...</div>
      <div v-else-if="error">{{ error }}</div>
      <div class="listings-container">
        <ListingCard
          v-for="listing in displayedListings"
          :key="listing.id"
          :listing="listing"
          :can-book="authStore.isAuthenticated"
          @book="handleBook"
          :can-cancel="authStore.isAuthenticated"
          :can-edit="
            authStore.user?.id !== undefined &&
            Number(authStore.user.id) === listing.ownerId
          "
          @edit="handleEdit"
          @click="goToListing(listing.id)"
          @cancel-booking="cancelBooking"
        />
      </div>
    </div>

    <CreateListingForm
      v-if="authStore.isAuthenticated"
      :listing-to-edit="editingListing"
      @success="handleUpdateSuccess"
      @cancel="editingListing = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore, useListingsStore } from "@/stores";
import UserInfo from "@/components/UserInfo.vue";
import CreateListingForm from "@/components/CreateListingForm.vue";
import ListingCard from "@/components/ListingCard.vue";
import type { Listing } from "@/types";

const authStore = useAuthStore();
const listingsStore = useListingsStore();
const router = useRouter();

const loading = ref(false);
const error = ref<string | null>(null);
const editingListing = ref<Listing | null>(null);

const user = computed(() => authStore.user);

const displayedListings = computed(() => {
  const bookedIds = new Set(
    listingsStore.userBookings
      .filter((b) => b.status === "PENDING" || b.status === "CONFIRMED")
      .map((b) => b.listingId),
  );
  const bookedListings = listingsStore.allListings.filter((l) =>
    bookedIds.has(l.id),
  );
  const seen = new Set<number>();
  const result: Listing[] = [];
  for (const listing of [...bookedListings, ...listingsStore.userListings]) {
    if (!seen.has(listing.id)) {
      seen.add(listing.id);
      result.push(listing);
    }
  }
  return result;
});

const goToListing = (id: number) => {
  router.push(`/listing/${id}`);
};

const handleBook = async () => {
  await loadData();
};

const handleEdit = (listing: Listing) => {
  editingListing.value = listing;
};

const handleUpdateSuccess = async () => {
  editingListing.value = null;
  await loadData();
};

const cancelBooking = async () => {
  await loadData();
};

const loadData = async () => {
  loading.value = true;
  error.value = null;
  try {
    await authStore.checkAuth();
    await Promise.all([
      listingsStore.fetchAllListings(),
      listingsStore.fetchUserListings(),
      listingsStore.fetchUserBookings(),
    ]);
  } catch {
    error.value = "Ошибка загрузки данных";
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);
</script>

<style>
.profile-inner {
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
}
</style>
