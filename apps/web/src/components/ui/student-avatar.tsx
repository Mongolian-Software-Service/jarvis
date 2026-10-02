import { cn } from "@/lib/cn";

/**
 * Every student's picture — the same one for everybody.
 *
 * Not the photo Google hands over. A feed where some people have a face and
 * the rest a grey circle reads as two classes of student, and a classmate's
 * holiday photo is more of them than a project page needs. One drawing, the
 * person outline in the school's cyan-to-violet, is the same for all of them.
 *
 * An SVG rather than an image file, so it is sharp at any size and costs no
 * request. The gradient needs an id, and an id has to be unique on the page —
 * two avatars sharing one would both break the moment the first is hidden —
 * so the caller passes something it already has that is unique, a row id.
 */
export function StudentAvatar({ id, className }: { id: string; className?: string }) {
  const gradient = `avatar-${id}`;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "border-line bg-panel-2 grid size-10 shrink-0 place-items-center rounded-full border",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-[62%]">
        <defs>
          <linearGradient
            id={gradient}
            x1="2"
            y1="22"
            x2="22"
            y2="8"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" style={{ stopColor: "var(--avatar-from)" }} />
            <stop offset="1" style={{ stopColor: "var(--avatar-to)" }} />
          </linearGradient>
        </defs>
        <g stroke={`url(#${gradient})`} strokeWidth="1.9" strokeLinejoin="round">
          <circle cx="12" cy="7.2" r="4.1" />
          <path d="M2.9 20.3c0-4.7 3.5-7.6 6.5-8 .9-.1 1.7.4 2.6.4s1.7-.5 2.6-.4c3 .4 6.5 3.3 6.5 8 0 .4-.3.7-.7.7H3.6c-.4 0-.7-.3-.7-.7Z" />
        </g>
      </svg>
    </span>
  );
}
