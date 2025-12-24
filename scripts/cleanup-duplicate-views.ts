import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting duplicate views cleanup...')

    // Find all userId-videoId pairs that have more than 1 view
    const duplicates = await prisma.$queryRaw`
        SELECT "userId", "videoId", COUNT(*)
        FROM "View"
        WHERE "userId" IS NOT NULL
        GROUP BY "userId", "videoId"
        HAVING COUNT(*) > 1
    ` as any[]

    console.log(`Found ${duplicates.length} sets of duplicates.`)

    for (const dup of duplicates) {
        // For each set of duplicates, find all but the first one
        const views = await prisma.view.findMany({
            where: {
                userId: dup.userId,
                videoId: dup.videoId
            },
            orderBy: {
                viewedAt: 'asc'
            }
        })

        const idsToDelete = views.slice(1).map(v => v.id)

        await prisma.view.deleteMany({
            where: {
                id: {
                    in: idsToDelete
                }
            }
        })
    }

    console.log('Cleanup finished successfully.')
}

main()
    .catch((e) => {
        console.error('Error cleaning up duplicates:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
