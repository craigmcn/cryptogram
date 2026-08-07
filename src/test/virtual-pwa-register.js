// Test-only stand-in for vite-plugin-pwa's `virtual:pwa-register` module,
// which only exists once the VitePWA plugin runs. Aliased in
// vitest.config.js so pwa.js resolves during tests; individual tests
// override this via vi.mock("virtual:pwa-register", ...).
export const registerSW = () => () => {};
