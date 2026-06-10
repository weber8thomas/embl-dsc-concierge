/**
 * Reserved slot for the official EMBL logo (top-right per the design guidelines,
 * with clear space around it). The real logo is protected and needs Design-team
 * sign-off, so this is a neutral placeholder — drop the approved asset in
 * /public and swap the markup here when available.
 */
export function Logo() {
  return (
    <div
      className="flex items-center gap-2 text-embl-grey-dark"
      aria-label="EMBL — placeholder logo slot"
    >
      <span className="grid h-8 w-8 place-items-center rounded-roundel bg-embl-green text-sm font-bold text-white">
        E
      </span>
      <span className="text-sm font-semibold tracking-wide">EMBL</span>
    </div>
  )
}
