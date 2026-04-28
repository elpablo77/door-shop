import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// В dev-режиме проксируем API на локальные микросервисы.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api/auth": "http://localhost:8081",
      "/api/catalog": "http://localhost:8082",
      "/api/orders": "http://localhost:8083",
    },
  },
});
