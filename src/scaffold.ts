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

export const OGMA_REGISTRY =
  "https://public-pull.nexus3.linkurious.net/repository/npm-public";

export const ogmaUrl = (version: string, apiKey: string): string =>
  `https://get.linkurio.us/api/get/npm/ogma/${version}/?secret=${apiKey}`;

/**
 * Derive the OGMA_DOWNLOAD_KEY value expected by the private npm registry.
 * The registry uses HTTP Basic Auth: base64("any:<secret>").
 */
export const deriveDownloadKey = (apiKey: string): string =>
  Buffer.from(`any:${apiKey}`).toString("base64");

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
  /** When true, write an .npmrc pointing @linkurious at the private registry
   *  and use a plain semver dep instead of embedding the secret in the URL. */
  useNpmrc?: boolean;
}

export async function scaffold({
  template,
  projectName,
  apiKey,
  targetDir,
  useNpmrc = false,
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

  // Patch package.json: set name and inject Ogma dependency
  const pkgPath = path.join(targetDir, "package.json");
  let pkgContent = fs.readFileSync(pkgPath, "utf-8");

  const ogmaVersion = resolveOgmaVersion(pkgContent);

  if (useNpmrc) {
    // Use a plain semver dep — auth is handled by .npmrc
    pkgContent = pkgContent.replace(
      PLACEHOLDER_RE,
      `"@linkurious/ogma": "${ogmaVersion}"`,
    );

    // Write .npmrc with ${OGMA_DOWNLOAD_KEY} placeholder (safe to commit)
    const registryUrl = OGMA_REGISTRY.endsWith("/") ? OGMA_REGISTRY : `${OGMA_REGISTRY}/`;
    const registry = new URL(registryUrl);
    const registryHost = registry.host;
    const registryPath = registry.pathname.replace(/\/$/, "");
    fs.writeFileSync(
      path.join(targetDir, ".npmrc"),
      `@linkurious:registry=${registryUrl}\n` +
        `//${registryHost}${registryPath}/:_auth=\${OGMA_DOWNLOAD_KEY}\n`,
    );
  } else {
    // Default: embed the secret directly in the install URL
    pkgContent = pkgContent.replace(
      PLACEHOLDER_RE,
      `"@linkurious/ogma": "${ogmaUrl(ogmaVersion, apiKey)}"`,
    );
  }

  const pkg = JSON.parse(pkgContent) as Record<string, unknown>;
  pkg.name = projectName;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  return { ogmaVersion };
}
