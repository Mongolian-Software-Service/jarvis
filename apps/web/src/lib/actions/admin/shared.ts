import "server-only";
import { revalidatePath } from "next/cache";
import { getRequestLocale } from "@/lib/locale";

/**
 * The two things every console write does either side of itself.
 *
 * Not a `"use server"` module: these are helpers, not actions, and a file
 * carrying that directive may export nothing but async functions — so putting
 * them beside the actions would make `formObject` an endpoint.
 */

export function formObject(form: FormData): Record<string, FormDataEntryValue | undefined> {
  const out: Record<string, FormDataEntryValue | undefined> = {};
  for (const [key, value] of form.entries()) out[key] = value;
  return out;
}

export async function revalidateAdmin(): Promise<void> {
  const locale = await getRequestLocale();
  revalidatePath(`/${locale}/admin`, "layout");
  revalidatePath(`/${locale}/courses`, "layout");
  revalidatePath(`/${locale}`, "layout");
}
