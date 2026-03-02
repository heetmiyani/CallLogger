import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('Heet1234', 10)

  await prisma.staff.create({
    data: {
      name: 'Heet Miyani',
      email: 'heetmiyani210@gmail.com',
      password: hashedPassword,
      role: 'admin',
    },
  })

  console.log('Admin created with hashed password')
}

main()
  .catch((e) => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })