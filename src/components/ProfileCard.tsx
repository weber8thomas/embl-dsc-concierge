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
 * EMBL Visual-Framework `vf-profile`-style member card: round photo, name,
 * position and competency chips. Photos are hotlinked (e.g. content.embl.org);
 * a neutral avatar is shown if the image is missing or fails to load.
 */
export function ProfileCard({ member, competencies, showCompetencies = true }: ProfileCardProps) {
  const [imgOk, setImgOk] = useState(Boolean(member.photo))
  const tags = member.competencies ?? []

  return (
    <div className="flex flex-col items-center rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-embl-grey-lightest">
      {imgOk && member.photo ? (
        <img
          src={member.photo}
          alt=""
          loading="lazy"
          onError={() => setImgOk(false)}
          className="h-20 w-20 rounded-full object-cover ring-2 ring-embl-green-lightest"
        />
      ) : (
        <span className="grid h-20 w-20 place-items-center rounded-full bg-embl-green-lightest text-embl-green-dark ring-2 ring-embl-green-lightest">
          <User className="h-9 w-9" aria-hidden="true" />
        </span>
      )}

      <h3 className="mt-3 font-semibold leading-tight text-embl-grey-darkest">{member.name}</h3>
      {member.position && <p className="mt-0.5 text-sm leading-snug text-embl-grey-dark">{member.position}</p>}

      {showCompetencies && tags.length > 0 && (
        <ul className="mt-3 flex flex-wrap justify-center gap-1.5">
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
  )
}
