#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import mri from 'mri'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { scaffold, TEMPLATES, type Template } from './scaffold.js'

const argv = mri<{ template?: string; t?: string }>(process.argv.slice(2), {
  alias: { t: 'template' },
  string: ['template'],
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

  await scaffold({ template, projectName, apiKey, targetDir })

  p.outro(
    `${pc.green('✔')} Created ${pc.bold(pc.cyan(projectName))} with the ${pc.bold(template)} template.\n\n` +
    `  ${pc.cyan(`cd ${projectName}`)}\n` +
    `  ${pc.cyan('npm install')}\n` +
    `  ${pc.cyan('npm run dev')}`,
  )
}

main().catch((err: Error) => {
  console.error(pc.red('\nError: ') + err.message)
  process.exit(1)
})
