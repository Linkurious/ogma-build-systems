import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { scaffold, TEMPLATES, ogmaUrl } from "../src/scaffold.ts";
import { ogmaVersion } from "../scripts/utils.mjs";

const API_KEY = "test-api-key-123";
// read ogma version from npm ls output in console;
const OGMA_VERSION = ogmaVersion;

console.log(`Using Ogma version ${OGMA_VERSION} for testing`);

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), "ogma-create-test-"),
  );
});

afterEach(async () => {
  await fs.promises.rm(tmpDir, { recursive: true, force: true });
});

describe("TEMPLATES", () => {
  it("exports the expected list of templates", () => {
    expect(TEMPLATES).toEqual([
      "vite",
      "webpack",
      "rollup",
      "typescript",
      "node",
      "parcel",
      "react",
      "vue",
    ]);
  });
});

describe("ogmaUrl", () => {
  it("builds the correct download URL", () => {
    expect(ogmaUrl("5.3.8", "my-key")).toBe(
      "https://get.linkurio.us/api/get/npm/ogma/5.3.8/?secret=my-key",
    );
  });
});

describe("scaffold", () => {
  for (const template of TEMPLATES) {
    describe(`template: ${template}`, () => {
      it("creates the project directory", async () => {
        const targetDir = path.join(tmpDir, `test-${template}`);
        await scaffold({
          template,
          projectName: `test-${template}`,
          apiKey: API_KEY,
          targetDir,
        });
        expect(fs.existsSync(targetDir)).toBe(true);
      });

      it("copies package.json", async () => {
        const targetDir = path.join(tmpDir, `test-${template}`);
        await scaffold({
          template,
          projectName: `test-${template}`,
          apiKey: API_KEY,
          targetDir,
        });
        expect(fs.existsSync(path.join(targetDir, "package.json"))).toBe(true);
      });

      it("sets the project name in package.json", async () => {
        const projectName = `my-${template}-project`;
        const targetDir = path.join(tmpDir, projectName);
        await scaffold({ template, projectName, apiKey: API_KEY, targetDir });
        const pkg = JSON.parse(
          fs.readFileSync(path.join(targetDir, "package.json"), "utf-8"),
        );
        expect(pkg.name).toBe(projectName);
      });

      it("injects the API key into the Ogma dependency URL", async () => {
        const targetDir = path.join(tmpDir, `test-${template}`);
        await scaffold({
          template,
          projectName: `test-${template}`,
          apiKey: API_KEY,
          targetDir,
        });
        const pkg = JSON.parse(
          fs.readFileSync(path.join(targetDir, "package.json"), "utf-8"),
        );
        const ogmaDep = pkg.dependencies["@linkurious/ogma"];
        expect(ogmaDep).toContain(API_KEY);
        expect(ogmaDep).toBe(ogmaUrl(OGMA_VERSION, API_KEY));
      });

      it("removes the YOUR_API_KEY placeholder", async () => {
        const targetDir = path.join(tmpDir, `test-${template}`);
        await scaffold({
          template,
          projectName: `test-${template}`,
          apiKey: API_KEY,
          targetDir,
        });
        const pkg = JSON.parse(
          fs.readFileSync(path.join(targetDir, "package.json"), "utf-8"),
        );
        const ogmaDep = pkg.dependencies["@linkurious/ogma"];
        expect(ogmaDep).not.toContain("YOUR_API_KEY");
      });

      it("renames _gitignore to .gitignore", async () => {
        const targetDir = path.join(tmpDir, `test-${template}`);
        await scaffold({
          template,
          projectName: `test-${template}`,
          apiKey: API_KEY,
          targetDir,
        });
        expect(fs.existsSync(path.join(targetDir, ".gitignore"))).toBe(true);
        expect(fs.existsSync(path.join(targetDir, "_gitignore"))).toBe(false);
      });

      it("does not copy node_modules", async () => {
        const targetDir = path.join(tmpDir, `test-${template}`);
        await scaffold({
          template,
          projectName: `test-${template}`,
          apiKey: API_KEY,
          targetDir,
        });
        expect(fs.existsSync(path.join(targetDir, "node_modules"))).toBe(false);
      });

      it("does not copy dist/", async () => {
        const targetDir = path.join(tmpDir, `test-${template}`);
        await scaffold({
          template,
          projectName: `test-${template}`,
          apiKey: API_KEY,
          targetDir,
        });
        expect(fs.existsSync(path.join(targetDir, "dist"))).toBe(false);
      });
    });
  }

  it("throws for an unknown template", async () => {
    const targetDir = path.join(tmpDir, "bad-template");
    await expect(
      scaffold({
        template: "nonexistent" as any,
        projectName: "bad",
        apiKey: API_KEY,
        targetDir,
      }),
    ).rejects.toThrow(/Template "nonexistent" not found/);
  });
});
