import type { Page } from "@playwright/test";

/** Click a square on the (white-oriented) interactive board. */
export async function tapSquare(page: Page, sq: string) {
  const box = (await page.locator("[data-board] .board-inner").first().boundingBox())!;
  const f = sq.charCodeAt(0) - 97;
  const r = Number(sq[1]);
  await page.mouse.click(box.x + ((f + 0.5) * box.width) / 8, box.y + ((8 - r + 0.5) * box.height) / 8);
}
