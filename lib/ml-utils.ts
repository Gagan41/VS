/**
 * Machine Learning Utilities for Video Recommendations
 */

/**
 * Calculates the cosine similarity between two vectors.
 * Higher value (up to 1.0) means higher similarity.
 */
export function cosineSimilarity(vecA: Record<string, number>, vecB: Record<string, number>): number {
    const commonUsers = Object.keys(vecA).filter(userId => vecB[userId] !== undefined)

    if (commonUsers.length === 0) return 0

    let dotProduct = 0
    let magA = 0
    let magB = 0

    // We only consider common users for the dot product, 
    // but full vectors for magnitudes to penalize niche differences
    for (const userId in vecA) magA += Math.pow(vecA[userId], 2)
    for (const userId in vecB) magB += Math.pow(vecB[userId], 2)
    for (const userId of commonUsers) dotProduct += vecA[userId] * vecB[userId]

    const magnitude = Math.sqrt(magA) * Math.sqrt(magB)
    return magnitude === 0 ? 0 : dotProduct / magnitude
}

/**
 * Calculates a score for a video interaction based on various signals.
 */
export function calculateInteractionScore(interaction: {
    viewed?: boolean
    liked?: boolean
    watched?: boolean
    completed?: boolean
    disliked?: boolean
    skipped?: boolean
}): number {
    let score = 0
    if (interaction.viewed) score += 1
    if (interaction.liked) score += 5
    if (interaction.watched) score += 3    // > 50% watched
    if (interaction.completed) score += 10 // > 90% watched
    if (interaction.disliked) score -= 5
    if (interaction.skipped) score -= 2    // < 10% watched
    return score
}
