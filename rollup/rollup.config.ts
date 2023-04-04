import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import styles from "rollup-plugin-styles";
import image from "@rollup/plugin-image";

export default [
  {
    input: "src/index.ts",
    output: {
      file: "public/bundle.js",
      format: "umd",
      sourcemap: true,
    },
    // order of plugins is important
    plugins: [typescript(), resolve(), commonjs(), image()],
  },
];
