import Prisma from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const prismaClientSingleton = () => {
  // Create PostgreSQL connection pool
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL
  })
  
  // Create Prisma adapter for PostgreSQL
  const adapter = new PrismaPg(pool)
  
  // Initialize Prisma Client with the adapter
  return new Prisma.PrismaClient({ adapter })
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
