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

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Bungie answers a lot of requests with a random 500, so network errors and 5xx are retried (5 attempts, ~3s max).
const attempts = 5
const getJson = async (url: string, headers?: HeadersInit) => {
  for (let attempt = 1; ; attempt++) {
    let response: Response | null = null
    try {
      response = await fetch(url, { headers })
    } catch {
      if (attempt === attempts) throw new Error("Could not reach bungie.net")
    }
    if (response?.ok) return response.json()
    if (response && (response.status < 500 || attempt === attempts)) throw new Error(`Bungie responded with ${response.status}`)
    await wait(300 * attempt)
  }
}

// Without a version, returns whatever is cached (used when the manifest can't be reached).
const readCache = (version?: string): { version: string; perks: Perk[] } | null => {
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey) ?? "null")
    if (!cached?.perks?.length || (version && cached.version !== version)) return null
    return { version: cached.version, perks: cached.perks as Perk[] }
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
  let manifest
  try {
    manifest = await getJson(`${bungieUrl}/Platform/Destiny2/Manifest/`, {
      "X-API-Key": process.env.NEXT_PUBLIC_BUNGIE_KEY ?? "",
    })
  } catch (error) {
    const offline = readCache()
    if (offline) return { version: `${offline.version} (offline)`, perks: offline.perks }
    throw error
  }
  const { version, jsonWorldComponentContentPaths } = manifest.Response
  const cached = readCache(version)
  if (cached) return cached

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
