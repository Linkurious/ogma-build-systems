import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { zipSync, strToU8 } from "fflate";
import {
  ogmaSkillUrl,
  skillInstallDir,
  downloadOgmaSkill,
} from "../src/skill.ts";

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), "ogma-skill-test-"),
  );
});

afterEach(async () => {
  vi.unstubAllGlobals();
  await fs.promises.rm(tmpDir, { recursive: true, force: true });
});

/** Build a ZIP archive in memory and expose it through a mocked `fetch`. */
function stubFetchWithZip(
  entries: Record<string, string>,
  { ok = true, status = 200 }: { ok?: boolean; status?: number } = {},
): void {
  const zipped = zipSync(
    Object.fromEntries(
      Object.entries(entries).map(([name, content]) => [
        name,
        strToU8(content),
      ]),
    ),
  );
  const fetchMock = vi.fn(async () => ({
    ok,
    status,
    arrayBuffer: async () =>
      zipped.buffer.slice(
        zipped.byteOffset,
        zipped.byteOffset + zipped.byteLength,
      ),
  }));
  vi.stubGlobal("fetch", fetchMock);
}

describe("ogmaSkillUrl", () => {
  it("builds the versioned skill archive URL", () => {
    expect(ogmaSkillUrl("6.0.2")).toBe(
      "https://doc.linkurious.com/ogma/6.0.2/ogma-skill.zip",
    );
  });
});

describe("skillInstallDir", () => {
  it("points at agents/skills/ogma-skill inside the project", () => {
    expect(skillInstallDir("/tmp/my-app")).toBe(
      path.join("/tmp/my-app", "agents", "skills", "ogma-skill"),
    );
  });
});

describe("downloadOgmaSkill", () => {
  it("extracts the skill into agents/skills/ogma-skill", async () => {
    stubFetchWithZip({
      "ogma-skill/": "",
      "ogma-skill/SKILL.md": "# Ogma skill",
      "ogma-skill/concepts/styles.md": "styles",
    });

    const dest = await downloadOgmaSkill({
      version: "6.0.2",
      projectDir: tmpDir,
    });

    expect(dest).toBe(path.join(tmpDir, "agents", "skills", "ogma-skill"));
    expect(
      fs.readFileSync(path.join(dest, "SKILL.md"), "utf-8"),
    ).toBe("# Ogma skill");
    expect(
      fs.existsSync(path.join(dest, "concepts", "styles.md")),
    ).toBe(true);
  });

  it("requests the URL matching the given version", async () => {
    stubFetchWithZip({ "ogma-skill/SKILL.md": "x" });
    await downloadOgmaSkill({ version: "7.1.0", projectDir: tmpDir });
    expect(fetch).toHaveBeenCalledWith(
      "https://doc.linkurious.com/ogma/7.1.0/ogma-skill.zip",
      expect.objectContaining({ redirect: "follow" }),
    );
  });

  it("replaces a previous installation", async () => {
    const stale = path.join(tmpDir, "agents", "skills", "ogma-skill");
    fs.mkdirSync(stale, { recursive: true });
    fs.writeFileSync(path.join(stale, "OLD.md"), "stale");

    stubFetchWithZip({ "ogma-skill/SKILL.md": "fresh" });
    await downloadOgmaSkill({ version: "6.0.2", projectDir: tmpDir });

    expect(fs.existsSync(path.join(stale, "OLD.md"))).toBe(false);
    expect(fs.existsSync(path.join(stale, "SKILL.md"))).toBe(true);
  });

  it("throws when the download fails", async () => {
    stubFetchWithZip({ "ogma-skill/SKILL.md": "x" }, { ok: false, status: 404 });
    await expect(
      downloadOgmaSkill({ version: "6.0.2", projectDir: tmpDir }),
    ).rejects.toThrow(/HTTP 404/);
  });

  it("throws when the archive lacks the ogma-skill folder", async () => {
    stubFetchWithZip({ "something-else/README.md": "x" });
    await expect(
      downloadOgmaSkill({ version: "6.0.2", projectDir: tmpDir }),
    ).rejects.toThrow(/did not contain the expected "ogma-skill" folder/);
  });

  it("rejects archives with path-traversal entries (zip-slip)", async () => {
    stubFetchWithZip({ "../evil.md": "pwned" });
    await expect(
      downloadOgmaSkill({ version: "6.0.2", projectDir: tmpDir }),
    ).rejects.toThrow(/Unsafe entry path/);
    expect(fs.existsSync(path.join(path.dirname(tmpDir), "evil.md"))).toBe(
      false,
    );
  });
});
