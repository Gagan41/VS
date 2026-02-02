import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface VideoCardProps {
    video: {
        id: string
        title: string
        description: string
        thumbnailUrl: string | null
        accessType: 'FREE' | 'PREMIUM'
        videoType: 'LONG' | 'SHORT'
    }
    playlistId?: string | null
}

export default function VideoCard({ video, playlistId }: VideoCardProps) {
    const videoUrl = playlistId ? `/video/${video.id}?playlist=${playlistId}` : `/video/${video.id}`

    return (
        <Link href={videoUrl}>
            <motion.div
                whileHover={{ scale: 1.03, y: -4 }}
                transition={{ duration: 0.2 }}
                className="group cursor-pointer"
            >
                <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 shadow-md group-hover:shadow-lg transition-all duration-300">
                    {video.thumbnailUrl ? (
                        <Image
                            src={video.thumbnailUrl}
                            alt={video.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                            </svg>
                        </div>
                    )}

                    {/* Premium Badge */}
                    {video.accessType === 'PREMIUM' && (
                        <div className="absolute top-3 right-3 px-3 py-1.5 bg-black text-white text-[10px] font-black rounded-lg shadow-lg uppercase tracking-wider">
                            PREMIUM
                        </div>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="mt-3 space-y-1.5">
                    <h3 className="text-black font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors text-no-overflow">
                        {video.title}
                    </h3>
                    {video.description && (
                        <p className="text-gray-700 text-sm leading-snug line-clamp-2 text-no-overflow">
                            {video.description}
                        </p>
                    )}
                </div>
            </motion.div>
        </Link>
    )
}
