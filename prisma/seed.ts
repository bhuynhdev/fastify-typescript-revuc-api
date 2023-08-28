import { AuthRecord, Hacker, Prisma, PrismaClient } from '@prisma/client'
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function seedAdmin() {
  const adminSeed: Prisma.AdminCreateInput[] = [
    {
      username: "acmatuc",
      password: await bcrypt.hash("Seed_Pa55w_rd", 10)
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

async function seedHackers() {
  type HackerSeed = Omit<Hacker, "id" | "isMinor"> & { auth: Omit<AuthRecord, "id" | "password"> }
  const hackerSeeds: HackerSeed[] = [{
    birthDate: "01/01/1980",
    country: 'US',
    ethnicities: "Asian",
    gender: "PreferNot",
    firstName: "Test",
    lastName: "Hacker",
    major: "Computer Science",
    phone: "1112223333",
    school: "University of Cincinnati",
    shirtSize: "Large",
    howHeard: [],
    auth: {
      email: "hacker@test.com",
      role: "HACKER",
      emailVerified: false,
      checkedIn: false
    }
  }]

  for (const h of hackerSeeds) {
    // Find if hacker exists yet
    const authRecord = await prisma.authRecord.findFirst({ where: { email: h.auth?.email } })

    const created = await prisma.hacker.upsert({
      where: { id: authRecord?.id || "" },
      update: { ...h, auth: { update: { ...h.auth } } },
      create: { ...h, auth: { create: { ...h.auth } } }
    })
    console.log(`Created hacker with id: ${created.id}`)
  }
  console.log(`Seeding hacker finished.`)
}

async function main() {
  await seedAdmin();
  await seedHackers();
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