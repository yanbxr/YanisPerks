import { useLayoutEffect, useRef, useState } from "react"

import { iconUrl, type Perk } from "@/lib/perks"

export type Tip = {
  perk: Perk
  left: number
  top: number
  bottom: number
  width: number
}

export const placeTip = (perk: Perk, row: HTMLElement): Tip => {
  const rect = row.getBoundingClientRect()
  return { perk, left: rect.left, top: rect.top, bottom: rect.bottom, width: rect.width }
}

// Popup card: horizontal gradient, compact 48px image, title, light body text.
export function Popup({ perk, title, body, meta }: { perk: Perk; title: string; body: string; meta?: boolean }) {
  return (
    <div className="bg-popup grid grid-cols-[48px_1fr] items-start gap-3.5 border border-white/10 p-3 shadow-[0_12px_32px_-12px_#000000aa]">
      <img src={iconUrl(perk.icon)} alt="" width={48} height={48} className="size-12 object-cover" />
      <div className="min-w-0">
        <p className="mb-1 text-[15px] font-medium leading-tight">{title}</p>
        <p className="whitespace-pre-line text-[13px] leading-snug font-light text-soft">{body}</p>
        {meta && (
          <p className="mt-1.5 flex items-center gap-2.5 text-xs font-light text-grey tabular-nums">
            <span>Hash {perk.hash}</span>
            <span className="h-2.5 w-px bg-white/20" aria-hidden />
            <span>Index {perk.index}</span>
          </p>
        )}
      </div>
    </div>
  )
}

// Hover/tap details, placed under the card (or above it near the bottom of the screen). Fades and rises in.
export function PerkTip({ tip }: { tip: Tip | null }) {
  const ref = useRef<HTMLDivElement>(null)
  const [top, setTop] = useState(0)

  useLayoutEffect(() => {
    if (!tip || !ref.current) return
    const height = ref.current.offsetHeight
    const below = tip.bottom + 8
    setTop(below + height > innerHeight - 8 ? tip.top - 8 - height : below)
  }, [tip])

  if (!tip) return null

  // Same width and left edge as the card it describes.
  const width = tip.width
  const left = tip.left

  return (
    <div
      key={tip.perk.hash}
      ref={ref}
      role="tooltip"
      className="pointer-events-none fixed z-50 animate-fade-in"
      style={{ left, top, width }}
    >
      <Popup perk={tip.perk} title={tip.perk.name} body={tip.perk.description || "No description"} meta />
    </div>
  )
}
