import { useState } from 'react'
import { User } from 'lucide-react'
import type { Competency, MemberWithId } from '../content/schema'

interface ProfileCardProps {
  member: MemberWithId
  competencies: Record<string, Competency>
  /** Show the competency chips (default true). */
  showCompetencies?: boolean
}

/**
 * EMBL Visual-Framework `vf-profile`-style member card. On mobile it lays out
 * horizontally (photo left, details right) so it reads well one-per-row; from
 * `sm` up it becomes the stacked, centred card used in multi-column grids.
 * Photos are hotlinked; a neutral avatar is shown if the image is missing/fails.
 */
export function ProfileCard({ member, competencies, showCompetencies = true }: ProfileCardProps) {
  const [imgOk, setImgOk] = useState(Boolean(member.photo))
  const tags = member.competencies ?? []

  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-embl-grey-lightest sm:flex-col sm:gap-0 sm:text-center">
      {imgOk && member.photo ? (
        <img
          src={member.photo}
          alt=""
          loading="lazy"
          onError={() => setImgOk(false)}
          className="h-20 w-20 shrink-0 rounded-full object-cover ring-2 ring-embl-green-lightest"
        />
      ) : (
        <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-embl-green-lightest text-embl-green-dark ring-2 ring-embl-green-lightest">
          <User className="h-9 w-9" aria-hidden="true" />
        </span>
      )}

      <div className="min-w-0 sm:mt-3 sm:w-full">
        {member.lead && (
          <span className="mb-1 inline-flex items-center rounded-full bg-embl-green px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
            Team lead
          </span>
        )}
        <h3 className="font-semibold leading-tight text-embl-grey-darkest">{member.name}</h3>
        {member.position && <p className="mt-0.5 text-sm leading-snug text-embl-grey-dark">{member.position}</p>}
        {member.orcid && (
          <a
            href={`https://orcid.org/${member.orcid}`}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-embl-link transition-colors hover:text-embl-link-hover sm:justify-center"
          >
            <span className="inline-block h-3 w-3 rounded-full bg-[#a6ce39] text-center text-[8px] font-bold leading-3 text-white" aria-hidden="true">iD</span>
            {member.orcid}
          </a>
        )}

        {showCompetencies && tags.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5 sm:mt-3 sm:justify-center">
            {tags.map((t) => (
              <li
                key={t}
                className="rounded-full bg-embl-green-lightest px-2.5 py-0.5 text-xs font-medium text-embl-green-darkest"
              >
                {competencies[t]?.label ?? t}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
