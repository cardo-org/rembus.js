export default {
    transform: {},
    testEnvironment: 'node', // or 'jsdom' if you are testing browser code.
    testTimeout: 10000,
    coverageReporters: ['lcov', 'text'],
    collectCoverageFrom: ['src/**/*.js'],
};