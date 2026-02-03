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
        <div className="pt-6 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 bg-white dark:bg-transparent">
            <main className="max-w-6xl mx-auto pt-10 pb-16">
                <div className="text-center mb-16 border-b border-gray-200 dark:border-white/10 pb-12">
                    <h1 className="text-6xl font-black text-black dark:text-white mb-4 uppercase tracking-tight">Choose Your Plan</h1>
                    <p className="text-xl text-gray-700 dark:text-gray-400 font-medium">Unlock exclusive high-fidelity content and elite features</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Plan */}
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-10 border border-gray-200 dark:border-white/10 shadow-sm">
                        <h3 className="text-2xl font-black text-black dark:text-white mb-2 uppercase tracking-tight">Free</h3>
                        <div className="text-6xl font-black text-black dark:text-white mb-8 flex items-baseline">
                            $0<span className="text-lg text-gray-500 dark:text-gray-400 font-bold ml-1">/month</span>
                        </div>
                        <ul className="space-y-5 mb-10">
                            {[
                                'Watch trailers of premium videos',
                                'Full access to free videos',
                                'Free shorts only',
                                'Watch history tracking',
                                'Basic analytics',
                            ].map((feature, i) => (
                                <li key={i} className="flex items-start text-gray-700 dark:text-gray-300 font-bold text-sm">
                                    <CheckIcon className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <button
                            disabled
                            className="w-full py-4 px-6 bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 font-black rounded-2xl cursor-not-allowed uppercase tracking-widest text-xs"
                        >
                            Current Plan
                        </button>
                    </div>

                    {/* Premium Plan */}
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-10 border-2 border-primary relative shadow-xl transform scale-105">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-black dark:bg-white text-white dark:text-black px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                            RECOMMENDED
                        </div>
                        <h3 className="text-2xl font-black text-black dark:text-white mb-2 uppercase tracking-tight">Premium</h3>
                        <div className="text-6xl font-black text-black dark:text-white mb-8 flex items-baseline line-clamp-1">
                            $9.99<span className="text-lg text-gray-500 dark:text-gray-400 font-bold ml-1">/month</span>
                        </div>
                        <ul className="space-y-5 mb-10">
                            {[
                                'Full access to ALL premium videos',
                                'All free content included',
                                'Premium + free shorts feed',
                                'Advanced analytics',
                                'Watch history tracking',
                                'Cancel anytime',
                            ].map((feature, i) => (
                                <li key={i} className="flex items-start text-gray-700 dark:text-gray-300 font-bold text-sm">
                                    <CheckIcon className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={handleSubscribe}
                            disabled={loading || user?.subscriptionStatus === 'ACTIVE'}
                            className="w-full py-4 px-6 bg-black dark:bg-white text-white dark:text-black font-black rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-[0_12px_30px_-5px_rgba(0,0,0,0.3)] dark:shadow-[0_12px_30px_-5px_rgba(255,255,255,0.1)] uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing...' : user?.subscriptionStatus === 'ACTIVE' ? 'Current Plan' : 'Subscribe Now'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}
