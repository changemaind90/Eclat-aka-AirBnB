import { defineStore } from "pinia";
import api, { API_BASE_URL } from "@/api";
import type { User, Booking } from "@/types";
import type { Router } from "vue-router";

type TokenPayload = {
  id?: number | string;
  sub?: number | string;
  userId?: number | string;
  email?: string;
  name?: string;
  exp?: number;
};

function decodeBase64Url(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );
  return atob(padded);
}

function userFromToken(token: string): User | null {
  try {
    const payload = JSON.parse(
      decodeBase64Url(token.split(".")[1] ?? ""),
    ) as TokenPayload;
    if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) {
      return null;
    }
    const id = Number(payload.id ?? payload.sub ?? payload.userId);
    if (!id || isNaN(id)) return null;
    return {
      id,
      name: payload.name || payload.email?.split("@")[0] || "",
      email: payload.email || "",
      createdAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}


function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  const message = (error as { message?: string } | null)?.message;
  return message || fallback;
}

function saveToken(token: string, rememberMe = true) {
  const storage = rememberMe ? localStorage : sessionStorage;
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  storage.setItem("token", token);
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isAuthenticated: false,
    user: null as User | null,
    error: null as string | null,
    isLoading: false,
  }),

  actions: {
    initialize() {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (token) {
        this.isAuthenticated = true;
        this.checkAuth().catch(() => this.logout());
      }
    },

    async login(credentials: {
      email: string;
      password: string;
      rememberMe?: boolean;
    }) {
      try {
        this.isLoading = true;
        this.error = null;
        const response = await api.post("/auth/login", {
          email: credentials.email,
          password: credentials.password,
        });
        if (!response.data?.accessToken) {
          throw new Error("Нет токена!");
        }
        saveToken(response.data.accessToken, credentials.rememberMe ?? true);
        this.user =
          response.data.user ?? userFromToken(response.data.accessToken);
        this.isAuthenticated = true;
        return response.data;
      } catch (error) {
        this.error = errorMessage(error, "Неверные учетные данные");
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async register(userData: {
      name: string;
      email: string;
      password: string;
    }) {
      try {
        this.isLoading = true;
        this.error = null;
        const response = await api.post("/auth/register", {
          email: userData.email,
          password: userData.password,
        });
        if (!response.data?.accessToken) {
          throw new Error("No token received");
        }
        saveToken(response.data.accessToken);
        this.user =
          response.data.user ?? userFromToken(response.data.accessToken);
        if (this.user && userData.name) {
          this.user.name = userData.name;
        }
        this.isAuthenticated = true;
        return response.data;
      } catch (error) {
        this.error = errorMessage(error, "Ошибка регистрации");
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchUserBookings(): Promise<Booking[]> {
      const response = await api.get("/booking");
      return response.data;
    },

    async createBooking(
      listingId: number,
      dates: { start: string; end: string },
    ): Promise<Booking> {
      const response = await api.post("/booking", {
        listingId,
        startDate: dates.start,
        endDate: dates.end,
      });
      return response.data;
    },

    async cancelBooking(bookingId: number): Promise<void> {
      await api.post(`/booking/cancel/${bookingId}`);
    },

    async completeBooking(bookingId: number): Promise<void> {
      await api.post(`/booking/complete/${bookingId}`);
    },

    async checkAuth() {
      try {
        this.isLoading = true;
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) return false;

        const user = userFromToken(token);
        if (!user) throw new Error("Invalid token");

        this.user = user;
        this.isAuthenticated = true;
        return true;
      } catch {
        this.logout();
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    logout(router?: Router) {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (token) {
        void api
          .post("/auth/logout", undefined, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .catch(() => undefined);
      }
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      this.isAuthenticated = false;
      this.user = null;
      if (router) {
        void router.push("/login");
      }
    },

    async socialLogin(provider: string) {
      window.location.href = `${API_BASE_URL}/auth/${provider}`;
    },
  },
});
