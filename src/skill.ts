import fs from "node:fs";
import path from "node:path";
import { unzipSync } from "fflate";

const SKILL_NAME = "ogma-skill";

/**
 * Build the download URL for the Ogma AI coding skill archive.
 *
 * A fully-qualified version (e.g. `6.0.2`) is resolved server-side to the
 * matching major.minor bucket via an HTTP redirect, so a redirect-following
 * request always downloads the skill that matches the project's Ogma version.
 */
export const ogmaSkillUrl = (version: string): string =>
  `https://doc.linkurious.com/ogma/${version}/ogma-skill.zip`;

/**
 * Project-relative path (inside the scaffolded project) where the skill is
 * installed. Coding agents pick it up from here, and it is gitignored so it is
 * never committed.
 */
export const skillInstallDir = (projectDir: string): string =>
  path.join(projectDir, "agents", "skills", SKILL_NAME);

interface DownloadSkillOptions {
  version: string;
  projectDir: string;
}

/**
 * Download and extract the version-matched Ogma AI skill into the project's
 * `agents/skills/ogma-skill` folder. Uses the native `fetch` API and `fflate`
 * for extraction, so it works cross-platform with no external binaries.
 *
 * Throws on any failure (download, extraction, or missing archive contents);
 * callers are expected to treat a failure as non-fatal.
 */
export async function downloadOgmaSkill({
  version,
  projectDir,
}: DownloadSkillOptions): Promise<string> {
  const url = ogmaSkillUrl(version);
  const skillsDir = path.join(projectDir, "agents", "skills");
  const destDir = path.join(skillsDir, SKILL_NAME);

  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(
      `Failed to download the Ogma skill (HTTP ${response.status}) from ${url}`,
    );
  }
  const archive = new Uint8Array(await response.arrayBuffer());

  // Replace any previous install, then extract fresh.
  await fs.promises.rm(destDir, { recursive: true, force: true });
  extractArchive(archive, skillsDir);

  if (!fs.existsSync(destDir)) {
    throw new Error(
      `Skill archive did not contain the expected "${SKILL_NAME}" folder`,
    );
  }

  return destDir;
}

/**
 * Extract a ZIP archive into `destDir`, creating directories as needed and
 * guarding against zip-slip path traversal.
 */
function extractArchive(archive: Uint8Array, destDir: string): void {
  const files = unzipSync(archive);
  const root = path.resolve(destDir);

  for (const [name, contents] of Object.entries(files)) {
    const target = path.resolve(destDir, name);
    if (target !== root && !target.startsWith(root + path.sep)) {
      throw new Error(`Unsafe entry path in skill archive: "${name}"`);
    }

    if (name.endsWith("/")) {
      fs.mkdirSync(target, { recursive: true });
      continue;
    }

    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, contents);
  }
}
