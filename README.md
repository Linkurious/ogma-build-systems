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

You can skip the template prompt by passing it as a flag:

```sh
npm create @linkurious/ogma my-app -- --template vite
```

Then:

```sh
cd my-app
npm install
npm run dev
```

## 📦 Templates

| Template | Description |
|---|---|
| `vite` | TypeScript + Vite dev server |
| `webpack` | TypeScript + Webpack 5 |
| `rollup` | TypeScript + Rollup bundler |
| `typescript` | TypeScript + browser-sync (no bundler) |
| `node` | Node.js server-side rendering |
| `parcel` | TypeScript + Parcel bundler |

## 👀 I don't see a template that matches my need?

You wish there was a template with your favorite library? Feel free to make a pull request. Copy one of the templates already available, tweak it, name it properly and make a PR.
