import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        host: true,
        target: 'http://127.0.0.1:8000',
        port: 8000, // Specify the Vite dev server port
        proxy: {
            '/api': 'http://127.0.0.1:3000',
            '/create-Container': 'http://127.0.0.1:3000',
            '/addNewObj': 'http://127.0.0.1:3000',
            '/getAllObjs': 'http://127.0.0.1:3000',
            '/deleteObj': 'http://127.0.0.1:3000'
        }
    },
});
