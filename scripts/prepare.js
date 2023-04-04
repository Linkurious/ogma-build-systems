const { root, templates, replaceOgmaVersion, ogmaVersion } = require("./utils");

// Replace
templates.forEach((template) => {
  replaceOgmaVersion(root(template, "./package.json"), ogmaVersion);
});
