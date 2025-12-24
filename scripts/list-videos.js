const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const videos = await prisma.video.findMany({
        take: 5,
        select: {
            id: true,
            title: true,
            videoUrl: true,
            accessType: true,
            trailerDurationSeconds: true
        }
    })
    console.log(JSON.stringify(videos, null, 2))
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
