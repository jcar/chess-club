import { expect, test } from "@playwright/test";

test("worksheet and answer key have the same exercises as the lesson", async ({ page }) => {
  await page.goto("./print/lesson/s3-mate/");
  const ws = page.getByTestId("print-exercise");
  await expect(ws).toHaveCount(7); // 4 practice + 3 check
  await expect(page.getByText("Name: ")).toHaveCount(2);
  await page.goto("./print/lesson/s3-mate/?key=1");
  await expect(page.getByTestId("print-exercise")).toHaveCount(7);
  await expect(page.getByText("Qxf7#").first()).toBeVisible(); // scholar's mate answer
  await expect(page.getByText("Game card")).toBeVisible();
});

test("present mode steps through the script", async ({ page }) => {
  await page.goto("./teach/lesson/s1-knight/");
  await page.getByTestId("present").click();
  await expect(page.getByTestId("present-mode")).toContainText("1 /");
  await page.getByTestId("present-next").click();
  await expect(page.getByTestId("present-mode")).toContainText("2 /");
});

test("planner groups kids who are here", async ({ page }) => {
  await page.goto("./teach/roster/");
  for (const n of ["Ana", "Ben", "Cy"]) {
    await page.getByTestId("kid-name").fill(n);
    await page.getByRole("button", { name: "Add kid" }).click();
  }
  await page.goto("./teach/plan/");
  await page.getByRole("button", { name: "Everyone" }).click();
  await expect(page.getByText("Step 1 · 3 kids")).toBeVisible();
  await expect(page.getByText("3×")).toBeVisible();
});

test("worksheet can add a set of 8 extra puzzles with credit", async ({ page }) => {
  await page.goto("./print/lesson/s6-pin/");
  await page.getByTestId("extra-toggle").click(); // state follows the URL, so not .check()
  await expect(page.getByTestId("print-exercise")).toHaveCount(6 + 8);
  await expect(page.getByText("Lichess puzzle database").first()).toBeVisible();
  await page.getByLabel("Puzzle set").selectOption("2");
  await expect(page).toHaveURL(/set=2/);
});
