import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const TEMPLATES = [
  "vite",
  "react",
  "vue",
  "rollup",
  "typescript",
  "webpack",
  "node",
  "parcel",
] as const;
export type Template = (typeof TEMPLATES)[number];

const PLACEHOLDER_RE = /"@linkurious\/ogma":\s*"[^"]*YOUR_API_KEY[^"]*"/;
const OGMA_VERSION_RE = /npm\/ogma\/([^/]+)\//;
const DEFAULT_OGMA_VERSION = "5.3.8";

export const ogmaUrl = (version: string, apiKey: string): string =>
  `https://get.linkurio.us/api/get/npm/ogma/${version}/?secret=${apiKey}`;

/**
 * Extract the Ogma version pinned in a template's `package.json` content.
 * Works for both the `YOUR_API_KEY` placeholder URL and the injected URL,
 * since both embed `npm/ogma/<version>/`. Falls back to a known-good version
 * when no match is found.
 */
export const resolveOgmaVersion = (pkgContent: string): string => {
  const match = pkgContent.match(OGMA_VERSION_RE);
  return match ? match[1] : DEFAULT_OGMA_VERSION;
};

interface ScaffoldOptions {
  template: Template;
  projectName: string;
  apiKey: string;
  targetDir: string;
}

export async function scaffold({
  template,
  projectName,
  apiKey,
  targetDir,
}: ScaffoldOptions): Promise<{ ogmaVersion: string }> {
  // Templates live in templates/ at the package root (one level up from src/)
  const templateDir = path.join(__dirname, "..", "templates", template);

  if (!fs.existsSync(templateDir)) {
    throw new Error(`Template "${template}" not found at ${templateDir}`);
  }

  // Recursive copy using native fs.cp (Node 22+)
  await fs.promises.cp(templateDir, targetDir, {
    recursive: true,
    filter: (src: string) => {
      const rel = path.relative(templateDir, src);
      return !rel.startsWith("node_modules") && !rel.startsWith("dist");
    },
  });

  // Rename _gitignore → .gitignore (npm strips .gitignore on publish)
  const gitignoreSrc = path.join(targetDir, "_gitignore");
  if (fs.existsSync(gitignoreSrc)) {
    fs.renameSync(gitignoreSrc, path.join(targetDir, ".gitignore"));
  }

  // Patch package.json: set name and inject real Ogma URL
  const pkgPath = path.join(targetDir, "package.json");
  let pkgContent = fs.readFileSync(pkgPath, "utf-8");

  const ogmaVersion = resolveOgmaVersion(pkgContent);

  pkgContent = pkgContent.replace(
    PLACEHOLDER_RE,
    `"@linkurious/ogma": "${ogmaUrl(ogmaVersion, apiKey)}"`,
  );

  const pkg = JSON.parse(pkgContent) as Record<string, unknown>;
  pkg.name = projectName;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  return { ogmaVersion };
}
