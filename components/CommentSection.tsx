'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { TrashIcon, ChatBubbleLeftIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
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

// Move ReplyItem outside to prevent re-creation on every render
interface ReplyItemProps {
    reply: Reply
    commentId: string
    allReplies: Reply[]
    replyingTo: { id: string, type: 'comment' | 'reply' } | null
    setReplyingTo: (value: { id: string, type: 'comment' | 'reply' } | null) => void
    replyContent: string
    setReplyContent: (content: string) => void
    handleSubmitReply: (commentId: string, parentId: string | null) => void
    submitting: boolean
    userImage: string | null
    userName: string | null
    collapsedReplies: Set<string>
    toggleReplyCollapse: (replyId: string) => void
}

const ReplyItem = ({
    reply,
    commentId,
    allReplies,
    replyingTo,
    setReplyingTo,
    replyContent,
    setReplyContent,
    handleSubmitReply,
    submitting,
    userImage,
    userName,
    collapsedReplies,
    toggleReplyCollapse
}: ReplyItemProps) => {
    const nestedReplies = allReplies.filter(r => r.parentId === reply.id)
    const isCollapsed = collapsedReplies.has(reply.id)

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
                        <span className="font-bold text-black text-sm">
                            {reply?.user?.name || 'Anonymous'}
                        </span>
                        <span className="text-xs text-gray-500">
                            {formatDate(reply.createdAt)}
                        </span>
                    </div>
                    <p className="text-gray-700 text-sm font-medium">{reply.content}</p>
                    <div className="flex items-center gap-4 mt-1">
                        <button
                            onClick={() => setReplyingTo({ id: reply.id, type: 'reply' })}
                            className="text-xs text-primary hover:underline flex items-center gap-1 transition-colors font-bold"
                        >
                            <ChatBubbleLeftIcon className="w-3 h-3" />
                            Reply
                        </button>
                        {nestedReplies.length > 0 && (
                            <button
                                onClick={() => toggleReplyCollapse(reply.id)}
                                className="text-xs text-primary hover:underline flex items-center gap-1 transition-colors font-bold"
                            >
                                {isCollapsed ? (
                                    <>
                                        <ChevronDownIcon className="w-3 h-3" />
                                        Show {nestedReplies.length} {nestedReplies.length === 1 ? 'reply' : 'replies'}
                                    </>
                                ) : (
                                    <>
                                        <ChevronUpIcon className="w-3 h-3" />
                                        Hide {nestedReplies.length} {nestedReplies.length === 1 ? 'reply' : 'replies'}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Reply Form for this reply */}
            {replyingTo?.id === reply.id && (
                <div className="ml-11 flex gap-3">
                    <img
                        src={userImage || '/default-avatar.png'}
                        alt={userName || 'User'}
                        className="w-7 h-7 rounded-full"
                    />
                    <div className="flex-1">
                        <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write a reply..."
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 resize-none text-xs transition-all font-medium"
                            rows={2}
                            maxLength={500}
                            autoFocus
                        />
                        <div className="flex items-center gap-2 mt-2">
                            <button
                                onClick={() => handleSubmitReply(commentId, reply.id)}
                                disabled={submitting || !replyContent.trim()}
                                className="px-3 py-1.5 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50"
                            >
                                Reply
                            </button>
                            <button
                                onClick={() => {
                                    setReplyingTo(null)
                                    setReplyContent('')
                                }}
                                className="px-2 py-1 text-gray-500 text-xs font-bold hover:text-black transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Recursive Nested Replies */}
            {!isCollapsed && nestedReplies.length > 0 && (
                <div className="ml-11 space-y-3 border-l-2 border-gray-200 pl-4">
                    {nestedReplies.map((nested) => (
                        <ReplyItem
                            key={nested.id}
                            reply={nested}
                            commentId={commentId}
                            allReplies={allReplies}
                            replyingTo={replyingTo}
                            setReplyingTo={setReplyingTo}
                            replyContent={replyContent}
                            setReplyContent={setReplyContent}
                            handleSubmitReply={handleSubmitReply}
                            submitting={submitting}
                            userImage={userImage}
                            userName={userName}
                            collapsedReplies={collapsedReplies}
                            toggleReplyCollapse={toggleReplyCollapse}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default function CommentSection({ videoId }: CommentSectionProps) {
    const { data: session } = useSession()
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [replyingTo, setReplyingTo] = useState<{ id: string, type: 'comment' | 'reply' } | null>(null)
    const [replyContent, setReplyContent] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [collapsedComments, setCollapsedComments] = useState<Set<string>>(new Set())
    const [collapsedReplies, setCollapsedReplies] = useState<Set<string>>(new Set())
    const [isExpanded, setIsExpanded] = useState(false)

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
            const fetchedComments = Array.isArray(data) ? data : []
            setComments(fetchedComments)

            // Auto-collapse all comments and replies on initial load
            const commentIds = new Set<string>()
            const replyIds = new Set<string>()

            fetchedComments.forEach((comment: Comment) => {
                // Collapse all comments that have replies
                if (comment.replies && comment.replies.length > 0) {
                    commentIds.add(comment.id)
                }

                // Collapse all replies that have nested replies
                comment.replies?.forEach((reply: Reply) => {
                    const hasNestedReplies = comment.replies.some(r => r.parentId === reply.id)
                    if (hasNestedReplies) {
                        replyIds.add(reply.id)
                    }
                })
            })

            setCollapsedComments(commentIds)
            setCollapsedReplies(replyIds)
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

    const toggleCommentCollapse = (commentId: string) => {
        setCollapsedComments(prev => {
            const newSet = new Set(prev)
            if (newSet.has(commentId)) {
                newSet.delete(commentId)
            } else {
                newSet.add(commentId)
            }
            return newSet
        })
    }

    const toggleReplyCollapse = (replyId: string) => {
        setCollapsedReplies(prev => {
            const newSet = new Set(prev)
            if (newSet.has(replyId)) {
                newSet.delete(replyId)
            } else {
                newSet.add(replyId)
            }
            return newSet
        })
    }

    const user = session?.user as any

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-black text-black mb-6 flex items-center gap-2">
                <span>Comments</span>
                <span className="text-primary font-bold">({comments.length})</span>
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
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none transition-all font-medium"
                                rows={3}
                                maxLength={500}
                            />
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-sm text-gray-500 font-medium">
                                    {newComment.length}/500
                                </span>
                                <button
                                    type="submit"
                                    disabled={submitting || !newComment.trim()}
                                    className="px-6 py-2.5 bg-black text-white font-black rounded-xl hover:bg-gray-800 transition-all shadow-lg uppercase tracking-wider text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Posting...' : 'Comment'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-2xl text-center">
                    <p className="text-gray-700 font-bold">Sign in to leave a comment</p>
                </div>
            )}

            {/* Comments List with Fixed Height and Scrolling */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-12 text-gray-500 font-bold text-lg">
                    No comments yet. Be the first to comment!
                </div>
            ) : (
                <div>
                    {/* Scrollable Comments Container */}
                    <div
                        className={`space-y-6 transition-all duration-300 ${isExpanded
                            ? 'max-h-[600px] overflow-y-auto scrollbar-thin pr-2'
                            : 'max-h-[400px] overflow-hidden'
                            }`}
                    >
                        {comments.map((comment) => {
                            const isCommentCollapsed = collapsedComments.has(comment.id)
                            const topLevelReplies = comment.replies.filter(reply => !reply.parentId)

                            return (
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
                                                <span className="font-bold text-black">
                                                    {comment?.user?.name || 'Anonymous'}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {formatDate(comment.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-gray-700 font-medium mb-2">{comment.content}</p>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => setReplyingTo({ id: comment.id, type: 'comment' })}
                                                    className="text-sm text-primary hover:underline flex items-center gap-1 transition-colors font-bold"
                                                >
                                                    <ChatBubbleLeftIcon className="w-4 h-4" />
                                                    Reply
                                                </button>
                                                {topLevelReplies.length > 0 && (
                                                    <button
                                                        onClick={() => toggleCommentCollapse(comment.id)}
                                                        className="text-sm text-primary hover:underline flex items-center gap-1 transition-colors font-bold"
                                                    >
                                                        {isCommentCollapsed ? (
                                                            <>
                                                                <ChevronDownIcon className="w-4 h-4" />
                                                                Show {topLevelReplies.length} {topLevelReplies.length === 1 ? 'reply' : 'replies'}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ChevronUpIcon className="w-4 h-4" />
                                                                Hide {topLevelReplies.length} {topLevelReplies.length === 1 ? 'reply' : 'replies'}
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                                {user?.id === comment?.user?.id && (
                                                    <button
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                        className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1 font-bold"
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
                                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 resize-none text-sm transition-all font-medium"
                                                    rows={2}
                                                    maxLength={500}
                                                    autoFocus
                                                />
                                                <div className="flex items-center gap-2 mt-2">
                                                    <button
                                                        onClick={() => handleSubmitReply(comment.id)}
                                                        disabled={submitting || !replyContent.trim()}
                                                        className="px-4 py-1.5 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50"
                                                    >
                                                        Reply
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setReplyingTo(null)
                                                            setReplyContent('')
                                                        }}
                                                        className="px-3 py-1 text-gray-500 text-sm font-bold hover:text-black transition"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Replies Tree */}
                                    {!isCommentCollapsed && topLevelReplies.length > 0 && (
                                        <div className="ml-14 space-y-3">
                                            {topLevelReplies.map((reply) => (
                                                <ReplyItem
                                                    key={reply.id}
                                                    reply={reply}
                                                    commentId={comment.id}
                                                    allReplies={comment.replies}
                                                    replyingTo={replyingTo}
                                                    setReplyingTo={setReplyingTo}
                                                    replyContent={replyContent}
                                                    setReplyContent={setReplyContent}
                                                    handleSubmitReply={handleSubmitReply}
                                                    submitting={submitting}
                                                    userImage={user?.image || null}
                                                    userName={user?.name || null}
                                                    collapsedReplies={collapsedReplies}
                                                    toggleReplyCollapse={toggleReplyCollapse}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Show More/Less Button */}
                    <div className="mt-4 flex justify-center">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="px-8 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-black font-black rounded-xl transition-all flex items-center gap-2 uppercase tracking-wider text-sm shadow-sm"
                        >
                            {isExpanded ? (
                                <>
                                    <ChevronUpIcon className="w-5 h-5" />
                                    Show Less
                                </>
                            ) : (
                                <>
                                    <ChevronDownIcon className="w-5 h-5" />
                                    Show More
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
