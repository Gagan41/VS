'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { TrashIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface Comment {
    id: string
    content: string
    createdAt: string
    user: {
        id: string
        name: string
        image: string | null
    }
    replies: Reply[]
}

interface Reply {
    id: string
    content: string
    createdAt: string
    parentId: string | null
    user: {
        id: string
        name: string
        image: string | null
    }
}

interface CommentSectionProps {
    videoId: string
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString()
}

export default function CommentSection({ videoId }: CommentSectionProps) {
    const { data: session } = useSession()
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [replyingTo, setReplyingTo] = useState<{ id: string, type: 'comment' | 'reply' } | null>(null)
    const [replyContent, setReplyContent] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        fetchComments()
    }, [videoId])

    const fetchComments = async () => {
        try {
            const response = await fetch(`/api/videos/${videoId}/comments`)
            if (!response.ok) {
                throw new Error('Failed to fetch comments')
            }
            const data = await response.json()
            setComments(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Error fetching comments:', error)
            setComments([])
        } finally {
            setLoading(false)
        }
    }

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!session) {
            toast.error('Please sign in to comment')
            return
        }

        if (!newComment.trim()) {
            return
        }

        setSubmitting(true)
        try {
            const response = await fetch(`/api/videos/${videoId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newComment })
            })

            if (!response.ok) {
                throw new Error('Failed to post comment')
            }

            const comment = await response.json()
            setComments([comment, ...comments])
            setNewComment('')
            toast.success('Comment posted!')
        } catch (error) {
            toast.error('Failed to post comment')
        } finally {
            setSubmitting(false)
        }
    }

    const handleSubmitReply = async (commentId: string, parentId: string | null = null) => {
        if (!session) {
            toast.error('Please sign in to reply')
            return
        }

        if (!replyContent.trim()) {
            return
        }

        setSubmitting(true)
        try {
            const response = await fetch(`/api/comments/${commentId}/replies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: replyContent, parentId })
            })

            if (!response.ok) {
                throw new Error('Failed to post reply')
            }

            const reply = await response.json()

            // Update comments with new reply
            setComments(comments.map(comment => {
                if (comment.id === commentId) {
                    return {
                        ...comment,
                        replies: [...comment.replies, reply]
                    }
                }
                return comment
            }))

            setReplyContent('')
            setReplyingTo(null)
            toast.success('Reply posted!')
        } catch (error) {
            toast.error('Failed to post reply')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm('Are you sure you want to delete this comment?')) {
            return
        }

        try {
            const response = await fetch(`/api/comments/${commentId}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                throw new Error('Failed to delete comment')
            }

            setComments(comments.filter(c => c.id !== commentId))
            toast.success('Comment deleted')
        } catch (error) {
            toast.error('Failed to delete comment')
        }
    }

    const user = session?.user as any

    const ReplyItem = ({ reply, commentId, allReplies }: { reply: Reply, commentId: string, allReplies: Reply[] }) => {
        const nestedReplies = allReplies.filter(r => r.parentId === reply.id)

        return (
            <div className="space-y-3">
                <div className="flex gap-3">
                    <img
                        src={reply?.user?.image || '/default-avatar.png'}
                        alt={reply?.user?.name || 'User'}
                        className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-white text-sm">
                                {reply?.user?.name || 'Anonymous'}
                            </span>
                            <span className="text-xs text-gray-400">
                                {formatDate(reply.createdAt)}
                            </span>
                        </div>
                        <p className="text-gray-300 text-sm">{reply.content}</p>
                        <div className="flex items-center gap-4 mt-1">
                            <button
                                onClick={() => setReplyingTo({ id: reply.id, type: 'reply' })}
                                className="text-xs text-primary hover:text-primary-300 flex items-center gap-1 transition-colors"
                            >
                                <ChatBubbleLeftIcon className="w-3 h-3" />
                                Reply
                            </button>
                        </div>
                    </div>
                </div>

                {/* Reply Form for this reply */}
                {replyingTo?.id === reply.id && (
                    <div className="ml-11 flex gap-3">
                        <img
                            src={user?.image || '/default-avatar.png'}
                            alt={user?.name || 'User'}
                            className="w-7 h-7 rounded-full"
                        />
                        <div className="flex-1">
                            <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Write a reply..."
                                className="w-full px-3 py-2 bg-deep/50 border border-primary/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 resize-none text-xs transition-all"
                                rows={2}
                                maxLength={500}
                            />
                            <div className="flex items-center gap-2 mt-2">
                                <button
                                    onClick={() => handleSubmitReply(commentId, reply.id)}
                                    disabled={submitting || !replyContent.trim()}
                                    className="px-3 py-1.5 gradient-primary text-white text-xs font-semibold rounded-lg hover:shadow-glow-primary transition-all disabled:opacity-50"
                                >
                                    Reply
                                </button>
                                <button
                                    onClick={() => {
                                        setReplyingTo(null)
                                        setReplyContent('')
                                    }}
                                    className="px-2 py-1 text-gray-400 text-xs hover:text-white transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recursive Nested Replies */}
                {nestedReplies.length > 0 && (
                    <div className="ml-11 space-y-3 border-l-2 border-primary/30 pl-4">
                        {nestedReplies.map((nested) => (
                            <ReplyItem key={nested.id} reply={nested} commentId={commentId} allReplies={allReplies} />
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="glass-surface rounded-2xl p-6 border border-primary/20 shadow-surface">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span>Comments</span>
                <span className="text-primary">({comments.length})</span>
            </h2>

            {/* Comment Input */}
            {session ? (
                <form onSubmit={handleSubmitComment} className="mb-8">
                    <div className="flex gap-3">
                        <img
                            src={user?.image || '/default-avatar.png'}
                            alt={user?.name || 'User'}
                            className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                className="w-full px-4 py-3 bg-deep/50 border border-primary/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 resize-none transition-all"
                                rows={3}
                                maxLength={500}
                            />
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-sm text-gray-400">
                                    {newComment.length}/500
                                </span>
                                <button
                                    type="submit"
                                    disabled={submitting || !newComment.trim()}
                                    className="px-5 py-2 gradient-primary text-white font-semibold rounded-lg hover:shadow-glow-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Posting...' : 'Comment'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="mb-8 p-4 bg-surface/30 border border-primary/20 rounded-lg text-center">
                    <p className="text-gray-300">Sign in to leave a comment</p>
                </div>
            )}

            {/* Comments List */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                    No comments yet. Be the first to comment!
                </div>
            ) : (
                <div className="space-y-6">
                    {comments.map((comment) => (
                        <div key={comment.id} className="space-y-3">
                            {/* Comment */}
                            <div className="flex gap-3">
                                <img
                                    src={comment?.user?.image || '/default-avatar.png'}
                                    alt={comment?.user?.name || 'User'}
                                    className="w-10 h-10 rounded-full flex-shrink-0"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-white">
                                            {comment?.user?.name || 'Anonymous'}
                                        </span>
                                        <span className="text-sm text-gray-400">
                                            {formatDate(comment.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-gray-300 mb-2">{comment.content}</p>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setReplyingTo({ id: comment.id, type: 'comment' })}
                                            className="text-sm text-primary hover:text-primary-300 flex items-center gap-1 transition-colors"
                                        >
                                            <ChatBubbleLeftIcon className="w-4 h-4" />
                                            Reply
                                        </button>
                                        {user?.id === comment?.user?.id && (
                                            <button
                                                onClick={() => handleDeleteComment(comment.id)}
                                                className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Reply Form for top-level comment */}
                            {replyingTo?.id === comment.id && replyingTo.type === 'comment' && (
                                <div className="ml-14 flex gap-3">
                                    <img
                                        src={user?.image || '/default-avatar.png'}
                                        alt={user?.name || 'User'}
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <div className="flex-1">
                                        <textarea
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            placeholder="Write a reply..."
                                            className="w-full px-3 py-2 bg-deep/50 border border-primary/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 resize-none text-sm transition-all"
                                            rows={2}
                                            maxLength={500}
                                        />
                                        <div className="flex items-center gap-2 mt-2">
                                            <button
                                                onClick={() => handleSubmitReply(comment.id)}
                                                disabled={submitting || !replyContent.trim()}
                                                className="px-4 py-1.5 gradient-primary text-white text-sm font-semibold rounded-lg hover:shadow-glow-primary transition-all disabled:opacity-50"
                                            >
                                                Reply
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setReplyingTo(null)
                                                    setReplyContent('')
                                                }}
                                                className="px-3 py-1 text-gray-400 text-sm hover:text-white transition"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Replies Tree */}
                            {comment.replies.length > 0 && (
                                <div className="ml-14 space-y-3">
                                    {comment.replies
                                        .filter(reply => !reply.parentId)
                                        .map((reply) => (
                                            <ReplyItem
                                                key={reply.id}
                                                reply={reply}
                                                commentId={comment.id}
                                                allReplies={comment.replies}
                                            />
                                        ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
