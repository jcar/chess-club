import { expect, test } from "@playwright/test";

test("worksheet and answer key have the same exercises as the lesson", async ({ page }) => {
  await page.goto("./print/lesson/s3-mate/");
  const ws = page.getByTestId("print-exercise");
  await expect(ws).toHaveCount(7); // 4 practice + 3 check
  await expect(page.getByText("Name: ")).toHaveCount(2);
  await page.goto("./print/lesson/s3-mate/?key=1");
  await expect(page.getByTestId("print-exercise")).toHaveCount(7);
  await expect(page.getByText("Qxf7#").first()).toBeVisible(); // scholar's mate answer
  await expect(page.getByText("Game card · put one on each table")).toBeVisible();
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

test("plan ahead → session pack prints every section from the saved plan", async ({ page }) => {
  await page.goto("./teach/roster/");
  for (const [n, g] of [["Ana", "K"], ["Ben", "1"], ["Cy", "5"]]) {
    await page.getByTestId("kid-name").fill(n);
    await page.getByLabel("Grade").selectOption(g);
    await page.getByRole("button", { name: "Add kid" }).click();
  }
  await page.goto("./teach/plan/");
  await page.getByTestId("plan-date").fill("2030-01-15");
  await page.getByTestId("plan-ipads").fill("2");
  await page.getByLabel("Adult name").fill("Jason");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.getByTestId("plan-groups")).toContainText("Early readers, together");
  await expect(page.getByTestId("plan-groups")).toContainText("👤 Jason");
  // Planning ahead never writes attendance.
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("chessclub:club")!).attendance)).toEqual({});

  await page.goto("./print/session/?date=2030-01-15&tents=1");
  const pack = page.getByTestId("session-pack");
  await expect(pack).toContainText("Agenda");
  await expect(page.getByTestId("station-card")).toHaveCount(1); // the early readers' iPads
  await expect(page.locator("[data-testid=station-card] [data-qr]")).toHaveAttribute("data-qr", /\/student\/go\/#s=/);
  await expect(pack).toContainText("Cy"); // Cy (no iPad) gets named worksheets
  await expect(page.getByTestId("checkoff")).toContainText("Ana");
  await expect(page.getByTestId("name-tent")).toHaveCount(3);
});

test("club printables: sticker chart, ladder, and certificates for everyone who finished", async ({ page }) => {
  await page.goto("./teach/roster/");
  await page.getByTestId("kid-name").fill("Ana");
  await page.getByRole("button", { name: "Add kid" }).click();
  await page.goto("./print/club/?what=chart");
  await expect(page.getByTestId("sticker-chart")).toContainText("Ana");
  await page.goto("./print/club/?what=ladder");
  await expect(page.getByTestId("ladder-chart")).toContainText("Ana");
  await page.goto("./print/certificate/?step=1");
  await expect(page.getByText("Nobody has finished Step 1 yet.")).toBeVisible();
});

test("ladder: a result can't be entered twice after kids swap rungs, and the latest can be undone", async ({ page }) => {
  await page.goto("./teach/roster/");
  for (const n of ["Ana", "Ben"]) {
    await page.getByTestId("kid-name").fill(n);
    await page.getByRole("button", { name: "Add kid" }).click();
  }
  await page.getByLabel("Ana is here").check();
  await page.getByLabel("Ben is here").check();
  await page.goto("./teach/play/");
  await page.getByRole("button", { name: "White won" }).click(); // Ben (lower rung, White) beats Ana
  await expect(page.getByRole("button", { name: "White won" })).toHaveCount(0);
  await expect(page.getByText("White won", { exact: true })).toBeVisible();
  const games = () => page.evaluate(() => JSON.parse(localStorage.getItem("chessclub:club")!).games.length);
  expect(await games()).toBe(1);
  await page.reload();
  await expect(page.getByRole("button", { name: "White won" })).toHaveCount(0); // still recorded after leaving
  await page.getByRole("button", { name: "Undo" }).click();
  expect(await games()).toBe(0);
  await expect(page.getByRole("button", { name: "White won" })).toBeVisible();
});

test("present mode keeps its place after a refresh", async ({ page }) => {
  await page.goto("./teach/lesson/s1-rook/");
  await page.getByTestId("present").click();
  await page.getByTestId("present-next").click();
  await page.getByTestId("present-next").click();
  await expect(page).toHaveURL(/#present=2$/);
  await page.reload();
  await expect(page.getByTestId("present-mode")).toContainText("3 /");
});

test("warm-ups and table captain cards are ready to use", async ({ page }) => {
  await page.goto("./teach/warmups/");
  expect(await page.getByTestId("warmup").count()).toBeGreaterThanOrEqual(10);
  await page.goto("./print/club/?what=captain");
  await expect(page.getByTestId("captain-card")).toHaveCount(2);
});

test("helper group view: tick a pass, show the code, and Wrap-up takes it", async ({ page }) => {
  const kids = [
    { id: "k1", name: "Maya", animal: "🐶" },
    { id: "k2", name: "Leo", animal: "🦊" },
  ];
  const { groupFragment } = await import("../src/lib/groupLink");
  const d = new Date();
  const z = (n: number) => String(n).padStart(2, "0");
  const date = `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
  await page.goto("./teach/group/#" + groupFragment({ club: "Test Club", date, lesson: "s1-rook", label: "Early readers", adult: "Jason", kids }));
  await expect(page.getByRole("heading", { level: 1 })).toContainText("The Rook");
  await page.getByRole("button", { name: "Leo passed" }).click();
  await page.reload(); // ticks survive a refresh
  await expect(page.getByRole("button", { name: "Leo passed" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Show my code" }).click();
  const url = await page.locator("[data-testid=group-batch] [data-qr]").getAttribute("data-qr");
  expect(url).toMatch(/\/teach\/wrapup\/#q=/);

  // The keeper (same browser here) has the roster with the same ids.
  await page.evaluate((k) => localStorage.setItem("chessclub:club", JSON.stringify({ version: 1, name: "Test Club", kids: k, attendance: {}, passes: {}, games: [], ladder: k.map((x: { id: string }) => x.id) })), kids);
  await page.goto(url!.replace(/^https?:\/\/[^/]+/, ""));
  await expect(page.getByTestId("wrapup-log")).toContainText("From Jason: 1 pass, 1 more here.");
});
