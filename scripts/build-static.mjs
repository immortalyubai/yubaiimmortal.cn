import { cp, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");
const files = ["index.html", "styles.css", "main.js"];
const assetFiles = ["hero-base-clean.png", "robot-companion.png", "blackhole-cinematic-bg.png"];
const assetDirs = ["audio"];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await mkdir(join(dist, "assets"), { recursive: true });
await mkdir(join(dist, "vendor"), { recursive: true });

await Promise.all(files.map((file) => cp(join(root, file), join(dist, file))));
await Promise.all(
  assetFiles.map((file) => cp(join(root, "assets", file), join(dist, "assets", file))),
);
await Promise.all(
  assetDirs.map((dir) => cp(join(root, "assets", dir), join(dist, "assets", dir), { recursive: true })),
);
await cp(join(root, "vendor", "three.module.min.js"), join(dist, "vendor", "three.module.min.js"));

console.log("Static site built in dist/");
