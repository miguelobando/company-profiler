import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['**/*.test.ts', '**/*.spec.ts'],
        exclude: ['node_modules', 'dist'],
        globals: true,
        environment: 'node',
        watch: false,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            all: true,
            exclude: ['node_modules', 'dist'],
            include: ['**/*.ts'],
        },
    },
});