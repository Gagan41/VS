'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/outline'
import { HandThumbUpIcon as HandThumbUpSolidIcon, HandThumbDownIcon as HandThumbDownSolidIcon } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'

interface LikeDislikeButtonProps {
    videoId: string
}

export default function LikeDislikeButton({ videoId }: LikeDislikeButtonProps) {
    const { data: session } = useSession()
    const [likes, setLikes] = useState(0)
    const [dislikes, setDislikes] = useState(0)
    const [userStatus, setUserStatus] = useState<'like' | 'dislike' | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchLikeStatus()
    }, [videoId])

    const fetchLikeStatus = async () => {
        try {
            const response = await fetch(`/api/videos/${videoId}/like`)
            const data = await response.json()
            setLikes(data.likes || 0)
            setDislikes(data.dislikes || 0)
            setUserStatus(data.userLikeStatus)
        } catch (error) {
            console.error('Error fetching like status:', error)
        }
    }

    const handleLike = async (isLike: boolean) => {
        if (!session) {
            toast.error('Please sign in to like videos')
            return
        }

        setLoading(true)

        // Optimistic update
        const previousLikes = likes
        const previousDislikes = dislikes
        const previousStatus = userStatus

        if (isLike) {
            if (userStatus === 'like') {
                setLikes(likes - 1)
                setUserStatus(null)
            } else if (userStatus === 'dislike') {
                setDislikes(dislikes - 1)
                setLikes(likes + 1)
                setUserStatus('like')
            } else {
                setLikes(likes + 1)
                setUserStatus('like')
            }
        } else {
            if (userStatus === 'dislike') {
                setDislikes(dislikes - 1)
                setUserStatus(null)
            } else if (userStatus === 'like') {
                setLikes(likes - 1)
                setDislikes(dislikes + 1)
                setUserStatus('dislike')
            } else {
                setDislikes(dislikes + 1)
                setUserStatus('dislike')
            }
        }

        try {
            const response = await fetch(`/api/videos/${videoId}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isLike })
            })

            if (!response.ok) {
                throw new Error('Failed to toggle like')
            }

            const data = await response.json()
            setLikes(data.likes || 0)
            setDislikes(data.dislikes || 0)
            setUserStatus(data.userLikeStatus)
        } catch (error) {
            // Revert optimistic update on error
            setLikes(previousLikes)
            setDislikes(previousDislikes)
            setUserStatus(previousStatus)
            toast.error('Failed to update like status')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center gap-4">
            <button
                onClick={() => handleLike(true)}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${userStatus === 'like'
                    ? 'bg-purple-600 text-white'
                    : 'glass text-gray-300 hover:bg-white/20'
                    } disabled:opacity-50`}
            >
                {userStatus === 'like' ? (
                    <HandThumbUpSolidIcon className="w-5 h-5" />
                ) : (
                    <HandThumbUpIcon className="w-5 h-5" />
                )}
                <span className="font-semibold">{likes || 0}</span>
            </button>

            <button
                onClick={() => handleLike(false)}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${userStatus === 'dislike'
                    ? 'bg-red-600 text-white'
                    : 'glass text-gray-300 hover:bg-white/20'
                    } disabled:opacity-50`}
            >
                {userStatus === 'dislike' ? (
                    <HandThumbDownSolidIcon className="w-5 h-5" />
                ) : (
                    <HandThumbDownIcon className="w-5 h-5" />
                )}
                <span className="font-semibold">{dislikes || 0}</span>
            </button>
        </div>
    )
}
