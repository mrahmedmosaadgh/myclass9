import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';
import { splitVendorChunkPlugin } from 'vite';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.js',
            refresh: true,
        }),
        vue({
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                },
                // compilerOptions: {
                //     isCustomElement: (tag) => tag.startsWith('q-')
                // }
            },
        }),
        quasar({
            sassVariables: false
        }),
        splitVendorChunkPlugin() // Add this plugin to split vendor chunks
    ],
    resolve: {
        alias: {
            '@': '/resources/js',
        },
    },


    build: {
        // outDir: 'public/build',  // 👈 match Laravel’s default
                        // outDir: 'public_html/build',   // 👈 Important: match your hosting root
        // manifest: true,                // 👈 Ensure manifest.json is generated
        // emptyOutDir: true,             // Clean old files before building
        // chunkSizeWarningLimit: 1000,
        chunkSizeWarningLimit: 2000, // Increase the warning limit to 1000kb
    },

    server: {
        host: 'localhost', // Explicitly set the host
        port: 5173,        // Ensure the port matches the WebSocket connection
        fs: {
            // Allow serving files from one level up to the project root
            allow: ['..', 'node_modules/@quasar/extras']
        }
    }

});













