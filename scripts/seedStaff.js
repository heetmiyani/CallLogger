import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.staff.create({
    data: {
      name: 'Heet Miyani',
      email: 'heetmiyani210@gmail.com',
      password: 'Heet1234',
      role: 'admin',
    },
  });

  console.log("Admin created");
}

main();