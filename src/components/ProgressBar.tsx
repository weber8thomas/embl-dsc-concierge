interface ProgressBarProps {
  current: number // 1-based position
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-medium text-embl-grey-dark">
        <span>
          Card {current} of {total}
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-embl-grey-lightest"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-label={`Card ${current} of ${total}`}
      >
        <div className="h-full rounded-full bg-embl-green transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
