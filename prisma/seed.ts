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

async function seedHackers() {
  const hackerSeed: Prisma.HackerCreateInput[] = [{
    email: "hacker@test.com",
    birthDate: "01/01/1980",
    country: 'US',
    ethnicities: "Asian",
    gender: "PreferNot",
    firstName: "Test",
    lastName: "Hacker",
    major: "Computer Science",
    phone: "1112223333",
    emailVerified: false,
    school: "University of Cincinnati",
    shirtSize: "Large",
    auth: {
      create: {
        email: "hacker@test.com",
        role: "HACKER",
      }
    }
  }]

  for (const h of hackerSeed) {
    const created = await prisma.hacker.upsert({
      where: { email: h.email },
      update: h,
      create: h
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