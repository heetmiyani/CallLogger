import { PrismaClient } from '@prisma/client'

/* =========================
   SAFE PRISMA INSTANCE
========================= */

let prisma

if (!global.prisma) {
  global.prisma = new PrismaClient()
}

prisma = global.prisma

/* =========================
   HANDLER
========================= */

export default async function handler(req, res) {
  try {
    /* =========================
       GET CALL LOGS
    ========================= */
    if (req.method === 'GET') {
      const { staffId } = req.query

      const whereClause = {}

      if (staffId !== undefined) {
        const parsedStaffId = Number(staffId)

        if (!Number.isInteger(parsedStaffId)) {
          return res.status(400).json({
            error: 'Invalid staffId',
          })
        }

        whereClause.staffId = parsedStaffId
      }

      const logs = await prisma.callLog.findMany({
        where: whereClause,
        include: {
          client: true,
          staff: true,
        },
        orderBy: {
          dateTime: 'desc',
        },
      })

      return res.status(200).json(logs)
    }

    /* =========================
       CREATE CALL LOG
    ========================= */
    if (req.method === 'POST') {
      const {
        clientId,
        staffId,
        callRegarding,
        status,
        interestStatus,
        reminderDays,
        response,
      } = req.body

      // Required validation (do NOT use !clientId because 0 is falsy)
      if (
        clientId === undefined ||
        staffId === undefined ||
        !callRegarding ||
        !status ||
        !interestStatus
      ) {
        return res.status(400).json({
          error: 'Missing required fields',
        })
      }

      const parsedClientId = Number(clientId)
      const parsedStaffId = Number(staffId)

      if (
        !Number.isInteger(parsedClientId) ||
        !Number.isInteger(parsedStaffId)
      ) {
        return res.status(400).json({
          error: 'Invalid clientId or staffId',
        })
      }

      // Business rule:
      // Only allow reminderDays when Interested
      let finalReminderDays = null

      if (
        interestStatus === 'Interested' &&
        reminderDays != null
      ) {
        const parsedReminder = Number(reminderDays)

        if (Number.isInteger(parsedReminder) && parsedReminder > 0) {
          finalReminderDays = parsedReminder
        }
      }

      const newLog = await prisma.callLog.create({
        data: {
          clientId: parsedClientId,
          staffId: parsedStaffId,
          callRegarding,
          status,
          interestStatus,
          reminderDays: finalReminderDays,
          response: response ?? null,
          dateTime: new Date(),
        },
        include: {
          client: true,
          staff: true,
        },
      })

      return res.status(201).json(newLog)
    }

    /* ========================= */

    return res.status(405).json({
      error: 'Method not allowed',
    })
  } catch (error) {
    console.error('Call Logs API Error:', error)

    return res.status(500).json({
      error: 'Internal server error',
    })
  }
}