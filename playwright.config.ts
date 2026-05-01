import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,          // workflow séquentiel — les tests dépendent l'un de l'autre
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["html", { open: "never" }], ["list"]],

  use: {
    baseURL: process.env.BASE_URL || "http://localhost:8080",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },

  projects: [
    // 1. Setup : login et sauvegarde des sessions
    { name: "setup-barro",      testMatch: "**/setup/barro.setup.ts"      },
    { name: "setup-logistique", testMatch: "**/setup/logistique.setup.ts" },

    // 2. Tests fonctionnels — chaque projet recharge la session correspondante
    {
      name: "barro",
      testMatch: "**/barro/**/*.spec.ts",
      dependencies: ["setup-barro"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/barro.json",
      },
    },
    {
      name: "logistique",
      testMatch: "**/logistique/**/*.spec.ts",
      dependencies: ["setup-logistique"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/logistique.json",
      },
    },
    {
      name: "workflow",
      testMatch: "**/workflow/**/*.spec.ts",
      dependencies: ["setup-barro", "setup-logistique"],
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
