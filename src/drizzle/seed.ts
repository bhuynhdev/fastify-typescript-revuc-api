import 'dotenv/config'
import bcrypt from 'bcrypt'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
import { AdminInsertInput, HackerInsertInput, Identity, admin, hacker, identity } from './schema'

if (!('DATABASE_URL' in process.env)) throw new Error('DATABASE_URL not found on .env')

const client = postgres(process.env.DATABASE_URL!)
const db = drizzle(client, { schema: schema })

async function seedAdmin() {
	const adminSeed: AdminInsertInput[] = [
		{
			username: 'acmatuc',
			password: await bcrypt.hash('Seed_Pa55w_rd', 10),
		},
	]
	console.log(`Start seeding admin...`)
	const created = await db
		.insert(admin)
		.values(adminSeed)
		.onConflictDoUpdate({
			target: admin.username,
			set: { password: sql`EXCLUDED.password` },
		})
		.returning()

	created.forEach((a) => console.log(`Created admin with id: ${a.id}`))
	console.log(`Seeding amdin finished.`)
}

async function seedHackers() {
	type HackerSeed = Omit<HackerInsertInput, 'identityId'> & { identity: Omit<Identity, 'id' | 'password'> }
	const hackerSeeds: HackerSeed[] = [
		{
			birthDate: '01/01/1980',
			country: 'US',
			ethnicities: ['Asian'],
			gender: 'PreferNot',
			firstName: 'Test',
			lastName: 'Hacker',
			major: 'Computer Science',
			phone: '1112223333',
			school: 'University of Cincinnati',
			shirtSize: 'Large',
			howHeard: [],
			identity: {
				email: 'hacker@test.com',
				role: 'HACKER',
				emailVerified: false,
				checkedIn: false,
			},
		},
		{
			birthDate: '02/02/2016',
			country: 'US',
			ethnicities: ['Asian'],
			gender: 'Male',
			firstName: 'Test2',
			lastName: 'Hacker',
			major: 'Computer Engineering',
			phone: '3332221111',
			school: 'Ohio State University',
			shirtSize: '2XLarge',
			howHeard: [],
			identity: {
				email: 'hacker2@test.com',
				role: 'HACKER',
				emailVerified: false,
				checkedIn: false,
			},
		},
	]

	console.log("Start seeding hackers...")
	for (const h of hackerSeeds) {
		await db.transaction(async (tx) => {
			// Create or Find new Identity
			const [identityRecord] = await tx
				.insert(identity)
				.values(h.identity)
				.onConflictDoNothing({ target: identity.email })
				.returning()

			if (identityRecord) {
				const [newHacker] = await tx
					.insert(hacker)
					.values({ ...h, identityId: identityRecord.id })
					.returning()

				console.log(`Created hacker with id: ${newHacker.id}`)
			} else {
				console.log(`Hacker ${h.identity.email} already existed`)
			}
		})
	}
	console.log(`Seeding hacker finished.`)
}

const main = async () => {
	await seedAdmin()
	await seedHackers()
}

main()
	.then(async () => await client.end())
	.catch(async (e) => {
		console.error(e)
		await client.end()
		process.exit(1)
	})
