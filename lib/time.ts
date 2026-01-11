/**
 * Formats seconds into a human-readable duration string.
 * e.g., 3661 -> "1:01:01", 61 -> "1:01", 5 -> "0:05"
 */
export function formatDuration(seconds: number): string {
    if (!seconds || seconds <= 0) return '0:00'

    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)

    const parts = []
    if (h > 0) parts.push(h)
    parts.push(h > 0 ? m.toString().padStart(2, '0') : m)
    parts.push(s.toString().padStart(2, '0'))

    return parts.join(':')
}
