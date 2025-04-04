import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        //environment: 'jsdom',  // Using jsdom for browser-like environment
        environment: 'node',  // Using jsdom for browser-like environment
        setupFiles: ['./vitest.setup.js'],
        include: ['**/*.test.js', '**/*.browser.test.js'],
    },
});
