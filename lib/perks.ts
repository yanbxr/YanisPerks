export type Perk = {
  hash: number
  index: number
  name: string
  description: string
  icon: string
}

export const iconUrl = (icon: string) => `${process.env.NEXT_PUBLIC_BASE_PATH}/icons/${icon}`

export async function loadPerks() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/perks.json`, { cache: "no-cache" })
  if (!response.ok) throw new Error(`perks.json responded with ${response.status}`)
  return (await response.json()) as { version: string; perks: Perk[] }
}

export const toTerms = (query: string) => query.toLowerCase().split(/\s+/).filter(Boolean)

export const searchText = (perk: Perk) => `${perk.name} ${perk.description} ${perk.index}`.toLowerCase()

export const searchPerks = (perks: Perk[], texts: string[], terms: string[]) =>
  terms.length ? perks.filter((_, position) => terms.every((term) => texts[position].includes(term))) : perks
