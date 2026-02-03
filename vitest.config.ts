import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,                // Omogućava globalne funkcije kao describe/test
    environment: "jsdom",         // Za React komponente i DOM
    include: [
      "src/**/*.{test,spec}.{ts,tsx}",
      "test/**/*.{test,spec}.{ts,tsx}"  // Dodaje tvoj test folder
    ],
    exclude: [
      "**/node_modules/**",
      "**/dist/**"
    ],
    watch: false                  // Možeš uključiti true za automatsko rerun na promeni
  }
});
