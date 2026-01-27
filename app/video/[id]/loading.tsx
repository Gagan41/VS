export default function Loading() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <main className="max-w-6xl mx-auto py-8">
                <div className="glass rounded-2xl overflow-hidden animate-pulse">
                    <div className="aspect-video bg-white/5"></div>
                    <div className="p-6 space-y-6">
                        <div className="space-y-3">
                            <div className="h-10 bg-white/5 rounded-xl w-3/4"></div>
                            <div className="h-6 bg-white/5 rounded-lg w-1/4"></div>
                        </div>
                        <div className="flex gap-4">
                            <div className="h-10 bg-white/5 rounded-full w-32"></div>
                            <div className="h-10 bg-white/5 rounded-full w-32"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 bg-white/5 rounded-full w-full"></div>
                            <div className="h-4 bg-white/5 rounded-full w-full"></div>
                            <div className="h-4 bg-white/5 rounded-full w-2/3"></div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
