import { test as setup } from "@playwright/test";
import { login, USERS } from "../helpers";

setup("login Logistique (Fatou Sarr)", async ({ page }) => {
  await login(page, USERS.logistique.email, USERS.logistique.password);
  await page.evaluate(() => localStorage.setItem("gestemc_onboarding_v1", "1"));
  await page.context().storageState({ path: "e2e/.auth/logistique.json" });
});
