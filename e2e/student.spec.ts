import { expect, test } from "@playwright/test";
import { tapSquare } from "./helpers";
import { stationFragment } from "../src/lib/station";
import { transferFragment } from "../src/lib/transfer";

function localToday(): string {
  const d = new Date();
  const z = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

const KIDS = [
  { id: "k1", name: "Maya", animal: "🐶" },
  { id: "k2", name: "Leo", animal: "🦊" },
];

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
  await tapSquare(page, "e6"); // board stays live: no "Try again" to read
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
  await expect(page.getByRole("heading", { name: /Hi, Leo!/ })).toBeVisible();
  await page.getByTestId("lesson-s1-setup").click();
  await page.getByText("Skip to the challenge").click();
  await page.getByTestId("start-check").click();
  await tapSquare(page, "e8");
  await page.getByTestId("next").click();
  await tapSquare(page, "c1");
  await page.getByTestId("next").click();
  await page.getByTestId("option-1").click();
  await page.getByTestId("next").click();
  await expect(page.getByTestId("result")).toContainText("Leo");
  await expect(page.getByTestId("pass-qr")).toContainText("Saved!");
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

test("a 6th grader starting fresh gets Step 1, and easy reading is their choice", async ({ page }) => {
  await page.goto("./teach/roster/");
  await page.getByTestId("kid-name").fill("Sam");
  await page.getByLabel("Grade").selectOption("6");
  await page.getByRole("button", { name: "Add kid" }).click();
  await page.goto("./student/");
  await page.getByRole("button", { name: "Sam" }).click();
  await expect(page.getByTestId("lesson-s1-board")).toContainText("The Chessboard"); // regular wording
  await page.getByTestId("easy-reading").click();
  await expect(page.getByTestId("lesson-s1-board")).toContainText("The Board Is a Town");
  await page.reload();
  await expect(page.getByTestId("easy-reading")).toHaveAttribute("aria-checked", "true"); // saved to Sam, not lost
});

test("Step 7–8 'best' moves: a plan move is graded, and a weaker one gets a gentle nudge", async ({ page }) => {
  await page.goto("./student/lesson/s7-center/");
  await page.getByTestId("start").click();
  await tapSquare(page, "e4"); // p1: tap a center square
  await expect(page.getByTestId("feedback-right")).toBeVisible();
  await page.getByTestId("next").click();
  await tapSquare(page, "a2"); // p2: a2-a3 is legal but not the plan
  await tapSquare(page, "a3");
  await expect(page.getByTestId("feedback-wrong")).toContainText("not the move we're looking for");
  await tapSquare(page, "e2"); // the board stays live after a miss: just try again
  await tapSquare(page, "e4");
  await expect(page.getByTestId("feedback-right")).toBeVisible();

  await page.goto("./student/lesson/s8-opposition/");
  await page.getByTestId("start").click();
  await tapSquare(page, "e3"); // p1: the king leads the pawn
  await tapSquare(page, "e4");
  await expect(page.getByTestId("feedback-right")).toBeVisible();
});

test("station card: a borrowed iPad opens the lesson, locked, easy reading, and asks who's playing", async ({ page }) => {
  // Leftovers from another kid on this iPad must not carry over.
  await page.goto("./student/");
  await page.evaluate(() => localStorage.setItem("chessclub:me", JSON.stringify({ passed: { "s1-board": { date: "2020-01-01", stars: 3 } } })));
  await page.goto("./student/go/#" + stationFragment({ club: "Test Club", date: localToday(), lesson: "s1-rook", lock: true, easy: true, kids: KIDS }));
  await expect(page).toHaveURL(/student\/lesson\/s1-rook\//);
  await expect(page.getByTestId("who")).toBeVisible();
  await page.getByTestId("who-Maya").click();
  await expect(page.getByTestId("player")).toContainText("Maya");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("The Rook Goes Straight"); // kid wording
  // Back to student home: still locked, and no way to the coach pages.
  page.once("dialog", (d) => d.accept());
  await page.getByLabel("Back to lessons").click();
  await expect(page.getByText("Today's lesson")).toBeVisible();
  await expect(page.getByRole("link", { name: "Home" })).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("chessclub:me"))).toBe(JSON.stringify({ passed: {} }));
});

