/**
 * A/B Testing Utility
 */

type Variant = 'control' | 'variant_a' | 'variant_b'

interface Experiment {
    id: string
    variants: {
        control: number    // % of users
        variant_a: number  // % of users
        variant_b: number  // % of users
    }
    active: boolean
}

const EXPERIMENTS: Record<string, Experiment> = {
    thumbnail_size: {
        id: 'thumbnail_size',
        variants: { control: 34, variant_a: 33, variant_b: 33 },
        active: true
    },
    card_layout: {
        id: 'card_layout',
        variants: { control: 50, variant_a: 50, variant_b: 0 },
        active: true
    }
}

/**
 * Deterministically assigns a variant to a user based on their ID.
 * If no userId is provided (guest), it uses a random assignment.
 */
export function getVariant(experimentId: string, userId?: string): Variant {
    const experiment = EXPERIMENTS[experimentId]
    if (!experiment || !experiment.active) return 'control'

    let hashVal = 0
    if (userId) {
        // Stable hashing for logged-in users
        const str = `${experimentId}-${userId}`
        for (let i = 0; i < str.length; i++) {
            hashVal = ((hashVal << 5) - hashVal) + str.charCodeAt(i)
            hashVal = hashVal & hashVal // Convert to 32bit integer
        }
        hashVal = Math.abs(hashVal)
    } else {
        // Random for guests (persists during session if stored in state/cookie)
        hashVal = Math.floor(Math.random() * 1000)
    }

    const rand = hashVal % 100

    if (rand < experiment.variants.control) return 'control'
    if (rand < experiment.variants.control + experiment.variants.variant_a) return 'variant_a'
    return 'variant_b'
}

/**
 * Tracks an A/B test event to the analytics API.
 */
export async function trackExperimentEvent(params: {
    experimentId: string
    variant: string
    action: 'impression' | 'click' | 'watch'
    userId?: string
    videoId?: string
}) {
    try {
        await fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        })
    } catch (error) {
        console.error('Error tracking experiment event:', error)
    }
}
