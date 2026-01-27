export default function Loading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-primary-950 to-gray-900 p-4 sm:p-6 lg:p-8">
            <main className="max-w-7xl mx-auto pb-20">
                <div className="mb-12 space-y-4 border-b border-white/5 pb-10">
                    <div className="h-4 bg-white/5 rounded-full w-32 animate-pulse"></div>
                    <div className="h-12 bg-white/5 rounded-2xl w-2/3 animate-pulse"></div>
                    <div className="h-6 bg-white/5 rounded-xl w-1/2 animate-pulse"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="space-y-4 animate-pulse">
                            <div className="aspect-video bg-white/5 rounded-2xl"></div>
                            <div className="space-y-2">
                                <div className="h-4 bg-white/5 rounded-full w-3/4"></div>
                                <div className="h-3 bg-white/5 rounded-full w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}
