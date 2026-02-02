'use client'

interface DurationBadgeProps {
    durationSeconds: number
}

export default function DurationBadge({ durationSeconds }: DurationBadgeProps) {
    const formatDuration = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/90 backdrop-blur-sm text-[11px] font-bold text-white rounded flex items-center gap-0.5 border border-black/50">
            {formatDuration(durationSeconds)}
        </div>
    )
}
