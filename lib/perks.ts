export type Perk = {
  hash: number
  index: number
  name: string
  description: string
  icon: string
}

type RawPerk = {
  hash: number
  index: number
  redacted?: boolean
  displayProperties?: { name?: string; description?: string; icon?: string }
}

const bungieUrl = "https://www.bungie.net"
const cacheKey = "yanisPerks.cache"

export const iconUrl = (icon: string) => bungieUrl + icon

const getJson = async (url: string, headers?: HeadersInit) => {
  const response = await fetch(url, { headers })
  if (!response.ok) throw new Error(`bungie responded with ${response.status}`)
  return response.json()
}

const readCache = (version: string) => {
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey) ?? "null")
    return cached?.version === version ? (cached.perks as Perk[]) : null
  } catch {
    return null
  }
}

const writeCache = (version: string, perks: Perk[]) => {
  try {
    localStorage.setItem(cacheKey, JSON.stringify({ version, perks }))
  } catch {
    localStorage.removeItem(cacheKey)
  }
}

export async function loadPerks() {
  const manifest = await getJson(`${bungieUrl}/Platform/Destiny2/Manifest/`, {
    "X-API-Key": process.env.NEXT_PUBLIC_BUNGIE_KEY ?? "",
  })
  const { version, jsonWorldComponentContentPaths } = manifest.Response
  const cached = readCache(version)
  if (cached) return { version, perks: cached }

  const raw: Record<string, RawPerk> = await getJson(bungieUrl + jsonWorldComponentContentPaths.en.DestinySandboxPerkDefinition)
  const perks = Object.values(raw)
    .flatMap(({ hash, index, redacted, displayProperties: props }) =>
      !redacted && props?.name && props.icon ? [{ hash, index, name: props.name, description: props.description ?? "", icon: props.icon }] : []
    )
    .sort((a, b) => a.index - b.index)

  writeCache(version, perks)
  return { version, perks }
}

export const toTerms = (query: string) => query.toLowerCase().split(/\s+/).filter(Boolean)

export const searchText = (perk: Perk) => `${perk.name} ${perk.description} ${perk.index}`.toLowerCase()

export const searchPerks = (perks: Perk[], texts: string[], terms: string[]) =>
  terms.length ? perks.filter((_, position) => terms.every((term) => texts[position].includes(term))) : perks
