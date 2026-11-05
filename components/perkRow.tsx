import { memo } from "react"

import { iconUrl, type Perk } from "@/lib/perks"

type Props = {
  perk: Perk
  onHover: (perk: Perk | null, row?: HTMLElement) => void
  onTap: (perk: Perk, row: HTMLElement) => void
  onCopy: (value: number, label: string) => void
}

export const PerkRow = memo(function PerkRow({ perk, onHover, onTap, onCopy }: Props) {
  return (
    <li
      onClick={(event) => (event.nativeEvent as PointerEvent).pointerType !== "mouse" && onTap(perk, event.currentTarget)}
      className="grid h-[max(3.5rem,calc((100dvh-145px)/7))] grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 border-b border-line sm:h-[max(3.5rem,calc((100dvh-153px)/10))] sm:grid-cols-[3rem_1fr_auto] sm:px-6"
    >
      <img src={iconUrl(perk.icon)} alt="" width={48} height={48} className="size-10 sm:size-12" />
      <div className="min-w-0">
        <p
          onMouseEnter={(event) => onHover(perk, event.currentTarget.closest("li") as HTMLElement)}
          onMouseLeave={() => onHover(null)}
          className="w-fit max-w-full truncate text-[15px] font-semibold underline-offset-4 hover:underline"
        >
          {perk.name}
        </p>
      </div>
      <button
        onClick={(event) => {
          event.stopPropagation()
          onCopy(perk.index, "index")
        }}
        title="copy index"
        className="w-[calc(5ch+1.5rem)] border border-line py-1 text-center font-mono text-xs tabular-nums hover:border-accent hover:bg-accent hover:text-black"
      >
        {perk.index}
      </button>
    </li>
  )
})
