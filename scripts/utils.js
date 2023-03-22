const fs = require("fs");
const path = require("path");

const root = (...paths) => path.join(__dirname, "../", ...paths);

const { ogmaVersion, placeholder, templates } = JSON.parse(
  fs.readFileSync(root("./config.json"), "utf-8")
);

/**
 * Utility function replacing Ogma version in `package.json`
 * @param {*} filename
 * @param {*} version
 */
const replaceOgmaVersion = (filename, version) => {
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

module.exports = {
  root,
  ogmaVersion,
  placeholder,
  templates,
  replaceOgmaVersion,
};
