const fs = require("fs");
const { root, templates, replaceOgmaVersion, placeholder } = require("./utils");

// Replace
templates.forEach((template) => {
  replaceOgmaVersion(root(template, "./package.json"), placeholder);
  const lockPath = root(template, "./package-lock.json");
  if (fs.existsSync(lockPath)) fs.unlinkSync(lockPath);
});
