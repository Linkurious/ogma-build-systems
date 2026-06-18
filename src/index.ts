#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import mri from 'mri'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { scaffold, TEMPLATES, type Template } from './scaffold.js'
import { downloadOgmaSkill } from './skill.js'

const argv = mri<{ template?: string; t?: string; skill?: boolean }>(process.argv.slice(2), {
  alias: { t: 'template' },
  string: ['template'],
  boolean: ['skill'],
})

async function main(): Promise<void> {
  p.intro(`${pc.bgCyan(pc.black(' create-ogma '))}`)

  const argName = argv._[0] as string | undefined
  const argTemplate = (argv.template ?? argv.t) as string | undefined
  const validTemplate = argTemplate && (TEMPLATES as readonly string[]).includes(argTemplate)
    ? (argTemplate as Template)
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

  // API key
  const apiKeyResult = await p.password({
    message: `Ogma API key ${pc.dim('(from get.linkurio.us)')}:`,
    validate: (v) => (v?.trim() ? undefined : 'API key cannot be empty'),
  })
  if (p.isCancel(apiKeyResult)) { p.cancel('Cancelled.'); process.exit(1) }
  const apiKey = apiKeyResult as string

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

  const { ogmaVersion } = await scaffold({ template, projectName, apiKey, targetDir })

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
    `  ${pc.cyan('npm install')}\n` +
    `  ${pc.cyan('npm run dev')}`,
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
