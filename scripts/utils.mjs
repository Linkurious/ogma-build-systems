import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const root = (...paths) => path.join(__dirname, "../", ...paths);

export const { ogmaVersion, placeholder, templates } = JSON.parse(
  fs.readFileSync(root("./config.json"), "utf-8")
);

/**
 * Utility function replacing Ogma version in `package.json`
 * @param {string} filename
 * @param {string} version
 */
export const replaceOgmaVersion = (filename, version) => {
  // Read the contents of the file
  const content = fs.readFileSync(filename, "utf-8");

  // Replace the placeholder with a new string
  const newContent = content.replace(
    /"@linkurious\/ogma": "(.*)"/,
    `"@linkurious/ogma": "${version}"`
  );

  // Write the updated contents back to the file
  fs.writeFileSync(filename, newContent);
};
