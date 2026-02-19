import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import csv from 'csv-parser'

const prisma = new PrismaClient()

const results = []

async function importData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream('public/clients.csv')
      .pipe(csv())
      .on('data', (data) => {
        results.push({
          clientCode: data.clientCode,
          clientName: data.clientName,
          phoneNumber: data.phoneNumber
        })
      })
      .on('end', resolve)
      .on('error', reject)
  })
}

async function main() {
  await importData()

  await prisma.client.createMany({
    data: results,
    skipDuplicates: true
  })

  console.log("✅ Data imported successfully")
}

main()
  .catch(e => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
