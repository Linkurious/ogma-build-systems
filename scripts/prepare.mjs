import { root, templates, replaceOgmaVersion, ogmaVersion } from "./utils.mjs";

// Replace
templates.forEach((template) => {
  console.log(`Updating ${template}`, ogmaVersion);
  replaceOgmaVersion(root("templates", template, "./package.json"), ogmaVersion);
});
