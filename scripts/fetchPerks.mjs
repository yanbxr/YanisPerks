import { existsSync } from "node:fs"
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises"

const bungieUrl = "https://www.bungie.net"
const outFile = "public/perks.json"
const iconDir = "public/icons"
const key = process.env.BUNGIE_KEY

const getJson = async (url, headers) => {
  const response = await fetch(url, { headers })
  if (!response.ok) throw new Error(`${url} responded with ${response.status}`)
  return response.json()
}

const iconPath = "/common/destiny2_content/icons/"
const iconName = (path) => path.split("/").pop()

async function loadFromBungie() {
  const manifest = await getJson(`${bungieUrl}/Platform/Destiny2/Manifest/`, { "X-API-Key": key })
  const { version, jsonWorldComponentContentPaths } = manifest.Response
  const raw = await getJson(bungieUrl + jsonWorldComponentContentPaths.en.DestinySandboxPerkDefinition)
  const perks = Object.values(raw)
    .filter((perk) => !perk.redacted && perk.displayProperties?.name && perk.displayProperties.icon)
    .map(({ hash, index, displayProperties: { name, description, icon } }) => ({ hash, index, name, description: description ?? "", icon }))
    .sort((a, b) => a.index - b.index)
  return { version, perks }
}

async function saveIcons(perks) {
  await mkdir(iconDir, { recursive: true })
  const names = [...new Set(perks.map((perk) => perk.icon))]
  const keep = new Set(names)
  for (const file of await readdir(iconDir)) if (!keep.has(file)) await rm(`${iconDir}/${file}`)
  const missing = names.filter((name) => !existsSync(`${iconDir}/${name}`))
  let failed = 0
  const worker = async () => {
    while (missing.length) {
      const name = missing.pop()
      try {
        const response = await fetch(bungieUrl + iconPath + name)
        if (!response.ok) throw new Error(String(response.status))
        await writeFile(`${iconDir}/${name}`, Buffer.from(await response.arrayBuffer()))
      } catch {
        failed++
      }
    }
  }
  const total = missing.length
  await Promise.all(Array.from({ length: 24 }, worker))
  console.log(`Icons: ${names.length} total, ${total - failed} downloaded, ${failed} failed`)
}

let data
if (key) {
  data = await loadFromBungie()
} else if (existsSync(outFile)) {
  console.warn("BUNGIE_KEY missing, keeping existing perks.json")
  data = JSON.parse(await readFile(outFile, "utf8"))
} else {
  console.error("BUNGIE_KEY missing. Create a key at https://www.bungie.net/en/Application and put it in .env")
  process.exit(1)
}

data.perks = data.perks.map(({ hash, index, name, description, icon }) => ({ hash, index, name, description, icon: iconName(icon) }))
await saveIcons(data.perks)
await writeFile(outFile, JSON.stringify(data))
console.log(`Saved ${data.perks.length} perks from manifest ${data.version}`)
