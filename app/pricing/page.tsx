'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { CheckIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function PricingPage() {
    const { data: session } = useSession()
    const [loading, setLoading] = useState(false)
    const user = session?.user as any

    const handleSubscribe = async () => {
        if (!session) {
            window.location.href = '/auth/login'
            return
        }

        setLoading(true)
        try {
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })

            const { url } = await response.json()
            if (url) {
                window.location.href = url
            }
        } catch (error) {
            console.error('Error creating checkout session:', error)
            toast.error('Failed to start checkout')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <main className="max-w-6xl mx-auto py-16">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-white mb-4">Choose Your Plan</h1>
                    <p className="text-xl text-gray-300">Unlock premium content and exclusive features</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Plan */}
                    <div className="glass rounded-2xl p-8">
                        <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
                        <div className="text-5xl font-bold text-white mb-6">
                            $0<span className="text-lg text-gray-300">/month</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            {[
                                'Watch trailers of premium videos',
                                'Full access to free videos',
                                'Free shorts only',
                                'Watch history tracking',
                                'Basic analytics',
                            ].map((feature, i) => (
                                <li key={i} className="flex items-start text-gray-300">
                                    <CheckIcon className="w-6 h-6 text-green-400 mr-2 flex-shrink-0" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <button
                            disabled
                            className="w-full py-3 px-4 bg-white/10 text-gray-400 font-semibold rounded-lg cursor-not-allowed"
                        >
                            Current Plan
                        </button>
                    </div>

                    {/* Premium Plan */}
                    <div className="glass rounded-2xl p-8 border-2 border-purple-500 relative">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                            RECOMMENDED
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
                        <div className="text-5xl font-bold text-white mb-6">
                            $9.99<span className="text-lg text-gray-300">/month</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            {[
                                'Full access to ALL premium videos',
                                'All free content included',
                                'Premium + free shorts feed',
                                'Advanced analytics',
                                'Watch history tracking',
                                'Cancel anytime',
                            ].map((feature, i) => (
                                <li key={i} className="flex items-start text-gray-300">
                                    <CheckIcon className="w-6 h-6 text-green-400 mr-2 flex-shrink-0" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={handleSubscribe}
                            disabled={loading || user?.subscriptionStatus === 'ACTIVE'}
                            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Loading...' : user?.subscriptionStatus === 'ACTIVE' ? 'Current Plan' : 'Subscribe Now'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}
