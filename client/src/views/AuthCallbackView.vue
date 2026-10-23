<template>
  <div class="auth-callback">Вход...</div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
  const token = route.query.token;
  if (typeof token === "string" && token) {
    localStorage.setItem("token", token);
    await authStore.checkAuth();
    router.replace("/profile");
  } else {
    router.replace("/login");
  }
});
</script>

<style scoped>
.auth-callback {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  font-size: 1.2rem;
}
</style>
