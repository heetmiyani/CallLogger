import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import csv from 'csv-parser'

const prisma = new PrismaClient()

function normalize(code) {
  return String(code).trim()
}

async function readCSV() {
  const results = []

  return new Promise((resolve, reject) => {
    fs.createReadStream('public/clientsync.csv')
      .pipe(csv())
      .on('data', (data) => {
        results.push({
          clientCode: normalize(data.clientCode),
          clientName: data.clientName.trim(),
          phoneNumber: data.phoneNumber.trim()
        })
      })
      .on('end', () => resolve(results))
      .on('error', reject)
  })
}

async function main() {

  console.log("📥 Reading CSV...")
  const csvClients = await readCSV()

  console.log(`CSV Clients: ${csvClients.length}`)

  console.log("📊 Fetching existing clients...")
  const dbClients = await prisma.client.findMany()

  console.log(`DB Clients: ${dbClients.length}`)

  const dbMap = new Map()
  dbClients.forEach(c => {
    dbMap.set(normalize(c.clientCode), c)
  })

  const csvMap = new Map()
  csvClients.forEach(c => {
    csvMap.set(normalize(c.clientCode), c)
  })

  const toCreate = []
  const toUpdate = []
  const toDelete = []

  /* =========================
     CHECK CREATE / UPDATE
  ========================= */

  for (const client of csvClients) {

    const code = normalize(client.clientCode)

    if (dbMap.has(code)) {
      toUpdate.push(client)
    } else {
      toCreate.push(client)
    }
  }

  /* =========================
     CHECK DELETE
  ========================= */

  for (const client of dbClients) {

    const code = normalize(client.clientCode)

    if (!csvMap.has(code)) {
      toDelete.push(code)
    }
  }

  console.log(`New Clients: ${toCreate.length}`)
  console.log(`Updated Clients: ${toUpdate.length}`)
  console.log(`Deleted Clients: ${toDelete.length}`)

  /* =========================
     CREATE
  ========================= */

  if (toCreate.length) {
    await prisma.client.createMany({
      data: toCreate,
      skipDuplicates: true
    })
  }

  /* =========================
     UPDATE
  ========================= */

  await Promise.all(
    toUpdate.map(client =>
      prisma.client.update({
        where: { clientCode: client.clientCode },
        data: {
          clientName: client.clientName,
          phoneNumber: client.phoneNumber
        }
      })
    )
  )

  /* =========================
     DELETE
  ========================= */

  if (toDelete.length) {
    await prisma.client.deleteMany({
      where: {
        clientCode: {
          in: toDelete
        }
      }
    })
  }

  const finalCount = await prisma.client.count()

  console.log(`✅ Final DB Count: ${finalCount}`)
  console.log(`📄 CSV Count: ${csvClients.length}`)

  if (finalCount === csvClients.length) {
    console.log("🎉 DB and CSV are now perfectly synced")
  } else {
    console.log("⚠️ Count mismatch detected")
  }

}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })