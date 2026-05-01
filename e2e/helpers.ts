import { Page, expect } from "@playwright/test";

export const USERS = {
  barro:      { email: process.env.TEST_EMAIL_BARRO      || "aissatou@2si.sn", password: process.env.TEST_PASSWORD || "Admin@2024" },
  logistique: { email: process.env.TEST_EMAIL_LOGISTIQUE || "fatou@2si.sn",    password: process.env.TEST_PASSWORD || "Admin@2024" },
  admin:      { email: process.env.TEST_EMAIL_ADMIN      || "admin@2si.sn",    password: process.env.TEST_PASSWORD || "Admin@2024" },
};

export async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  // Attendre que le formulaire soit visible
  await page.waitForSelector('input[type="email"]', { timeout: 15_000 });
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole("button", { name: /se connecter/i }).click();
  // Attendre la redirection vers /admin
  await page.waitForURL(/\/admin/, { timeout: 15_000 });
}

export async function navigateTo(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
}

/** Attend qu'un toast apparaisse et vérifie qu'il contient le texte attendu */
export async function expectToast(page: Page, text: string | RegExp) {
  const toast = page.locator("[data-sonner-toast], [role='status'], .toast").first();
  await expect(toast).toContainText(text, { timeout: 8_000 });
}

/** Attend que le spinner de chargement disparaisse */
export async function waitForLoaded(page: Page) {
  await page.waitForSelector(".animate-spin", { state: "detached", timeout: 10_000 }).catch(() => {});
  await page.waitForLoadState("networkidle");
}
