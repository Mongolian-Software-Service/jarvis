import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const CONTROL = cn(
  "w-full bg-panel-2 border border-line rounded-md px-3 py-2 text-[13px]",
  "placeholder:text-ink-3 transition-colors",
  "focus:border-accent focus:outline-none focus-visible:outline-none",
  "disabled:opacity-60",
);

/**
 * A label, a control and the one message that belongs under it.
 *
 * `error` is wired to the control through `aria-describedby` by the caller
 * passing the same `id` — a red border that a screen reader cannot see is not
 * an error message.
 */
export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-[13px] font-medium text-ink-2">
        {label}
      </label>
      {children}
      {error ? (
        <p id={htmlFor ? `${htmlFor}-error` : undefined} className="text-xs text-bad">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-ink-3">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(CONTROL, className)} {...rest} />;
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(CONTROL, "min-h-28 leading-relaxed", className)} {...rest} />;
}

export function Select({ className, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(CONTROL, "h-9 py-0", className)} {...rest} />;
}

/** A monospaced control, for slugs and code — Latin text only. */
export function CodeInput({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(CONTROL, "font-mono text-xs", className)} {...rest} />;
}

export function CodeArea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      spellCheck={false}
      className={cn(CONTROL, "font-mono text-xs leading-relaxed min-h-40", className)}
      {...rest}
    />
  );
}
