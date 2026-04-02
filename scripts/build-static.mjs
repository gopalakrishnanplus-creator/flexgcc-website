import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const distDir = path.join(root, "dist");
const assetDir = path.join(root, "assets");
const scriptPath = path.join(assetDir, "js", "site.js");
const staticPages = [
  "index.html",
  "pilot.html",
  "who-we-help.html",
  "operators.html",
  "finance-teams.html",
  "regulated-operators.html",
  "team.html",
  "farhana.html",
  "kandarp.html",
  "sunit.html",
  "contact.html",
  "favicon.ico",
];

const formApiUrl = process.env.FORM_API_URL || "";

fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });
fs.cpSync(assetDir, path.join(distDir, "assets"), { recursive: true });

const sourceSiteJs = fs.readFileSync(scriptPath, "utf8");
const builtSiteJs = sourceSiteJs.replaceAll("__FORM_API_URL__", formApiUrl);
fs.writeFileSync(path.join(distDir, "assets", "js", "site.js"), builtSiteJs);

for (const filename of staticPages) {
  const src = path.join(root, filename);
  const dest = path.join(distDir, filename);
  fs.copyFileSync(src, dest);
}

console.log(`Built static site to ${distDir}`);
