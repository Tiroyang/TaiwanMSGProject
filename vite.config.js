import { defineConfig } from 'vite'
import tailwindcss from "@tailwindcss/vite";
import react from '@vitejs/plugin-react'
import packageJson from "./package.json";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),  
    ],

    define: {
        __APP_VERSION__:
            JSON.stringify(
                packageJson.version
            ),

        __BUILD_TIME__:
            JSON.stringify(
                new Date().toISOString()
            ),
    },
});