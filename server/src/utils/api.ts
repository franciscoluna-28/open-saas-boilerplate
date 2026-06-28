export type Result<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E; errors?: unknown[] };

export const ok = <T>(data: T): Result<T, never> => ({ success: true, data });
export const err = <E>(error: E, errors?: unknown[]): Result<never, E> => ({
  success: false,
  error,
  errors,
});

export async function wrap<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return ok(await fn());
  } catch (e) {
    const message = e instanceof Error ? e.message : "An error occurred";
    if (process.env.NODE_ENV === "development") {
      console.error("[Use Case Wrap Error]:", e);
    }
    return err(message);
  }
}
