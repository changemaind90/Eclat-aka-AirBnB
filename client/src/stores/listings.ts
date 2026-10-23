import { defineStore } from "pinia";
import api from "@/api";
import type { Listing, Booking } from "@/types";
import { useAuthStore } from "@/stores/auth";

export const useListingsStore = defineStore("listings", {
  state: () => ({
    allListings: [] as Listing[],
    userListings: [] as Listing[],
    currentListing: null as Listing | null,
    isLoading: false,
    error: null as string | null,
    userBookings: [] as Booking[],
  }),

  actions: {
    async fetchUserListings(): Promise<Listing[]> {
      try {
        this.isLoading = true;
        const authStore = useAuthStore();
        if (!authStore.user?.id || isNaN(authStore.user.id)) {
          throw new Error("User ID не доступен или невалиден");
        }
        const response = await api.get("/listings");
        this.userListings = response.data.items ?? response.data;
        return this.userListings;
      } catch (error) {
        console.error("Ошибка загрузки:", error);
        this.error = "Ошибка загрузки объявлений пользователя";
        return [];
      } finally {
        this.isLoading = false;
      }
    },

    async fetchAllListings(): Promise<Listing[]> {
      try {
        this.isLoading = true;
        const response = await api.get("/listings/all");
        this.allListings = response.data.items ?? response.data;
        return this.allListings;
      } catch (error) {
        console.error("Ошибка загрузки:", error);
        this.error = "Ошибка загрузки всех объявлений";
        return [];
      } finally {
        this.isLoading = false;
      }
    },

    async fetchUserBookings(): Promise<Booking[]> {
      try {
        const response = await api.get("/booking");
        this.userBookings = response.data;
        return this.userBookings;
      } catch (error) {
        console.error("Ошибка загрузки бронирований:", error);
        return [];
      }
    },

    async fetchById(id: string): Promise<Listing> {
      this.isLoading = true;
      try {
        const response = await api.get(`/listings/${id}`);
        this.currentListing = response.data;
        return response.data;
      } catch (error) {
        console.error("Ошибка загрузки:", error);
        this.error = "Объявление не найдено";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteListing(id: string) {
      try {
        await api.delete(`/listings/${id}`);
        this.userListings = this.userListings.filter((l) => l.id !== Number(id));
      } catch (error) {
        console.error("Error deleting listing:", error);
        throw error;
      }
    },

    async updateListing(id: string, data: Partial<Listing>): Promise<Listing> {
      try {
        const authStore = useAuthStore();
        const listing = this.userListings.find((l) => l.id === Number(id));
        if (!listing || listing.ownerId !== Number(authStore.user?.id)) {
          throw new Error(
            "Вы не можете редактировать объявление потому что вы его не подавали!",
          );
        }

        const response = await api.patch(`/listings/${id}`, data);
        const index = this.userListings.findIndex((l) => l.id === Number(id));
        if (index !== -1) {
          this.userListings[index] = response.data;
        }
        return response.data;
      } catch (error) {
        console.error("Error updating listing:", error);
        throw error;
      }
    },

    async createBooking(
      listingId: number,
      dates: { start: string; end: string },
    ) {
      try {
        const response = await api.post("/booking", {
          listingId,
          startDate: dates.start,
          endDate: dates.end,
        });
        await this.fetchUserBookings();
        return response.data;
      } catch (error) {
        console.error("Ошибка бронирования:", error);
        throw error;
      }
    },

    async cancelBooking(bookingId: number) {
      try {
        const response = await api.post(`/booking/cancel/${bookingId}`);
        await this.fetchUserBookings();
        return response.data;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : (error as { message?: string })?.message;
        console.error("Ошибка отмены:", message);
        throw error;
      }
    },

    async createNewListing(listingData: {
      title: string;
      description: string;
      address: string;
      pricePerNight: number;
      numberOfGuests: number;
    }): Promise<Listing> {
      this.isLoading = true;
      try {
        const authStore = useAuthStore();
        if (!authStore.user) {
          throw new Error("Пользователь не авторизован");
        }

        const response = await api.post("/listings", listingData);
        this.userListings.push(response.data);
        return response.data;
      } catch (error) {
        console.error("Ошибка создания:", error);
        this.error = "Ошибка создания объявления";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
