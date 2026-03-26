import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const TEMPLATES = ['vite', 'webpack', 'rollup', 'typescript', 'node', 'parcel'] as const
export type Template = (typeof TEMPLATES)[number]

const PLACEHOLDER_RE = /"@linkurious\/ogma":\s*"[^"]*YOUR_API_KEY[^"]*"/

export const ogmaUrl = (version: string, apiKey: string): string =>
  `https://get.linkurio.us/api/get/npm/ogma/${version}/?secret=${apiKey}`

interface ScaffoldOptions {
  template: Template
  projectName: string
  apiKey: string
  targetDir: string
}

export async function scaffold({ template, projectName, apiKey, targetDir }: ScaffoldOptions): Promise<void> {
  // Templates live in templates/ at the package root (one level up from src/)
  const templateDir = path.join(__dirname, '..', 'templates', template)

  if (!fs.existsSync(templateDir)) {
    throw new Error(`Template "${template}" not found at ${templateDir}`)
  }

  // Recursive copy using native fs.cp (Node 22+)
  await fs.promises.cp(templateDir, targetDir, {
    recursive: true,
    filter: (src) => {
      const rel = path.relative(templateDir, src)
      return !rel.startsWith('node_modules') && !rel.startsWith('dist')
    },
  })

  // Rename _gitignore → .gitignore (npm strips .gitignore on publish)
  const gitignoreSrc = path.join(targetDir, '_gitignore')
  if (fs.existsSync(gitignoreSrc)) {
    fs.renameSync(gitignoreSrc, path.join(targetDir, '.gitignore'))
  }

  // Patch package.json: set name and inject real Ogma URL
  const pkgPath = path.join(targetDir, 'package.json')
  let pkgContent = fs.readFileSync(pkgPath, 'utf-8')

  pkgContent = pkgContent.replace(PLACEHOLDER_RE, (match) => {
    const versionMatch = match.match(/ogma\/([^/]+)\//)
    const version = versionMatch ? versionMatch[1] : '5.3.8'
    return `"@linkurious/ogma": "${ogmaUrl(version, apiKey)}"`
  })

  const pkg = JSON.parse(pkgContent) as Record<string, unknown>
  pkg.name = projectName
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
}
