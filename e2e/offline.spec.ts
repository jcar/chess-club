import { expect, test } from "@playwright/test";

// The service worker caches the whole site on first visit.
test("works offline after one visit, including pages never opened", async ({ page, context, browserName }, info) => {
  test.skip(info.project.name !== "desktop" || browserName !== "chromium", "one browser is enough");
  await page.goto("./");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  // Wait until the precache has populated.
  await expect
    .poll(async () => page.evaluate(async () => (await (await caches.open("chessclub-v2")).keys()).length), { timeout: 30_000 })
    .toBeGreaterThan(100);
  await context.setOffline(true);
  await page.goto("./teach/lesson/s3-escape/");
  await expect(page.getByRole("heading", { name: "Getting Out of Check" })).toBeVisible();
  await page.goto("./print/lesson/s2-free/?key=1");
  await expect(page.getByTestId("print-exercise").first()).toBeVisible();
});
