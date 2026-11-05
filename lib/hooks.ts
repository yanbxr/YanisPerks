import { useCallback, useEffect, useState } from "react"

import { loadPerks, type Perk } from "@/lib/perks"

type PerksState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; perks: Perk[]; version: string }

export function usePerks() {
  const [state, setState] = useState<PerksState>({ status: "loading" })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    setState({ status: "loading" })
    loadPerks()
      .then(({ perks, version }) => active && setState({ status: "ready", perks, version }))
      .catch((error) => active && setState({ status: "error", message: error.message }))
    return () => {
      active = false
    }
  }, [attempt])

  return { state, retry: useCallback(() => setAttempt((value) => value + 1), []) }
}

export function useQueryParam(key: string) {
  const [value, setValue] = useState("")

  useEffect(() => {
    setValue(new URLSearchParams(location.search).get(key) ?? "")
  }, [key])

  const update = useCallback(
    (next: string) => {
      setValue(next)
      const url = new URL(location.href)
      if (next) url.searchParams.set(key, next)
      else url.searchParams.delete(key)
      history.replaceState(null, "", url)
    },
    [key]
  )

  return [value, update] as const
}
