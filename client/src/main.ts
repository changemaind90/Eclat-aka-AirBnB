import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { useAuthStore } from "@/stores/auth";
import "./assets/styles/reset.css";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

app.config.errorHandler = (err) => {
  console.error("Глобальная ошибка:", err);
};

const authStore = useAuthStore();
authStore.initialize();

window.addEventListener("auth:unauthorized", () => {
  authStore.logout(router);
});

app.mount("#app");
