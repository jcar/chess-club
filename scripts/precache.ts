// Runs after `next build`. Lists every file in the static export so the service
// worker can cache the whole site on first visit, including lessons the teacher
// never opened. That's what makes "load it at home, run club with no Wi-Fi" true.
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const OUT = "out";
const files: string[] = [];
function walk(dir: string) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else files.push(relative(OUT, p).split("\\").join("/"));
  }
}
walk(OUT);

// Paths are relative to the service worker's scope, so they work under any base path.
const urls = files
  .filter((f) => f !== "sw.js" && f !== "precache.json" && !f.startsWith("404"))
  .map((f) => (f === "index.html" ? "./" : f.endsWith("/index.html") ? f.slice(0, -"index.html".length) : f));

const bytes = files.reduce((n, f) => n + statSync(join(OUT, f)).size, 0);
writeFileSync(join(OUT, "precache.json"), JSON.stringify({ version: Date.now(), urls }));
console.log(`precache: ${urls.length} files, ${(bytes / 1024 / 1024).toFixed(1)} MB total export`);
