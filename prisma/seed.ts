import { PrismaClient, Prisma } from '@prisma/client'
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function seedAdmin() {
  const adminSeed: Prisma.AdminCreateInput[] = [
    {
      username: "acmatuc",
      password: await bcrypt.hash("Pa55w_rd", 10)
    },
  ]
  console.log(`Start seeding admin...`)
  for (const a of adminSeed) {
    const created = await prisma.admin.upsert({
      where: { username: a.username },
      update: { password: a.password },
      create: { username: a.username, password: a.password }
    })
    console.log(`Created admin with id: ${created.id}`)
  }
  console.log(`Seeding amdin finished.`)
}

async function main() {
  await seedAdmin()
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })