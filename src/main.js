// admin/js/admin-app/src/main.js
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "./style.css";
import "material-icons/iconfont/material-icons.css";

const app = createApp(App);
app.use(createPinia());
app.mount("#ptm-admin-app");