test("station card: a pass shows a QR for the grown-up, then 'Next kid'", async ({ page }) => {
  await page.goto("./student/go/#" + stationFragment({ club: "Test Club", date: localToday(), lesson: "s1-board", lock: false, easy: false, kids: KIDS }));
  await page.getByTestId("who-Leo").click();
  await page.getByText("Skip to the challenge").click();
  await page.getByTestId("start-check").click();
  await page.getByTestId("option-0").click();
  await page.getByTestId("next").click();
  await page.getByTestId("option-2").click();
  await page.getByTestId("next").click();
  await tapSquare(page, "a8");
  await page.getByTestId("next").click();
  await expect(page.getByTestId("pass-qr")).toBeVisible();
  const qr = await page.locator("[data-qr]").getAttribute("data-qr");
  expect(qr).toMatch(/\/teach\/wrapup\/#q=/);
  await page.getByTestId("next-kid").click();
  await expect(page.getByTestId("who")).toBeVisible();

  // The grown-up's phone opens that code: Leo (added there with the same id) gets the pass.
  await page.goto("./teach/roster/");
  await page.evaluate((kids) => localStorage.setItem("chessclub:club", JSON.stringify({ version: 1, name: "Test Club", kids, attendance: {}, passes: {}, games: [], ladder: kids.map((k: { id: string }) => k.id) })), KIDS);
  await page.goto(qr!.replace(/^https?:\/\/[^/]+/, ""));
  await expect(page.getByTestId("wrapup-log")).toContainText("Leo passed “The Chessboard”");
  await expect(page.getByRole("button", { name: "Leo passed The Chessboard" })).toHaveAttribute("aria-pressed", "true");
});

test("wrap-up: an anonymous pass asks who it was, and a helper's batch code adds their ticks", async ({ page }) => {
  await page.goto("./teach/roster/");
  await page.evaluate((kids) => localStorage.setItem("chessclub:club", JSON.stringify({ version: 1, name: "Test Club", kids, attendance: {}, passes: {}, games: [], ladder: kids.map((k: { id: string }) => k.id) })), KIDS);
  await page.goto("./teach/wrapup/#" + transferFragment({ kind: "pass", date: localToday(), lesson: "s1-rook" }));
  await expect(page.getByTestId("who-passed")).toContainText("The Rook");
  await page.getByTestId("who-passed-kids").getByRole("button", { name: "Maya" }).click();
  await expect(page.getByTestId("wrapup-log")).toContainText("Maya passed “The Rook”");
  await page.goto("./teach/wrapup/#" + transferFragment({ kind: "batch", date: localToday(), present: ["k1", "k2"], passes: [["k2", "s1-rook"]], from: "Ms. Lopez" }));
  await expect(page.getByTestId("wrapup-log")).toContainText("From Ms. Lopez: 1 pass, 1 more here.");
});

test("extra iPad games: King Tag against the bot, and Knight Hops", async ({ page }) => {
  await page.goto("./student/lesson/s1-queen-king/");
  await page.getByTestId("game-king-tag").click();
  await tapSquare(page, "e2");
  await tapSquare(page, "e3");
  await expect(page.getByTestId("game-status")).toHaveText("Your move", { timeout: 3000 });
  await page.goto("./student/lesson/s1-knight/");
  await page.getByTestId("game-knight-hops").click();
  await expect(page.getByTestId("hops-status")).toContainText("Star 1 of 5");
});

test("easy reading shows pictures on answers", async ({ page }) => {
  await page.goto("./student/go/#" + stationFragment({ club: "Test Club", date: localToday(), lesson: "s1-board", lock: false, easy: true, kids: [] }));
  await page.getByTestId("start").click();
  await tapSquare(page, "h1"); // p1: the light corner on the right
  await page.getByTestId("next").click();
  await expect(page.getByTestId("option-0")).toContainText("⬜"); // p2: Light / Dark
  await expect(page.getByTestId("option-1")).toContainText("⬛");
  await expect(page.getByTestId("option-0")).toContainText("🔴"); // colour marker read aloud as "Red"
});
