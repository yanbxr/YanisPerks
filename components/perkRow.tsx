import { memo } from "react"

import { iconUrl, type Perk } from "@/lib/perks"

type Props = {
  perk: Perk
  selected: boolean
  onHover: (perk: Perk | null, row?: HTMLElement) => void
  onTap: (perk: Perk, row: HTMLElement) => void
  onCopy: (perk: Perk) => void
}

// Bordered card: white/10 border, primary on hover, gradient on the last copied perk.
export const PerkRow = memo(function PerkRow({ perk, selected, onHover, onTap, onCopy }: Props) {
  return (
    <li
      onClick={(event) => {
        const mouse = (event.nativeEvent as PointerEvent).pointerType === "mouse"
        if (mouse) onCopy(perk)
        else onTap(perk, event.currentTarget)
      }}
      onMouseEnter={(event) => onHover(perk, event.currentTarget)}
      onMouseLeave={() => onHover(null)}
      // No movement on hover: a lifted card slid its top border under the sticky search bar.
      className={`group flex cursor-pointer items-center gap-3 border p-4 pr-3 transition-[background-color,border-color,box-shadow] duration-200 ease-out hover:bg-white/[0.03] hover:shadow-[0_10px_28px_-14px_var(--color-primary-light),inset_0_1px_0_rgba(255,255,255,0.05)] active:bg-white/[0.05] ${
        selected ? "border-gradient" : "border-white/10 hover:border-primary"
      }`}
    >
      <img
        src={iconUrl(perk.icon)}
        alt=""
        width={40}
        height={40}
        className="size-8 shrink-0 transition-transform duration-200 ease-out group-hover:scale-105 sm:size-10"
      />
      <span className="min-w-0 flex-1 truncate text-base">{perk.name}</span>
      <button
        onClick={(event) => {
          event.stopPropagation()
          onCopy(perk)
        }}
        title="Copy index"
        className="h-7 min-w-7 shrink-0 px-1.5 text-sm text-grey tabular-nums transition-colors duration-100 hover:bg-white/5 hover:text-white"
      >
        {perk.index}
      </button>
    </li>
  )
})
