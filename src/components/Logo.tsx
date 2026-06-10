/**
 * Reserved slot for the official EMBL logo.
 *
 * EMBL guidelines: on *digital* products the logo sits top-left, links to
 * www.embl.org, keeps clear space of at least the height of the "E" around it,
 * and the colour version is used on plain white. The real logo is protected and
 * needs Design-team sign-off, so this is a neutral placeholder — drop the
 * approved asset in /public and swap the markup here when available.
 *
 * "One Institute" principle: EMBL is the parent brand shown first; the Data
 * Science Centre product name is secondary (it lives in the page content).
 */
export function Logo() {
  return (
    <a
      href="https://www.embl.org"
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2.5 rounded-lg p-1 text-embl-grey-darkest"
      aria-label="EMBL — placeholder logo (links to embl.org)"
    >
      {/* Placeholder mark: a roundel echoing the EMBL monochrome image mark. */}
      <span className="grid h-9 w-9 place-items-center rounded-full bg-embl-green text-base font-bold text-white">
        E
      </span>
      <span className="text-lg font-bold leading-none tracking-tight">EMBL</span>
    </a>
  )
}
