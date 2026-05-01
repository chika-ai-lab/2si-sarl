import { test as setup } from "@playwright/test";
import { login, USERS } from "../helpers";

setup("login Mme Barro (commercial)", async ({ page }) => {
  await login(page, USERS.barro.email, USERS.barro.password);
  await page.evaluate(() => localStorage.setItem("gestemc_onboarding_v1", "1"));
  await page.context().storageState({ path: "e2e/.auth/barro.json" });
});
