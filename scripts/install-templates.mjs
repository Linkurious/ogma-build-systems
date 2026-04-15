import { execSync } from "node:child_process";
import { root, templates } from "./utils.mjs";

for (const t of templates) {
  const flags = t === "parcel" ? "--ignore-scripts" : "";
  console.log(`Installing ${t}...`);
  execSync(`npm i ${flags}`, { cwd: root("templates", t), stdio: "inherit" });
}
