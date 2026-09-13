import { cn } from "@/lib/cn";

/** The two pieces every sketch is built from: a bordered frame, and a grey bar
 *  standing in for a line of text. Shared so the four sketches sit at the same
 *  weight beside each other. */

export function Frame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-line bg-panel", className)}>
      {children}
    </div>
  );
}

/** A bar standing in for a line of text nobody is meant to read. */
export function Bar({ className }: { className?: string }) {
  return <span className={cn("block rounded-full bg-panel-3", className)} />;
}

/** A finished site, in the browser, with its own address. */
