/**
 * EMBL logo, top-left per the EMBL *digital* logo guideline, linking to embl.org,
 * with clear space around it (header padding) and kept above the 30px min height.
 *
 * The asset (public/embl-logo.svg) is the official EMBL logo fetched from
 * embl.org. If your deployment needs a different/approved variant, replace that
 * file — no code change needed.
 *
 * "One Institute" principle: EMBL is the parent brand shown first; the Data
 * Science Centre is the secondary product (see <DscLogo>).
 */
export function Logo() {
  return (
    <a
      href="https://www.embl.org"
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center rounded-lg p-1"
      aria-label="EMBL, visit embl.org"
    >
      <img
        src={`${import.meta.env.BASE_URL}embl-logo.svg`}
        alt="EMBL"
        className="h-8 w-auto sm:h-9"
      />
    </a>
  )
}
