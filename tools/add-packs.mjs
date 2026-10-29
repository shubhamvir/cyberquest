// Turns cyberquest-packs.json (exported from the hosted single-file version: Settings > Export question packs)
// into data/packs/YYYY-MM.js files, so the Netlify version gets the same new questions.
// Usage: node tools/add-packs.mjs path/to/cyberquest-packs.json   then: node build.mjs (or redeploy)
import fs from "node:fs";
import path from "node:path";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const file = process.argv[2];
if (!file) { console.error("Usage: node tools/add-packs.mjs cyberquest-packs.json"); process.exit(1); }
const packs = JSON.parse(fs.readFileSync(file, "utf8"));
fs.mkdirSync(path.join(root, "data/packs"), { recursive: true });
for (const p of Array.isArray(packs) ? packs : [packs]) {
  if (!/^\d{4}-\d{2}$/.test(p.month || "") || !Array.isArray(p.questions)) { console.warn("Skipping a malformed pack"); continue; }
  const out = path.join(root, "data/packs", p.month + ".js");
  fs.writeFileSync(out, "// Imported on " + new Date().toISOString().slice(0, 10) + "\nQB_PACKS.push(" + JSON.stringify({ month: p.month, title: p.title, questions: p.questions }, null, 1) + ");\n");
  console.log("wrote", path.relative(root, out), "-", p.questions.length, "questions");
}
