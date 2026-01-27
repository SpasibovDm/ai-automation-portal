import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd(), "src");
const requiredFiles = [
  "App.jsx",
  "main.jsx",
  path.join("components", "Layout.jsx"),
  path.join("pages", "Dashboard.jsx"),
];

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));

if (missing.length) {
  console.error("Smoke test failed. Missing files:", missing);
  process.exit(1);
}

console.log("Smoke test passed.");
