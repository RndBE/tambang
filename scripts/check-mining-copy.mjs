import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const roots = [
  "app",
  "components",
  "lib",
  "prisma",
  "README.md",
  "package.json",
  "package-lock.json",
  "docker-compose.yml",
  ".env.example",
  "rancangan_mining_monitoring_system.md",
];
const forbidden = [
  "pesisir",
  "pantura",
  "rob",
  "coastal monitor",
  "dashboard-pemantauan-penurunan-pesisir",
  "dashboard pemantauan penurunan",
  "gnss_dashboard",
  "mining_monitoring",
  "muka air laut",
  "penurunan tanah",
  "tide gauge",
  "pasang",
];

const extensions = new Set([".ts", ".tsx", ".js", ".md", ".json", ".yml", ".yaml"]);
const allowFiles = new Set([
  "prisma/schema.prisma",
  "docs/superpowers/specs/2026-05-23-mining-monitoring-system-design.md",
  "docs/superpowers/plans/2026-05-23-mining-monitoring-system.md",
]);
const forbiddenMatchers = forbidden.map((term) => {
  if (term === "rob") {
    const pattern = /(^|[^\p{L}\p{N}_])rob([^\p{L}\p{N}_]|$)/iu;
    return { term, matches: (line) => pattern.test(line) };
  }

  return { term, matches: (line) => line.toLowerCase().includes(term) };
});

function extname(path) {
  const index = path.lastIndexOf(".");
  return index === -1 ? "" : path.slice(index);
}

function walk(path) {
  const stat = statSync(path);
  if (stat.isFile()) return [path];
  return readdirSync(path).flatMap((entry) => walk(join(path, entry)));
}

const files = roots.flatMap((root) => walk(root));
const hits = [];

for (const file of files) {
  const normalized = relative(process.cwd(), file).replaceAll("\\", "/");
  if (allowFiles.has(normalized)) continue;
  if (!extensions.has(extname(normalized))) continue;

  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const { term, matches } of forbiddenMatchers) {
      if (matches(line)) {
        hits.push(`${normalized}:${index + 1}: ${term}: ${line.trim()}`);
      }
    }
  });
}

if (hits.length > 0) {
  console.error("Found old coastal dashboard terms:");
  console.error(hits.join("\n"));
  process.exit(1);
}

console.log("Mining copy scan passed.");
