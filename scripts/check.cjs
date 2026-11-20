const { spawnSync } = require('node:child_process')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const npmCli = process.env.npm_execpath
if (!npmCli) {
  console.error('Run this check through `npm run check`.')
  process.exit(1)
}
const checks = [
  ['Frontend lint', ['run', 'lint', '--prefix', 'frontend']],
  ['Admin lint', ['run', 'lint', '--prefix', 'admin']],
  ['Backend tests', ['run', 'test:backend']],
  ['Frontend tests', ['test', '--prefix', 'frontend']],
  ['Playwright E2E tests', ['run', 'test:e2e']],
  ['Frontend build', ['run', 'build', '--prefix', 'frontend']],
  ['Admin build', ['run', 'build', '--prefix', 'admin']]
]
let failed = false

for (const [name, args] of checks) {
  console.log(`\n=== ${name} ===`)
  const result = spawnSync(process.execPath, [npmCli, ...args], {
    cwd: root,
    stdio: 'inherit'
  })

  if (result.error) {
    console.error(`${name} could not run: ${result.error.message}`)
    failed = true
  } else if (result.status !== 0) {
    const outcome = result.status === null ? `signal ${result.signal}` : `exit status ${result.status}`
    console.error(`${name} failed with ${outcome}`)
    failed = true
  }
}

if (failed) process.exitCode = 1
