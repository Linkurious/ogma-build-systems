import { root, templates, replaceOgmaVersion, ogmaVersion } from "./utils.mjs";

// Replace
templates.forEach((template) => {
  replaceOgmaVersion(root(template, "./package.json"), ogmaVersion);
});
