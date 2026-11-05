import { execSync } from "node:child_process"
import { writeFileSync } from "node:fs"

const read = (command) => execSync(command).toString().trim()
const run = (command, options = {}) => execSync(command, { stdio: "inherit", ...options })

const remote = read("git remote get-url origin")
const repo = remote.split("/").pop().replace(/\.git$/, "")
const [name, email] = read('git log -1 --format="%an|%ae"').split("|")

run("npx next build", { env: { ...process.env, PAGES_BASE_PATH: `/${repo}` } })
writeFileSync("out/.nojekyll", "")

const inOut = { cwd: "out" }
run("git init -q -b gh-pages", inOut)
run("git add -A", inOut)
run(`git -c user.name="${name}" -c user.email="${email}" commit -q -m "Deploy ${new Date().toISOString()}"`, inOut)
run(`git push -f ${remote} gh-pages`, inOut)
console.log(`Deployed to https://${remote.split("/").at(-2)}.github.io/${repo}/`)
