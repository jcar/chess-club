import { expect, test } from "@playwright/test";
import { tapSquare } from "./helpers";

test("a kid passes a lesson on the iPad and the teacher records the pass code", async ({ page }) => {
  await page.goto("./student/");
  await page.getByTestId("lesson-s1-board").click();
  await page.getByText("Skip to the challenge").click();
  await page.getByTestId("start-check").click();

  // c1: light corner is on the right; c2: diagonal; c3: tap a8
  await page.getByTestId("option-0").click();
  await page.getByTestId("next").click();
  await page.getByTestId("option-2").click();
  await page.getByTestId("next").click();
  await tapSquare(page, "a8");
  await expect(page.getByTestId("feedback-right")).toBeVisible();
  await page.getByTestId("next").click();

  await expect(page.getByTestId("result")).toContainText("3 of 3");
  const code = (await page.getByTestId("pass-code").textContent())!.trim();
  expect(code).toMatch(/^S1-L1-[A-Z0-9]{2}$/);

  // Teacher side, same browser (in real life: another device).
  await page.goto("./teach/roster/");
  await page.getByTestId("kid-name").fill("Maya");
  await page.getByRole("button", { name: "Add kid" }).click();
  await page.getByLabel("Kid", { exact: true }).selectOption({ label: "Maya" });
  await page.getByTestId("pass-code-input").fill(code.toLowerCase());
  await page.getByRole("button", { name: "Record" }).click();
  await expect(page.getByText("Maya passed “The Chessboard”")).toBeVisible();
  await expect(page.getByText("1/7 lessons")).toBeVisible();
});

test("practice gives hints and a 'show me' after two misses", async ({ page }) => {
  await page.goto("./student/lesson/s1-rook/");
  await page.getByTestId("start").click();
  await tapSquare(page, "e5"); // not a rook square
  await page.getByTestId("check").click();
  await expect(page.getByTestId("feedback-wrong")).toBeVisible();
  await page.getByRole("button", { name: "Try again" }).click();
  await tapSquare(page, "e6");
  await page.getByTestId("check").click();
  await page.getByRole("button", { name: "Show me" }).click();
  await expect(page.getByTestId("next")).toBeVisible();
});

test("a club iPad: kid taps their name and the pass is saved to them", async ({ page }) => {
  await page.goto("./teach/roster/");
  await page.getByTestId("kid-name").fill("Leo");
  await page.getByRole("button", { name: "Add kid" }).click();
  await page.goto("./student/");
  await page.getByRole("button", { name: "Leo" }).click();
  await expect(page.getByRole("heading", { name: "Hi, Leo! 👋" })).toBeVisible();
  await page.getByTestId("lesson-s1-setup").click();
  await page.getByText("Skip to the challenge").click();
  await page.getByTestId("start-check").click();
  await tapSquare(page, "e8");
  await page.getByTestId("next").click();
  await tapSquare(page, "c1");
  await page.getByTestId("next").click();
  await page.getByTestId("option-1").click();
  await page.getByTestId("next").click();
  await expect(page.getByText("Saved for Leo")).toBeVisible();
});

test("mini-game: the bot answers a move", async ({ page }) => {
  await page.goto("./student/lesson/s1-pawn/");
  await page.getByTestId("play-game").click();
  await tapSquare(page, "e2");
  await tapSquare(page, "e4");
  await expect(page.getByTestId("game-status")).toHaveText("Your move", { timeout: 3000 });
});

test("castling works with tap-to-move", async ({ page }) => {
  await page.goto("./student/lesson/s4-castle/");
  await page.getByTestId("start").click();
  await tapSquare(page, "e1");
  await tapSquare(page, "g1");
  await expect(page.getByTestId("feedback-right")).toBeVisible();
});

test("en passant works with tap-to-move", async ({ page }) => {
  await page.goto("./student/lesson/s4-en-passant/");
  await page.getByTestId("start").click();
  await tapSquare(page, "e5");
  await tapSquare(page, "d6");
  await expect(page.getByTestId("feedback-right")).toBeVisible();
});

test("extra Lichess puzzles run in student mode", async ({ page }) => {
  await page.goto("./student/lesson/s6-fork/");
  await page.getByTestId("extra").click();
  await expect(page.getByTestId("prompt")).toContainText(/to move\. (Find the fork|Attack two things)/);
  await expect(page.getByLabel(/Puzzles 1 of 8/)).toBeVisible();
});
