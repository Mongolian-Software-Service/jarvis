"use client";

import { useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export type MenuLink = { href: string; label: string };

/**
 * The phone's navigation.
 *
 * A real `<dialog>` opened with `showModal()`: focus trapping, Escape to close,
 * the backdrop and the inertness of the page behind it all come from the
 * platform. Re-implementing any of that by hand is how a menu ends up letting
 * the tab key wander into the page underneath it.
 */
export function MobileMenu({ links, label }: { links: MenuLink[]; label: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  // A navigation inside the sheet has to close it — the dialog survives a soft
  // route change, and would otherwise still be covering the page it opened.
  useEffect(() => {
    dialog.current?.close();
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        aria-label={label}
        onClick={() => dialog.current?.showModal()}
        className="grid size-9 place-items-center rounded-sm text-ink-2 hover:bg-panel-2 hover:text-ink lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      <dialog
        ref={dialog}
        // The backdrop is part of the dialog's own box, so a click on it
        // arrives here with the dialog as the target.
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current?.close();
        }}
        className={cn(
          "m-0 ml-auto h-dvh max-h-none w-[min(20rem,85vw)] max-w-none",
          "border-l border-line bg-panel p-0 text-ink",
          "backdrop:bg-black/60",
        )}
      >
        <div className="flex h-full flex-col p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            aria-label="Close"
            onClick={() => dialog.current?.close()}
            className="mb-6 grid size-9 place-items-center self-end rounded-sm text-ink-2 hover:bg-panel-2"
          >
            <X className="size-5" />
          </button>

          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-3 text-base font-medium text-ink-2 hover:bg-panel-2 hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </dialog>
    </>
  );
}
