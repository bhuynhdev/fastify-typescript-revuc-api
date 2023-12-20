import { defineConfig } from 'drizzle-kit'

import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

export default defineConfig({
	schema: 'src/drizzle/schema.ts',
	driver: 'pg',
	dbCredentials: {
		connectionString: process.env.DATABASE_URL,
		ssl: process.env.NODE_ENV === 'production',
	},
	verbose: true,
	strict: true,
})
