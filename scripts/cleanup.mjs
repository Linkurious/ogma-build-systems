import * as fs from "fs";
import { root, templates, replaceOgmaVersion, placeholder } from "./utils.mjs";

// Replace
templates.forEach((template) => {
  replaceOgmaVersion(root(template, "./package.json"), placeholder);
  const lockPath = root(template, "./package-lock.json");
  if (fs.existsSync(lockPath)) fs.unlinkSync(lockPath);
});
