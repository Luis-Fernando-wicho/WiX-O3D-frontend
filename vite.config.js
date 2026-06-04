import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/WiX-O3D-frontend/", // <--- AGREGA ESTA LÍNEA (Debe coincidir exactamente con el nombre de tu repositorio de GitHub)
});
