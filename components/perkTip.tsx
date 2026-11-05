import { useEffect, useState } from "react"

import type { Perk } from "@/lib/perks"

export type Tip = {
  perk: Perk
  left: number
  top: number
}

export const placeTip = (perk: Perk, row: HTMLElement): Tip => ({
  perk,
  left: row.children[1].getBoundingClientRect().left,
  top: row.getBoundingClientRect().bottom - 8,
})

export function PerkTip({ tip }: { tip: Tip | null }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!tip) return setOpen(false)
    const frame = requestAnimationFrame(() => setOpen(true))
    return () => cancelAnimationFrame(frame)
  }, [tip])

  if (!tip) return null

  return (
    <div
      role="tooltip"
      className={`pointer-events-none fixed z-50 w-max origin-top-left border border-line bg-[#111] font-mono text-xs shadow-[0_16px_48px_rgba(0,0,0,0.7)] transition-[opacity,transform] duration-200 ease-out will-change-[opacity,transform] ${
        open ? "opacity-100" : "-translate-y-1 scale-[0.97] opacity-0"
      }`}
      style={{ left: tip.left, top: tip.top, maxWidth: Math.min(448, innerWidth - tip.left - 20) }}
    >
      <p className="border-b border-line px-4 py-2.5 text-dim">
        hash <span className="tabular-nums text-white">{tip.perk.hash}</span>
      </p>
      <p className="whitespace-pre-line px-4 py-3 leading-relaxed text-white">{tip.perk.description || "no description"}</p>
    </div>
  )
}
