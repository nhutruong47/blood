/**
 * Helpers for unwrapping orval-generated API responses consistently.
 *
 * Generated hooks return objects like `ApiResponseFoo`:
 *   {
 *     data: {
 *       success: true,
 *       message: "...",
 *       data: <actual payload>
 *     },
 *     status: 200,
 *     headers: ...
 *   }
 *
 * Most pages just want `<actual payload>`. Use these helpers instead of
 * the duplicated `(response?.data as any)?.data ?? []` pattern.
 */

export interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

export function unwrapApi<T>(response: unknown, fallback: T): T {
  if (!response) return fallback;
  const r = response as { data?: { data?: T } } | { data?: T } | T;
  // Path 1: response is the inner body (`{ data: payload }`).
  if (r && typeof r === 'object' && 'data' in (r as object)) {
    const inner = (r as { data?: unknown }).data;
    if (inner && typeof inner === 'object' && 'data' in (inner as object)) {
      return ((inner as { data?: T }).data ?? fallback) as T;
    }
    if (inner !== undefined) {
      return inner as T;
    }
  }
  return (r as T) ?? fallback;
}

/** Stable identity if the response is missing. */
export const EMPTY_ARRAY: readonly never[] = Object.freeze([]) as readonly never[];

export function unwrapList<T>(response: unknown): T[] {
  const result = unwrapApi<T[] | undefined>(response, undefined);
  return Array.isArray(result) ? result : [];
}

export function unwrapPage<T>(
  response: unknown,
): { content: T[]; page: number; size: number; totalElements: number; totalPages: number } {
  const page = unwrapApi<any>(response, {});
  const content = Array.isArray(page?.content) ? page.content : [];
  return {
    content,
    page: page?.number ?? 0,
    size: page?.size ?? content.length,
    totalElements: page?.totalElements ?? content.length,
    totalPages: page?.totalPages ?? 1,
  };
}

export function extractErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (!err) return fallback;
  const e = err as { response?: { data?: { message?: string; data?: string } }; message?: string };
  const candidate =
    e?.response?.data?.message ??
    e?.response?.data?.data ??
    e?.message ??
    fallback;
  return typeof candidate === 'string' && candidate.length > 0 ? candidate : fallback;
}