"use client"

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react"

import { searchPerks, searchText, toTerms, type Perk } from "@/lib/perks"
import { usePerks, useQueryParam } from "@/lib/hooks"
import { PerkRow } from "@/components/perkRow"
import { PerkTip, Popup, placeTip, type Tip } from "@/components/perkTip"

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

type Toast = { perk: Perk; copied: boolean; id: number }

export function PerkSearch() {
  const { state, retry } = usePerks()
  const [query, setQuery] = useQueryParam("q")
  const [visible, setVisible] = useState(pageSize)
  const [tip, setTip] = useState<Tip | null>(null)
  const [toast, setToast] = useState<Toast | null>(null)
  const [toastShown, setToastShown] = useState(false)
  const [selected, setSelected] = useState(0)
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

  // Copy notification: fades in (CSS animation on mount), stays ~2s, fades out over 0.4s, then unmounts.
  useEffect(() => {
    if (!toast) return
    const hide = setTimeout(() => setToastShown(false), 2000)
    const remove = setTimeout(() => setToast(null), 2400)
    return () => {
      clearTimeout(hide)
      clearTimeout(remove)
    }
  }, [toast])

  const copy = useCallback((perk: Perk) => {
    clearTimeout(tipTimer.current)
    setTip(null)
    setSelected(perk.hash)
    setToastShown(true)
    setToast({ perk, copied: copyText(String(perk.index)), id: Date.now() })
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

  // Title link: back to the start, with an empty search.
  const goHome = (event: React.MouseEvent) => {
    event.preventDefault()
    clearTimeout(tipTimer.current)
    setTip(null)
    setQuery("")
    inputRef.current?.blur()
    scrollTo({ top: 0, behavior: "smooth" })
  }

  const ready = state.status === "ready"
  const count = !ready ? "" : terms.length ? `${results.length.toLocaleString("en-US")} ${results.length === 1 ? "result" : "results"}` : `${results.length.toLocaleString("en-US")} perks`

  return (
    <>
      <header className="bg-app sticky top-0 z-40 border-b border-white/10">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-5 sm:px-12 lg:max-w-6xl">
          <a href="./" onClick={goHome} className="flex items-center gap-2.5 font-semibold" aria-label="Home">
            <img src={`${process.env.NEXT_PUBLIC_BASE_PATH}/icon.svg`} alt="" width={20} height={20} className="size-5" />
            YanisPerks
          </a>
          <a href={github} target="_blank" rel="noreferrer" className="text-sm text-primary-lighter transition-colors duration-100 hover:text-secondary-lighter">
            GitHub
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-5 sm:px-12 lg:max-w-6xl">
        <section className="pb-2 pt-10 sm:pt-14">
          <p className="text-sm text-grey">@yanbxr</p>
          <h1 className="mt-3 text-[clamp(2rem,8vw,3.5rem)] font-semibold leading-[1.05]">For all my YanisPasters</h1>
          <h2 className="mt-3 text-xl font-light">Fast perk searcher. Hover a perk for details, click one to copy its index.</h2>
        </section>

        <div className="bg-app sticky top-[57px] z-30 pt-6">
          <div className="group relative flex items-center">
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, description or index"
              className="peer h-12 w-full min-w-0 bg-transparent pr-10 text-xl placeholder:text-grey"
              aria-label="Search perks"
              autoComplete="off"
              spellCheck={false}
            />
            {/* Underline: white/10, primary on hover, gradient on focus. */}
            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/10 transition-colors duration-100 group-hover:bg-primary" />
            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-45 from-secondary-light to-primary-light opacity-0 transition-opacity duration-100 peer-focus:opacity-100" />
            <button
              onClick={clear}
              disabled={!query}
              className="absolute right-0 flex size-10 items-center justify-center disabled:cursor-default"
              aria-label="Clear search"
            >
              <svg viewBox="0 0 24 24" className={`size-6 transition-colors duration-100 ${query ? "fill-primary-light" : "fill-white/15"}`}>
                {query ? (
                  <path d="M6.4 19 5 17.6 10.6 12 5 6.4 6.4 5l5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6Z" />
                ) : (
                  <path d="M19.6 21 13.3 14.7a6 6 0 0 1-3.8 1.3q-2.7 0-4.6-1.9T3 9.5q0-2.7 1.9-4.6T9.5 3q2.7 0 4.6 1.9T16 9.5a6 6 0 0 1-1.3 3.8l6.3 6.3ZM9.5 14q1.9 0 3.2-1.3T14 9.5q0-1.9-1.3-3.2T9.5 5Q7.6 5 6.3 6.3T5 9.5q0 1.9 1.3 3.2T9.5 14Z" />
                )}
              </svg>
            </button>
          </div>
          <p className="mt-1.5 h-4 text-xs text-grey" aria-live="polite">
            {count}
          </p>
          <div className="h-[18px]" />
        </div>

        <main className="min-h-[50vh]">
          {state.status === "loading" && (
            <div className="flex justify-center py-6" role="status" aria-label="Loading perks">
              <svg viewBox="0 0 100 100" className="size-18">
                <circle className="loader-ring" cx="50" cy="50" r="40" fill="none" strokeWidth="3.6" stroke="var(--color-primary)" vectorEffect="non-scaling-stroke" />
                <circle className="loader-ring" cx="50" cy="50" r="40" fill="none" strokeWidth="3.6" stroke="var(--color-primary)" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
          )}

          {state.status === "error" && (
            <div className="py-6">
              <p className="text-base">Could not load perks</p>
              <p className="mt-3 text-sm text-error">{state.message}</p>
              <button
                onClick={retry}
                className="mt-4 p-2.5 text-sm text-[#eee] shadow-[inset_0_-1px_0_var(--color-primary)] transition-[box-shadow,color] duration-200 hover:text-white hover:shadow-[inset_0_-4px_0_var(--color-primary)]"
              >
                Try again
              </button>
            </div>
          )}

          {ready && results.length === 0 && (
            <p className="mt-3 text-center text-sm text-grey">No perks match &quot;{deferredQuery}&quot;</p>
          )}

          {/* pt-0.5 keeps the first row's top border clear of the sticky bar's (sub-pixel) bottom edge. */}
          <ul className={`grid gap-3 pt-0.5 transition-opacity lg:grid-cols-2 xl:grid-cols-3 ${query !== deferredQuery ? "opacity-60" : ""}`}>
            {results.slice(0, visible).map((perk) => (
              <PerkRow key={perk.hash} perk={perk} selected={perk.hash === selected} onHover={hover} onTap={tap} onCopy={copy} />
            ))}
          </ul>
          <div ref={sentinelRef} aria-hidden />
        </main>

        <footer className="mt-10 flex items-start justify-between gap-6 border-t border-white/10 py-6 text-xs text-grey">
          <div className="min-w-0 space-y-1.5">
            <p className="truncate">Manifest {ready ? state.version : "loading"}</p>
            <p>Discord @yanbxr</p>
          </div>
          <a href={github} target="_blank" rel="noreferrer" className="shrink-0 text-primary-lighter transition-colors duration-100 hover:text-secondary-lighter">
            GitHub
          </a>
        </footer>

        <PerkTip tip={tip} />

        {toast && (
          <div
            key={toast.id}
            role="status"
            className={`fixed bottom-4 right-4 z-50 w-[min(320px,calc(100vw-32px))] animate-fade-in transition-opacity duration-400 ${toastShown ? "" : "pointer-events-none opacity-0"}`}
          >
            <Popup
              perk={toast.perk}
              title={toast.copied ? `Copied index ${toast.perk.index}` : "Clipboard blocked"}
              body={toast.copied ? toast.perk.name : `Copy ${toast.perk.index} manually.`}
            />
          </div>
        )}
      </div>
    </>
  )
}
