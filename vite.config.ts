import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      external: [
        "@radix-ui/react-slot",
        "class-variance-authority",
        "@radix-ui/react-dialog",
        "lucide-react",
        "@radix-ui/react-separator",
        "@radix-ui/react-slider",
        "@radix-ui/react-dropdown-menu",
        "@radix-ui/react-progress",
        "@radix-ui/react-select",
      ],
    },
  },
})
