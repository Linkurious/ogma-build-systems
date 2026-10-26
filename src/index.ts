#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import mri from 'mri'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { scaffold, TEMPLATES, EDITIONS, type Template, type Edition, deriveDownloadKey, parseLicenseInput } from './scaffold.js'
import { downloadOgmaSkill } from './skill.js'

const argv = mri<{ template?: string; t?: string; edition?: string; skill?: boolean; npmrc?: boolean }>(process.argv.slice(2), {
  alias: { t: 'template' },
  string: ['template', 'edition'],
  boolean: ['skill', 'npmrc'],
})

async function main(): Promise<void> {
  p.intro(`${pc.bgCyan(pc.black(' create-ogma '))}`)

  const argName = argv._[0] as string | undefined
  const argTemplate = (argv.template ?? argv.t) as string | undefined
  const validTemplate = argTemplate && (TEMPLATES as readonly string[]).includes(argTemplate)
    ? (argTemplate as Template)
    : undefined
  const argEdition = argv.edition as string | undefined
  const validEdition = argEdition && (EDITIONS as readonly string[]).includes(argEdition)
    ? (argEdition as Edition)
    : undefined

  // Project name
  let projectName: string
  if (argName) {
    projectName = argName
  } else {
    const result = await p.text({
      message: 'Project name:',
      placeholder: 'my-ogma-app',
    validate: (v) => (v?.trim() ? undefined : 'Project name cannot be empty'),
    })
    if (p.isCancel(result)) { p.cancel('Cancelled.'); process.exit(1) }
    projectName = result as string
  }

  // Template
  let template: Template
  if (validTemplate) {
    template = validTemplate
  } else {
    const result = await p.select({
      message: 'Select a template:',
      options: TEMPLATES.map((t) => ({ value: t, label: t })),
    }) as Template
    if (p.isCancel(result)) { p.cancel('Cancelled.'); process.exit(1) }
    template = result
  }

  // Edition
  let edition: Edition
  if (validEdition) {
    edition = validEdition
  } else {
    const result = await p.select({
      message: 'Edition:',
      initialValue: 'trial' as Edition,
      options: [
        { value: 'trial', label: 'Trial', hint: 'free, watermarked, no key needed' },
        { value: 'licensed', label: 'Licensed', hint: 'needs your get.linkurio.us key' },
      ],
    }) as Edition
    if (p.isCancel(result)) { p.cancel('Cancelled.'); process.exit(1) }
    edition = result
  }

  let apiKey = ''
  let licenseVersion: string | undefined
  let useNpmrc = false
  let email = ''
  if (edition === 'licensed') {
    // Accepts the full npm link from get.linkurio.us or only the secret
    const apiKeyResult = await p.password({
      message: `Ogma API key or full npm link ${pc.dim('(from get.linkurio.us)')}:`,
      validate: (v) => (v?.trim() ? undefined : 'API key cannot be empty'),
    })
    if (p.isCancel(apiKeyResult)) { p.cancel('Cancelled.'); process.exit(1) }
    const parsed = parseLicenseInput(apiKeyResult as string)
    apiKey = parsed.apiKey
    licenseVersion = parsed.version

    // Optional: .npmrc registry auth (default no — most projects are private repos)
    if (typeof argv.npmrc === 'boolean') {
      useNpmrc = argv.npmrc
    } else {
      const result = await p.confirm({
        message: `Generate ${pc.cyan('.npmrc')} for registry auth? ${pc.dim('(keeps secret out of package.json — useful for CI/shared repos)')}`,
        initialValue: false,
      })
      if (p.isCancel(result)) { p.cancel('Cancelled.'); process.exit(1) }
      useNpmrc = result
    }

    // Email is only needed to derive OGMA_DOWNLOAD_KEY when using .npmrc
    if (useNpmrc) {
      const result = await p.text({
        message: `Email ${pc.dim('(your get.linkurio.us login email)')}:`,
        validate: (v) => (v?.trim() ? undefined : 'Email cannot be empty'),
      })
      if (p.isCancel(result)) { p.cancel('Cancelled.'); process.exit(1) }
      email = result as string
    }
  }

  // Ogma AI coding skill (default yes; overridable with --skill / --no-skill)
  let installSkill: boolean
  if (typeof argv.skill === 'boolean') {
    installSkill = argv.skill
  } else {
    const result = await p.confirm({
      message: `Download the Ogma AI coding skill? ${pc.dim('(for Copilot, Claude, Cursor, …)')}`,
      initialValue: true,
    })
    if (p.isCancel(result)) { p.cancel('Cancelled.'); process.exit(1) }
    installSkill = result
  }

  const targetDir = path.resolve(process.cwd(), projectName)

  if (fs.existsSync(targetDir)) {
    const overwrite = await p.confirm({
      message: `Directory ${pc.cyan(projectName)} already exists. Overwrite?`,
      initialValue: false,
    })
    if (p.isCancel(overwrite)) { p.cancel('Cancelled.'); process.exit(1) }
    if (!overwrite) { p.cancel('Aborted.'); process.exit(1) }
    fs.rmSync(targetDir, { recursive: true })
  }

  const { ogmaVersion } = await scaffold({ template, projectName, apiKey, targetDir, edition, version: licenseVersion, useNpmrc })

  let skillInstalled = false
  if (installSkill) {
    const s = p.spinner()
    s.start('Downloading the Ogma AI skill')
    try {
      await downloadOgmaSkill({ version: ogmaVersion, projectDir: targetDir })
      appendSkillGitignore(targetDir)
      skillInstalled = true
      s.stop(`${pc.green('✔')} Ogma AI skill installed to ${pc.cyan('agents/skills/ogma-skill')}`)
    } catch (err) {
      s.stop(pc.yellow('⚠ Could not download the Ogma AI skill'))
      p.log.warn(
        `${(err as Error).message}\n` +
        `Install it later from ${pc.cyan('https://doc.linkurious.com/ogma/latest/tutorials/ai-coding/')}`,
      )
    }
  }

  p.outro(
    `${pc.green('✔')} Created ${pc.bold(pc.cyan(projectName))} with the ${pc.bold(template)} template.` +
    (skillInstalled ? `\n${pc.dim('  Ogma AI skill ready in agents/skills/ogma-skill')}` : '') +
    `\n\n` +
    `  ${pc.cyan(`cd ${projectName}`)}\n` +
    (useNpmrc
      ? `  ${pc.dim('# set this in your shell, CI secret store, or .env (do not commit the value)')}\n` +
        `  ${pc.cyan(`export OGMA_DOWNLOAD_KEY=${deriveDownloadKey(email, apiKey)}`)}\n`
      : '') +
    `  ${pc.cyan('npm install')}\n` +
    `  ${pc.cyan('npm run dev')}` +
    (edition === 'trial'
      ? `\n\n${pc.dim('Trial build (watermarked). To switch to a licensed build: https://doc.linkurious.com/ogma/latest/tutorials/getting-started/install')}`
      : ''),
  )
}

/**
 * Append the downloaded-skill folder to the project's .gitignore so the skill
 * (which is not source code) is never committed. Idempotent.
 */
function appendSkillGitignore(targetDir: string): void {
  const gitignorePath = path.join(targetDir, '.gitignore')
  const entry = 'agents/skills/ogma-skill/'
  let content = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf-8') : ''

  if (content.split(/\r?\n/).some((line) => line.trim() === entry)) return

  const block = `# Ogma AI coding skill (downloaded, not source)\n${entry}\n`
  if (content.length === 0) {
    content = block
  } else {
    if (!content.endsWith('\n')) content += '\n'
    content += `\n${block}`
  }
  fs.writeFileSync(gitignorePath, content)
}

main().catch((err: Error) => {
  console.error(pc.red('\nError: ') + err.message)
  process.exit(1)
})
