import { relations, sql } from 'drizzle-orm'
import { pgTable, text, boolean, uuid, pgEnum, varchar, serial } from 'drizzle-orm/pg-core'

export const roleEnum = pgEnum('role', ['HACKER', 'JUDGE', 'SPONSOR'])
export const genderEnum = pgEnum('gender', ['Male', 'Female', 'Nonbinary', 'Other', 'PreferNot'])
export const shirtSizeEnum = pgEnum('shirt_size', ['XSmall', 'Small', 'Medium', 'Large', 'XLarge', '2XLarge'])

export const identity = pgTable('indentity_record', {
	id: uuid('id').primaryKey().default(sql`gen_random_uuid()`), // prettier-ignore
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').default(false).notNull(),
	password: text('password').default('SENTIENT_VALUE').notNull(),
	checkedIn: boolean('checked_in').default(false).notNull(),
	role: roleEnum('role').notNull(),
})

export const hacker = pgTable('hacker', {
	id: uuid('id').primaryKey().default(sql`gen_random_uuid()`), // prettier-ignore
	identityId: uuid('identity_id')
		.references(() => identity.id, { onDelete: 'cascade' })
		.notNull(),
	firstName: text('first_name').notNull(),
	lastName: text('lastName').notNull(),
	phone: varchar('phone', { length: 20 }).notNull(),
	birthDate: varchar('birth_date', { length: 255 }).notNull(),
	isMinor: boolean('is_minor').default(false).notNull(),
	country: varchar('country', { length: 255 }).notNull(),
	school: text('school').notNull(),
	major: text('major').notNull(),
	howHeard: text('how_heard').array().default('{}' as unknown as []).notNull(), // prettier-ignore
	gender: genderEnum('gender').notNull(),
	shirtSize: shirtSizeEnum('shirt_size').notNull(),
	ethnicities: varchar('ethnicities', { length: 255 }).array().default('{}' as unknown as []).notNull(), // prettier-ignore
})

export const hackerRelations = relations(hacker, ({ one }) => ({
	identity: one(identity, { fields: [hacker.identityId], references: [identity.id] }),
}))

export const judge = pgTable('judge', {
	id: uuid('id').primaryKey().default(sql`gen_random_uuid()`), // prettier-ignore
	identityId: uuid('identity_id')
		.references(() => identity.id)
		.notNull(),
	name: text('name').notNull(),
	category: text('category'),
	company: text('company'),
})

export const judgeRelations = relations(judge, ({ one }) => ({
	identity: one(identity, { fields: [judge.identityId], references: [identity.id] }),
}))

export const sponsor = pgTable('sponsor', {
	id: uuid('id').primaryKey().default(sql`gen_random_uuid()`), // prettier-ignore
	identityId: uuid('identity_id')
		.references(() => identity.id)
		.notNull(),
	name: text('name').notNull(),
	company: text('company').notNull(),
})

export const sponsorRelations = relations(sponsor, ({ one }) => ({
	identity: one(identity, { fields: [sponsor.identityId], references: [identity.id] }),
}))

export const admin = pgTable('admin', {
	id: serial('id').primaryKey(),
	username: varchar('username', { length: 255 }).notNull().unique(),
	password: text('password').notNull(),
})

export type Identity = typeof identity.$inferSelect
export type IdentityInsertInput = typeof identity.$inferInsert
export type Hacker = typeof hacker.$inferSelect
export type HackerInsertInput = typeof hacker.$inferInsert
export type Judge = typeof judge.$inferSelect
export type JudgeInsertInput = typeof judge.$inferInsert
export type Sponsor = typeof sponsor.$inferSelect
export type SponsorInsertInput = typeof sponsor.$inferInsert
export type Admin = typeof admin.$inferSelect
export type AdminInsertInput = typeof admin.$inferInsert

export type Role = (typeof roleEnum.enumValues)[number]
