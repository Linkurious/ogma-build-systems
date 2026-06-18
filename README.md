# 🏗 Ogma Build Systems

## 💡 Information

This repository holds build system templates for [Ogma](https://linkurious.com/ogma/). Available templates: **Vite**, **Webpack**, **Rollup**, **TypeScript**, **Node.js**, **Parcel**.

## 🚀 Get started

**Requirements:** [Node.js](https://nodejs.org/) with npm

```sh
npm create @linkurious/ogma my-app
```

The interactive prompts will ask you to:

1. Choose a template: `vite`, `webpack`, `rollup`, `typescript`, `node`, `parcel`
2. Enter your Ogma API key (from [get.linkurio.us](https://get.linkurio.us))
3. Optionally download the [Ogma AI coding skill](https://doc.linkurious.com/ogma/latest/tutorials/ai-coding/) (defaults to **Yes**)

You can skip the template prompt by passing it as a flag:

```sh
npm create @linkurious/ogma my-app -- --template vite
```

Use `--skill` or `--no-skill` to install (or skip) the Ogma AI skill without being prompted:

```sh
npm create @linkurious/ogma my-app -- --template vite --no-skill
```

When enabled, the version-matched skill is downloaded into
`agents/skills/ogma-skill` inside your project (and added to `.gitignore`, since
it is not source code). AI coding agents such as GitHub Copilot, Claude, Cursor
and Codex pick it up from there.

Then:

```sh
cd my-app
npm install
npm run dev
```

## 📦 Templates

| Template     | Description                            |
| ------------ | -------------------------------------- |
| `vite`       | TypeScript + Vite dev server           |
| `webpack`    | TypeScript + Webpack 5                 |
| `rollup`     | TypeScript + Rollup bundler            |
| `typescript` | TypeScript + browser-sync (no bundler) |
| `node`       | Node.js server-side rendering          |
| `parcel`     | TypeScript + Parcel bundler            |

## 👀 I don't see a template that matches my need?

You wish there was a template with your favorite library? Give us a note via [contact form](https://doc.linkurious.com/ogma/latest/contact.html).
