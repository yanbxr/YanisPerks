"use client"

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react"

import { searchPerks, searchText, toTerms, type Perk } from "@/lib/perks"
import { usePerks, useQueryParam } from "@/lib/hooks"
import { PerkRow } from "@/components/perkRow"
import { PerkTip, placeTip, type Tip } from "@/components/perkTip"

const pageSize = 60
const github = "https://github.com/yanbxr/YanisPerks"

function copyText(text: string) {
  navigator.clipboard?.writeText(text).catch(() => {})
  if (navigator.clipboard) return true
  const field = document.createElement("textarea")
  field.value = text
  field.style.position = "fixed"
  field.style.opacity = "0"
  document.body.append(field)
  field.select()
  const copied = document.execCommand("copy")
  field.remove()
  return copied
}

export function PerkSearch() {
  const { state, retry } = usePerks()
  const [query, setQuery] = useQueryParam("q")
  const [visible, setVisible] = useState(pageSize)
  const [tip, setTip] = useState<Tip | null>(null)
  const [toast, setToast] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const tipTimer = useRef(0)
  const deferredQuery = useDeferredValue(query)

  const perks = useMemo(() => (state.status === "ready" ? state.perks : []), [state])
  const terms = useMemo(() => toTerms(deferredQuery), [deferredQuery])
  const texts = useMemo(() => perks.map(searchText), [perks])
  const results = useMemo(() => searchPerks(perks, texts, terms), [perks, texts, terms])

  useEffect(() => setVisible(pageSize), [terms])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || visible >= results.length) return
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible((value) => value + pageSize),
      { rootMargin: "800px" }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [visible, results.length])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const typing = event.target instanceof HTMLInputElement
      if (event.key === "/" && !typing) {
        event.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
      if (event.key === "Escape" && event.target === inputRef.current) {
        setQuery("")
        inputRef.current?.blur()
      }
    }
    const onScroll = () => {
      clearTimeout(tipTimer.current)
      setTip(null)
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target as HTMLElement).closest("li")) setTip(null)
    }
    addEventListener("keydown", onKey)
    addEventListener("scroll", onScroll, { passive: true })
    addEventListener("pointerdown", onPointerDown)
    return () => {
      removeEventListener("keydown", onKey)
      removeEventListener("scroll", onScroll)
      removeEventListener("pointerdown", onPointerDown)
    }
  }, [setQuery])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(""), 1800)
    return () => clearTimeout(timer)
  }, [toast])

  const copy = useCallback((value: number, label: string) => {
    setToast(copyText(String(value)) ? `copied ${label} // ${value}` : "clipboard blocked")
  }, [])

  const hover = useCallback((perk: Perk | null, row?: HTMLElement) => {
    clearTimeout(tipTimer.current)
    if (perk && row) tipTimer.current = window.setTimeout(() => setTip(placeTip(perk, row)), 350)
    else setTip(null)
  }, [])

  const tap = useCallback((perk: Perk, row: HTMLElement) => {
    setTip((current) => (current?.perk === perk ? null : placeTip(perk, row)))
  }, [])

  const clear = () => {
    setQuery("")
    inputRef.current?.focus()
  }

  const toTop = (event: React.MouseEvent) => {
    event.preventDefault()
    scrollTo({ top: 0, behavior: "smooth" })
  }

  const ready = state.status === "ready"

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-black/85 font-mono text-sm backdrop-blur">
        <div className="mx-auto grid h-14 max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-5 sm:px-10">
          <a href="./" onClick={toTop} className="justify-self-start font-bold text-accent" aria-label="back to top">
            //
          </a>
          <span className="font-bold">yp</span>
          <a href={github} target="_blank" rel="noreferrer" className="justify-self-end text-dim hover:text-accent">
            github [↗]
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 sm:px-10">
        <section className="pb-4 pt-10 sm:pt-16">
          <p className="font-mono text-xs text-accent">destiny 2 // sandbox perks</p>
          <h1 className="mt-3 whitespace-nowrap text-[clamp(1.25rem,5.6vw,3.25rem)] font-bold leading-none tracking-tight">
            for all my <span className="normal-case">YanisPasters</span>
          </h1>
          <p className="mt-4 font-mono text-sm text-dim">fast perk searcher. hover a perk for details, click an index to copy it.</p>
        </section>

        <div className="sticky top-[57px] z-30 bg-black py-4">
          <div className="flex items-center bg-[#111] text-white">
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="search name, description or index"
              className="h-14 w-full min-w-0 bg-transparent px-5 text-lg font-semibold placeholder:text-dim sm:h-16 sm:px-6 sm:text-2xl"
              aria-label="search perks"
              autoComplete="off"
              spellCheck={false}
            />
            {query ? (
              <button onClick={clear} className="mr-3 shrink-0 px-2 py-1 font-mono text-sm text-dim hover:text-white sm:mr-4" aria-label="clear search">
                [x]
              </button>
            ) : (
              <kbd className="mr-5 hidden shrink-0 font-mono text-sm text-dim sm:mr-6 sm:block">[/]</kbd>
            )}
          </div>
        </div>

        <main className="min-h-[50vh]">
          {state.status === "loading" && (
            <p className="py-10 font-mono text-sm text-dim">
              loading sandbox perks<span className="animate-pulse text-accent">_</span>
            </p>
          )}

          {state.status === "error" && (
            <div className="py-10 font-mono text-sm">
              <p className="text-2xl font-bold">could not load perks</p>
              <p className="mt-2 text-dim">{state.message}</p>
              <button onClick={retry} className="mt-6 bg-accent px-5 py-3 text-black hover:bg-white">
                try again
              </button>
            </div>
          )}

          {ready && results.length === 0 && (
            <p className="py-10 font-mono text-sm text-dim">no perks match &quot;{deferredQuery}&quot;</p>
          )}

          <ul className={query !== deferredQuery ? "opacity-60" : undefined}>
            {results.slice(0, visible).map((perk) => (
              <PerkRow key={perk.hash} perk={perk} onHover={hover} onTap={tap} onCopy={copy} />
            ))}
          </ul>
          <div ref={sentinelRef} aria-hidden />
        </main>

        <Footer manifest={ready ? state.version : "…"} />

        <PerkTip tip={tip} />

        <div
          role="status"
          className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 bg-accent px-4 py-3 font-mono text-xs text-black transition-opacity ${toast ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          {toast}
        </div>
      </div>
    </>
  )
}

function Footer({ manifest }: { manifest: string }) {
  const footerRef = useRef<HTMLElement>(null)
  const manifestRef = useRef<HTMLSpanElement>(null)
  const discordRef = useRef<HTMLSpanElement>(null)
  const [fits, setFits] = useState(true)

  useEffect(() => {
    const footer = footerRef.current
    if (!footer) return
    const measure = () => {
      const needed = (manifestRef.current?.scrollWidth ?? 0) + (discordRef.current?.offsetWidth ?? 0) + 24
      setFits(needed <= footer.clientWidth)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(footer)
    return () => observer.disconnect()
  }, [manifest])

  return (
    <footer ref={footerRef} className="relative flex justify-between overflow-hidden py-8 font-mono text-xs text-dim">
      <span ref={manifestRef} className={`whitespace-nowrap ${fits ? "" : "invisible absolute"}`} aria-hidden={!fits}>
        manifest {manifest}
      </span>
      <span ref={discordRef} className={`whitespace-nowrap ${fits ? "" : "mx-auto"}`}>
        discord @yanbxr
      </span>
    </footer>
  )
}
