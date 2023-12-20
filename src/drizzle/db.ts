import * as schema from './schema'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

let db: ReturnType<typeof drizzle>

declare global {
  // eslint-disable-next-line no-var
  var __drizzle: ReturnType<typeof drizzle<typeof schema>> | undefined
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
if (process.env.NODE_ENV === 'production') {
  db = drizzle(postgres(process.env.DATABASE_URL!))
} else {
  if (!global.__drizzle) {
    global.__drizzle = drizzle(postgres(process.env.DATABASE_URL!), { schema: schema })
  }
  db = global.__drizzle
}

export { db }
