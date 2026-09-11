import * as SecureStore from "expo-secure-store";

/**
 * Key-value storage for the phone, in the keychain.
 *
 * `expo-secure-store` refuses a value over about 2KB, and a Supabase session —
 * access token, refresh token, user object — is comfortably past that. So a
 * value is split into chunks under `key.0`, `key.1`, … with the count under
 * `key.n`, and reassembled on the way out.
 *
 * The alternative is AsyncStorage, which is what most guides show and which
 * leaves refresh tokens in plain text on disk. Chunking is thirty lines; a
 * stolen unlocked session is somebody's paid courses.
 */
const CHUNK = 1800;

function chunkKey(key: string, index: number): string {
  return `${key}.${index}`;
}

async function count(key: string): Promise<number> {
  const raw = await SecureStore.getItemAsync(`${key}.n`);
  const value = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    const parts = await count(key);
    if (parts === 0) return null;

    const chunks: string[] = [];
    for (let index = 0; index < parts; index++) {
      const chunk = await SecureStore.getItemAsync(chunkKey(key, index));
      // A half-written value is not a value. Better to be signed out than to
      // hand `JSON.parse` a truncated token.
      if (chunk === null) return null;
      chunks.push(chunk);
    }
    return chunks.join("");
  },

  async setItem(key: string, value: string): Promise<void> {
    const previous = await count(key);

    const chunks: string[] = [];
    for (let index = 0; index < value.length; index += CHUNK) {
      chunks.push(value.slice(index, index + CHUNK));
    }

    for (const [index, chunk] of chunks.entries()) {
      await SecureStore.setItemAsync(chunkKey(key, index), chunk);
    }
    await SecureStore.setItemAsync(`${key}.n`, String(chunks.length));

    // Anything the shorter value no longer covers, or a stale tail outlives it.
    for (let index = chunks.length; index < previous; index++) {
      await SecureStore.deleteItemAsync(chunkKey(key, index));
    }
  },

  async removeItem(key: string): Promise<void> {
    const parts = await count(key);
    for (let index = 0; index < parts; index++) {
      await SecureStore.deleteItemAsync(chunkKey(key, index));
    }
    await SecureStore.deleteItemAsync(`${key}.n`);
  },
};

/** A small preference — the language. Same store, no chunking needed. */
export async function readPreference(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export async function writePreference(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    // A device that refuses the keychain still gets the change for this run.
  }
}
