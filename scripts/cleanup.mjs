import * as fs from "fs";
import {
  root,
  templates,
  replaceOgmaVersion,
  placeholder,
  ogmaVersion,
} from "./utils.mjs";

// Replace
templates.forEach((template) => {
  replaceOgmaVersion(
    root("templates", template, "./package.json"),
    placeholder.replace("$OGMA_VERSION", ogmaVersion),
  );
  const lockPath = root("templates", template, "./package-lock.json");
  if (fs.existsSync(lockPath)) fs.unlinkSync(lockPath);
});
